"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useApp } from './useAppContext';
import { getEbbinghausDates } from '@/utils/ebbinghaus';
import { migrateLocalData } from '@/utils/migration';
import { toast } from 'react-hot-toast';

const LearningContext = createContext();

export function LearningProvider({ children }) {
  const { user, isInitialized: appInitialized, addPoints, selectedDate, setSelectedDate } = useApp();
  const [plans, setPlans] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load plans from API and Migration
  useEffect(() => {
    if (appInitialized && user?.id) {
      const loadPlansData = async () => {
        setIsInitialized(false);
        try {
          const res = await fetch(`/api/plans?userId=${user.id}`);
          let dbPlans = await res.json();

          // 2. Migration: Only if API failed and we have local backup
          if (!res.ok) {
            const migrated = await migrateLocalData(`bj_plans_${user.id}`, '/api/plans', user.id, (p) => ({ ...p, userId: user.id }));
            if (migrated) {
              // Re-fetch to get correctly initialized database state
              const reFetch = await fetch(`/api/plans?userId=${user.id}`);
              dbPlans = await reFetch.json();
            }
          }
          setPlans(Array.isArray(dbPlans) ? dbPlans : []);
          setIsInitialized(true);
        } catch (error) {
          console.error('Load plans error:', error);
          setIsInitialized(true);
        }
      };

      loadPlansData();
    }
  }, [user?.id, appInitialized]);

  const addPlan = async (planData) => {
    return addPlans([planData]);
  };

  const addPlans = async (plansData) => {
    const allNewPlans = [];
    plansData.forEach((planData) => {
      const basePlan = {
        ...planData,
        userId: user.id
      };

      if (planData.repeatType === 'EBBINGHAUS' && planData.ebbinghausMode) {
        const dates = getEbbinghausDates(planData.date || new Date(), planData.ebbinghausMode);
        dates.forEach((date, dIndex) => {
          allNewPlans.push({
            ...basePlan,
            date: date,
            title: dIndex === 0 ? planData.title : `${planData.title} (复习 ${dIndex})`,
            completed: false
          });
        });
      } else {
        allNewPlans.push({
          ...basePlan,
          date: planData.date || new Date().toISOString().split('T')[0],
          completed: false
        });
      }
    });

    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allNewPlans)
      });
      if (res.ok) {
        const refreshRes = await fetch(`/api/plans?userId=${user.id}`);
        const updatedPlans = await refreshRes.json();
        setPlans(updatedPlans);
        toast.success(`成功添加了 ${allNewPlans.length} 个学习计划`);
      }
    } catch (error) {
      console.error('Batch add plans error:', error);
      toast.error('添加计划失败');
    }
  };

  const togglePlan = async (id) => {
    const target = plans.find(p => p.id === id);
    if (!target) return;
    const newCompleted = !target.completed;
    
    // Optimistic update
    setPlans(prev => prev.map(p => p.id === id ? { ...p, completed: newCompleted } : p));
    if (addPoints) {
      addPoints(newCompleted ? (Number(target.reward) || 0) : -(Number(target.reward) || 0));
    }

    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, completed: newCompleted })
      });
      if (res.ok) {
        toast.success(newCompleted ? '太棒了！任务已完成' : '任务已重置');
      }
    } catch (error) {
      console.error('Toggle plan error:', error);
      toast.error('操作失败，请重试');
    }
  };

  const deletePlan = async (id) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('计划已移除');
      }
    } catch (error) {
      console.error('Delete plan error:', error);
    }
  };

  const dailyPlans = useMemo(() => {
    return plans.filter(p => p.date === selectedDate);
  }, [plans, selectedDate]);

  const weeklyStats = useMemo(() => {
    if (!selectedDate) return [];
    try {
      const curr = new Date(selectedDate);
      const day = curr.getDay();
      const diff = curr.getDate() - (day === 0 ? 6 : day - 1);
      const monday = new Date(curr.setDate(diff));
      
      const week = [];
      const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const displayDate = `${d.getMonth() + 1}/${d.getDate()}`;
        
        const dayPlans = plans.filter(p => p.date === dateStr);
        const completion = dayPlans.length > 0 
          ? dayPlans.filter(p => p.completed).length / dayPlans.length 
          : 0;
        
        week.push({
          label: weekLabels[i],
          date: displayDate,
          fullDate: dateStr,
          completion: completion
        });
      }
      return week;
    } catch (e) {
      return [];
    }
  }, [plans, selectedDate]);

  return (
    <LearningContext.Provider value={{ 
      plans: dailyPlans, 
      allPlans: plans, 
      selectedDate,
      setSelectedDate,
      weeklyStats,
      addPlan, 
      addPlans,
      togglePlan, 
      deletePlan,
      isInitialized 
    }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) throw new Error('useLearning must be used within a LearningProvider');
  return context;
}

export function useLearningPlan() {
  return useLearning();
}
