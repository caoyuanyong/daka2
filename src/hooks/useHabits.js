"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useApp } from './useAppContext';
import { migrateLocalData } from '@/utils/migration';
import { toast } from 'react-hot-toast';

const HabitsContext = createContext();

export function HabitsProvider({ children }) {
  const { user, addPoints, isInitialized: appInitialized, selectedDate } = useApp();
  const [habits, setHabits] = useState([]);
  const [records, setRecords] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from API and Migration
  useEffect(() => {
    if (appInitialized && user?.id) {
      const loadHabitsData = async () => {
        setIsInitialized(false);
        try {
          // 1. Fetch habits and records in parallel
          const [habitsRes, recordsRes] = await Promise.all([
            fetch(`/api/habits?userId=${user.id}`),
            fetch(`/api/records?userId=${user.id}`)
          ]);

          let dbHabits = await habitsRes.json();
          let dbRecords = await recordsRes.json();

          // 2. Conditional Migration
          if (!habitsRes.ok) {
            const migrated = await migrateLocalData(`bj_habits_${user.id}`, '/api/habits', user.id);
            if (migrated) dbHabits = migrated;
          }
          
          if (!recordsRes.ok) {
            const migrated = await migrateLocalData(`bj_habit_records_${user.id}`, '/api/records', user.id);
            if (migrated) dbRecords = migrated;
          }

          setHabits(Array.isArray(dbHabits) ? dbHabits : []);
          setRecords(Array.isArray(dbRecords) ? dbRecords : []);
          setIsInitialized(true);
        } catch (error) {
          console.error('Load habits error:', error);
          setIsInitialized(true);
        }
      };

      loadHabitsData();
    }
  }, [user?.id, appInitialized]);

  const addHabit = async (habitData) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...habitData, userId: user.id })
      });
      if (res.ok) {
        const newHabit = await res.json();
        setHabits(prev => [newHabit, ...prev]);
        toast.success(`习惯 "${newHabit.title}" 已创建`);
      }
    } catch (error) {
      console.error('Add habit error:', error);
      toast.error('创建习惯失败');
    }
  };

  const updateHabit = async (updatedHabit) => {
    try {
      const res = await fetch(`/api/habits/${updatedHabit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedHabit)
      });
      if (res.ok) {
        setHabits(prev => prev.map(h => h.id === updatedHabit.id ? updatedHabit : h));
        toast.success('习惯已更新');
      }
    } catch (error) {
      console.error('Update habit error:', error);
      toast.error('更新失败');
    }
  };

  const deleteHabit = async (id) => {
    try {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHabits(prev => prev.filter(h => h.id !== id));
        toast.success('习惯已删除');
      }
    } catch (error) {
      console.error('Delete habit error:', error);
    }
  };

  const checkIn = async (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return false;

    const today = selectedDate || new Date().toISOString().split('T')[0];
    const habitRecordsToday = records.filter(r => r.habitId === habitId && r.date === today);

    if (habit.type === 'daily' && habitRecordsToday.length >= 1) {
      toast.error('当日已完成该习惯');
      return false;
    }
    if (habit.type === 'daily_multiple' && habitRecordsToday.length >= habit.maxTimes) {
      toast.error('当日次数已达上限');
      return false;
    }

    const recordData = {
      habitId,
      date: today,
      timestamp: new Date().toISOString(),
      pointsChange: habit.points,
      userId: user.id
    };

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      });
      if (res.ok) {
        const newRecord = await res.json();
        setRecords(prev => [newRecord, ...prev]);
        addPoints(habit.points);
        toast.success(`打卡成功！获得 ${habit.points} 星星`);
        return true;
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('打卡失败，请重试');
    }
    return false;
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === today);
    const totalPointsFromHabits = records.reduce((sum, r) => sum + r.pointsChange, 0);
    const positiveCheckIns = records.filter(r => r.pointsChange > 0).length;
    const negativeCheckIns = records.filter(r => r.pointsChange < 0).length;

    return {
      totalCheckIns: records.length,
      todayCheckIns: todayRecords.length,
      totalPointsFromHabits,
      positiveCheckIns,
      negativeCheckIns,
      habitCount: habits.length
    };
  }, [habits, records]);

  return (
    <HabitsContext.Provider value={{
      habits,
      records,
      selectedDate,
      addHabit,
      updateHabit,
      deleteHabit,
      checkIn,
      getStats: () => stats, // Maintain compatibility but use memoized value
      stats,
      isInitialized
    }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) throw new Error('useHabits must be used within a HabitsProvider');
  return context;
}
