"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

const DEFAULT_MEMBERS = [
  { id: 'm1', name: '测试用户', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky', points: 100, checkInDays: 0, role: 'primary', isVip: false, vipExpiry: 0 },
];

export function AppProvider({ children }) {
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [stats, setStats] = useState({
    todayLearningTime: 0,
    todayOutdoorTime: 0,
    todayTasks: { completed: 0, total: 0 },
    monthlyCompletion: 0,
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gender, setGenderState] = useState('male'); // 'male' | 'female'

  // Persist gender choice
  const setGender = (g) => {
    setGenderState(g);
    if (typeof window !== 'undefined') localStorage.setItem('bj_gender', g);
  };

  // Load gender from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bj_gender');
      if (saved === 'male' || saved === 'female') setGenderState(saved);
    }
  }, []);

  const isVipActive = useCallback(() => {
    if (!family) return false;
    return family.isVip && Number(family.vipExpiry) > Date.now();
  }, [family]);

  // Initialize Auth and Migration
  useEffect(() => {
    const initData = async () => {
      const savedToken = localStorage.getItem('bj_token');
      const savedFamily = localStorage.getItem('bj_family');

      if (!savedToken || !savedFamily) {
        setIsInitialized(true);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return;
      }

      try {
        const familyData = JSON.parse(savedFamily);
        setFamily(familyData);

        // Fetch members for this family
        const response = await fetch(`/api/members?familyId=${familyData.id}`);
        let dbMembers = await response.json();

        if (Array.isArray(dbMembers)) {
          setMembers(dbMembers);
          const savedActiveId = localStorage.getItem('bj_active_member_id');
          const activeMember = dbMembers.find(m => m.id === savedActiveId) || dbMembers[0];
          setCurrentMemberId(activeMember?.id);
        }

        const savedStats = localStorage.getItem('bj_stats');
        if (savedStats) setStats(JSON.parse(savedStats));

        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsInitialized(true);
      }
    };

    initData();
  }, []);

  // VIP Access Guard
  useEffect(() => {
    if (!isInitialized || !family) return;

    const publicPaths = ['/login', '/redeem', '/admin'];
    const path = window.location.pathname;
    
    if (!publicPaths.includes(path) && !isVipActive()) {
      // If not VIP and not on a public path, redirect to redeem
      window.location.href = '/redeem';
    }
  }, [isInitialized, family, isVipActive]);

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('bj_token', data.token);
        localStorage.setItem('bj_family', JSON.stringify(data.family));
        setFamily(data.family);
        setMembers(data.members);
        setCurrentMemberId(data.members[0]?.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username, password, name) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name })
      });
      return res.ok;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('bj_token');
    localStorage.removeItem('bj_family');
    localStorage.removeItem('bj_active_member_id');
    window.location.href = '/login';
  };

  const redeemCoupon = async (code) => {
    if (!family?.id) return { success: false, message: "请先登录" };
    try {
      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, familyId: family.id })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedFamily = { ...family, isVip: true, vipExpiry: data.vipExpiry };
        localStorage.setItem('bj_family', JSON.stringify(updatedFamily));
        setFamily(updatedFamily);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || "兑换失败" };
    } catch (error) {
      return { success: false, message: "网络错误" };
    }
  };

  // Save transient info
  useEffect(() => {
    if (isInitialized && currentMemberId) {
      localStorage.setItem('bj_active_member_id', currentMemberId);
      localStorage.setItem('bj_stats', JSON.stringify(stats));
    }
  }, [currentMemberId, stats, isInitialized]);

  // Inject default avatar dynamically for rendering
  const processedMembers = members.map(m => ({
    ...m,
    avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name || 'User'}`
  }));

  const currentUser = processedMembers.find(m => m.id === currentMemberId) || processedMembers[0] || {};

  const addPoints = async (amount) => {
    if (!currentMemberId) return;
    const target = members.find(m => m.id === currentMemberId);
    if (!target) return;

    const newPoints = Math.max(0, target.points + Number(amount));
    setMembers(prev => prev.map(m => 
      m.id === currentMemberId ? { ...m, points: newPoints } : m
    ));

    try {
      await fetch(`/api/members/${currentMemberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, points: newPoints })
      });
    } catch (error) {
      console.error('Add points error:', error);
    }
  };

  const addMember = async (name, avatar) => {
    if (!family?.id) return;
    const data = {
      name,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      points: 0,
      familyId: family.id
    };

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const newMember = await res.json();
        setMembers(prev => [...prev, newMember]);
        return newMember;
      }
    } catch (error) {
      console.error('Add member error:', error);
    }
  };

  const updateMember = async (id, updates) => {
    const target = members.find(m => m.id === id);
    if (!target) return;
    const data = { ...target, ...updates };
    setMembers(prev => prev.map(m => m.id === id ? data : m));
    try {
      await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Update member error:', error);
    }
  };

  const deleteMember = async (id) => {
    const memberToDelete = members.find(m => m.id === id);
    if (!memberToDelete) return;

    if (memberToDelete.role === 'primary') {
      alert('主档案是核心账号，不可删除哦');
      return;
    }

    // 1. Store backup for rollback
    const originalMembers = [...members];
    
    // 2. Optimistic Update
    const remainingMembers = originalMembers.filter(m => m.id !== id);
    setMembers(remainingMembers);
    
    if (currentMemberId === id) {
      if (remainingMembers.length > 0) {
        const nextMember = remainingMembers.find(m => m.role === 'primary') || remainingMembers[0];
        setCurrentMemberId(nextMember.id);
      }
    }

    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '后端删除请求失败');
      }
      // Note: We don't alert successfully for every delete to avoid annoying user, 
      // but if the user wants feedback, a small toast would be better.
    } catch (error) {
      console.error('Delete member error trace:', error);
      alert(`删除数据库记录时遇到错误: ${error.message}。档案已恢复。`);
      // Rollback
      setMembers(originalMembers);
      if (currentMemberId === id) {
        setCurrentMemberId(id);
      }
    }
  };

  const switchMember = (id) => setCurrentMemberId(id);
  const updateStats = (newStats) => setStats(prev => ({ ...prev, ...newStats }));

  return (
    <AppContext.Provider value={{ 
      user: currentUser, 
      members: processedMembers, 
      family,
      currentMemberId,
      stats,
      selectedDate,
      setSelectedDate,
      login,
      register,
      logout,
      redeemCoupon,
      addPoints, 
      addMember,
      updateMember,
      deleteMember,
      switchMember,
      updateStats,
      isInitialized,
      isVipActive: isVipActive(),
      gender,
      setGender,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
