"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

const AppContext = createContext();

const DEFAULT_MEMBERS = [
  { id: 'm1', name: '测试用户', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky', points: 100, checkInDays: 0, role: 'primary', isVip: false, vipExpiry: 0 },
];

export function AppProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
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
  const [theme, setThemeState] = useState('blue'); 
  const [customColor, setCustomColorState] = useState('#3B82F6'); 

  // Persist theme choice
  const setTheme = (t, customHex = null) => {
    setThemeState(t);
    if (customHex) setCustomColorState(customHex);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('bj_theme', t);
      localStorage.setItem('bj_gender', t);
      if (customHex) {
        localStorage.setItem('bj_custom_color', customHex);
      }
    }
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let saved = localStorage.getItem('bj_theme');
      let savedCustom = localStorage.getItem('bj_custom_color');
      
      if (savedCustom) setCustomColorState(savedCustom);
      
      if (!saved) {
        saved = localStorage.getItem('bj_gender');
        if (saved === 'male') saved = 'blue';
        if (saved === 'female') saved = 'pink';
      }
      
      if (saved) {
        setThemeState(saved);
      }
    }
  }, []);

  const isVipActive = useCallback(() => {
    if (!family) return false;
    return family.isVip && Number(family.vipExpiry) > Date.now();
  }, [family]);

  // Initialize Auth
  useEffect(() => {
    const initData = async () => {
      const savedToken = localStorage.getItem('bj_token');
      const savedFamily = localStorage.getItem('bj_family');

      if (!savedToken || !savedFamily) {
        setIsInitialized(true);
        if (pathname !== '/login') {
          router.push('/login');
        }
        return;
      }

      try {
        const familyData = JSON.parse(savedFamily);
        setFamily(familyData);

        // Optimization: Use consolidated init API
        const savedActiveId = localStorage.getItem('bj_active_member_id');
        const activeMemberId = savedActiveId || null;
        
        let fetchUrl = `/api/members?familyId=${familyData.id}`;
        // If we have an active member, try to fully initialize the system state
        if (activeMemberId) {
          fetchUrl = `/api/system/init?userId=${activeMemberId}&date=${selectedDate}`;
        }

        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (activeMemberId && data.member) {
          // Hydrate full system state
          setMembers(m => m.length ? m : [data.member]); // Just one for now or re-fetch all members?
          // Re-fetch all members for the switcher to work correctly
          const memRes = await fetch(`/api/members?familyId=${familyData.id}`);
          const allMembers = await memRes.json();
          setMembers(allMembers);
          
          setCurrentMemberId(data.member.id);
          // Store initial state for other providers to hydrate
          window.__INITIAL_STATE__ = data;
        } else if (Array.isArray(data)) {
          setMembers(data);
          const firstMember = data.find(m => m.id === savedActiveId) || data[0];
          setCurrentMemberId(firstMember?.id);
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
    
    // Cleanup initial state after all hooks have had a chance to hydrate (approx 2s)
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') delete window.__INITIAL_STATE__;
    }, 2000);
    return () => clearTimeout(timer);
  }, [pathname, router]);

  // VIP Access Guard
  useEffect(() => {
    if (!isInitialized || !family) return;

    const publicPaths = ['/login', '/redeem', '/admin'];
    
    if (!publicPaths.includes(pathname) && !isVipActive()) {
      router.push('/redeem');
    }
  }, [isInitialized, family, isVipActive, pathname, router]);

  const login = useCallback(async (username, password) => {
    const loadId = toast.loading('正在登录...');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('bj_token', data.token);
        localStorage.setItem('bj_family', JSON.stringify(data.family));
        setFamily(data.family);
        setMembers(data.members);
        setCurrentMemberId(data.members[0]?.id);
        toast.success('登录成功，欢迎回来！', { id: loadId });
        router.push('/');
        return true;
      }
      toast.error(data.error || '登录失败，请检查用户名或密码', { id: loadId });
      return false;
    } catch (error) {
      toast.error('网络连接失败', { id: loadId });
      return false;
    }
  }, [router]);

  const register = useCallback(async (username, password, name) => {
    const loadId = toast.loading('正在注册...');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('注册成功，请登录！', { id: loadId });
        router.push('/login');
        return true;
      }
      toast.error(data.error || '注册失败', { id: loadId });
      return false;
    } catch (error) {
      toast.error('网络连接失败', { id: loadId });
      return false;
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem('bj_token');
    localStorage.removeItem('bj_family');
    localStorage.removeItem('bj_active_member_id');
    toast.success('已退出登录');
    router.push('/login');
  }, [router]);

  const redeemCoupon = useCallback(async (code) => {
    if (!family?.id) return { success: false, message: "请先登录" };
    const loadId = toast.loading('正在兑换...');
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
        toast.success('兑换成功！', { id: loadId });
        return { success: true, message: data.message };
      }
      toast.error(data.error || "兑换失败", { id: loadId });
      return { success: false, message: data.error || "兑换失败" };
    } catch (error) {
      toast.error('网络错误', { id: loadId });
      return { success: false, message: "网络错误" };
    }
  }, [family]);

  // Save transient info
  useEffect(() => {
    if (isInitialized && currentMemberId) {
      localStorage.setItem('bj_active_member_id', currentMemberId);
      localStorage.setItem('bj_stats', JSON.stringify(stats));
    }
  }, [currentMemberId, stats, isInitialized]);

  const processedMembers = useMemo(() => {
    return members.map(m => ({
      ...m,
      avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name || 'User'}`
    }));
  }, [members]);

  const currentUser = useMemo(() => {
    return processedMembers.find(m => m.id === currentMemberId) || processedMembers[0] || {};
  }, [processedMembers, currentMemberId]);

  const addPoints = useCallback(async (amount) => {
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
  }, [currentMemberId, members]);

  const addMember = useCallback(async (name, avatar) => {
    if (!family?.id) return;
    const loadId = toast.loading('正在创建档案...');
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
        toast.success(`成员 ${name} 创建成功！`, { id: loadId });
        return newMember;
      }
      toast.error('创建失败', { id: loadId });
    } catch (error) {
      toast.error('创建失败', { id: loadId });
      console.error('Add member error:', error);
    }
  }, [family?.id]);

  const updateMember = useCallback(async (id, updates) => {
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
  }, [members]);

  const deleteMember = useCallback(async (id) => {
    const memberToDelete = members.find(m => m.id === id);
    if (!memberToDelete) return;

    if (memberToDelete.role === 'primary') {
      toast.error('主档案不可删除');
      return;
    }

    const originalMembers = [...members];
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
        throw new Error(errorData.error || '后端删除失败');
      }
      toast.success('档案已成功删除');
    } catch (error) {
      console.error('Delete member error trace:', error);
      toast.error(`删除失败: ${error.message}`);
      setMembers(originalMembers);
      if (currentMemberId === id) {
        setCurrentMemberId(id);
      }
    }
  }, [members, currentMemberId]);

  const switchMember = useCallback(async (id) => {
    setCurrentMemberId(id);
    const member = members.find(m => m.id === id);
    if (member) {
      toast.success(`已切换至: ${member.name}`, { duration: 1500 });
      // Pre-hydrate for faster switching
      try {
        const res = await fetch(`/api/system/init?userId=${id}&date=${selectedDate}`);
        const data = await res.json();
        if (typeof window !== 'undefined') window.__INITIAL_STATE__ = data;
      } catch (e) {
        console.error('Switch hydration error:', e);
      }
    }
  }, [members, selectedDate]);

  const updateStats = useCallback((newStats) => setStats(prev => ({ ...prev, ...newStats })), []);

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
      theme,
      setTheme,
      customColor,
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
