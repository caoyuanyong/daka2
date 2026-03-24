"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApp } from './useAppContext';

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
          // 1. Fetch habits from API
          const habitsRes = await fetch(`/api/habits?userId=${user.id}`);
          let dbHabits = await habitsRes.json();

          // 2. Migration for habits (Only if API failed and we have local backup)
          if (!habitsRes.ok) {
            const savedHabits = localStorage.getItem(`bj_habits_${user.id}`);
            if (savedHabits) {
              const habitsToMigrate = JSON.parse(savedHabits);
              const migratedHabits = [];
              for (const h of habitsToMigrate) {
                const res = await fetch('/api/habits', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...h, userId: user.id })
                });
                if (res.ok) migratedHabits.push(await res.json());
              }
              dbHabits = migratedHabits;
            }
          }
          setHabits(Array.isArray(dbHabits) ? dbHabits : []);

          // 3. Fetch records from API
          const recordsRes = await fetch(`/api/records?userId=${user.id}`);
          let dbRecords = await recordsRes.json();

          // 4. Migration for Records (Optional, only if API failed)
          if (!recordsRes.ok) {
            const savedRecords = localStorage.getItem(`bj_habit_records_${user.id}`);
            if (savedRecords) {
              const recordsToMigrate = JSON.parse(savedRecords);
              const migratedRecords = [];
              for (const r of recordsToMigrate) {
                const res = await fetch('/api/records', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...r, userId: user.id })
                });
                if (res.ok) migratedRecords.push(await res.json());
              }
              dbRecords = migratedRecords;
            }
          }
          setRecords(dbRecords);
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
      }
    } catch (error) {
      console.error('Add habit error:', error);
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
      }
    } catch (error) {
      console.error('Update habit error:', error);
    }
  };

  const deleteHabit = async (id) => {
    try {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHabits(prev => prev.filter(h => h.id !== id));
      }
    } catch (error) {
      console.error('Delete habit error:', error);
    }
  };

  const checkIn = async (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = selectedDate || new Date().toISOString().split('T')[0];
    const habitRecordsToday = records.filter(r => r.habitId === habitId && r.date === today);

    if (habit.type === 'daily' && habitRecordsToday.length >= 1) {
      alert('当日已完成该习惯');
      return false;
    }
    if (habit.type === 'daily_multiple' && habitRecordsToday.length >= habit.maxTimes) {
      alert('当日次数已达上限');
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
        return true;
      }
    } catch (error) {
      console.error('Check-in error:', error);
    }
    return false;
  };

  const getStats = () => {
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
  };

  return (
    <HabitsContext.Provider value={{
      habits,
      records,
      selectedDate,
      addHabit,
      updateHabit,
      deleteHabit,
      checkIn,
      getStats,
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
