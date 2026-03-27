"use client";

import { useApp } from "@/hooks/useAppContext";
import { useHabits } from "@/hooks/useHabits";
import { ChevronLeft, Search, Filter, LayoutGrid, List, Settings, BarChart3, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HabitsPage() {
  const { user } = useApp();
  const { habits, checkIn, records } = useHabits();
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === today);
  const gainToday = todayRecords.filter(r => r.pointsChange > 0).reduce((s, r) => s + r.pointsChange, 0);
  const lossToday = todayRecords.filter(r => r.pointsChange < 0).reduce((s, r) => s + Math.abs(r.pointsChange), 0);

  const filteredHabits = habits.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="habits-container animate-fade-in">
      <header className="page-header sticky-header">
        <div className="header-inner">
          <Link href="/" className="back-btn"><ChevronLeft size={24} /></Link>
          <h1>行为习惯</h1>
          <div className="header-actions">
            <Link href="/habits/stats"><BarChart3 size={20} /></Link>
            <Link href="/habits/manage"><Settings size={20} /></Link>
          </div>
        </div>
      </header>

      <main className="habits-content">
        {/* Daily Summary Card */}
        <section className="summary-card card">
          <div className="stat-box">
            <span className="label">获得星星</span>
            <span className="value gain">+{gainToday}</span>
          </div>
          <div className="stat-box">
            <span className="label">扣除星星</span>
            <span className="value loss">-{lossToday}</span>
          </div>
          <div className="stat-box">
            <span className="label">今日打卡</span>
            <span className="value">{todayRecords.length} </span>
          </div>
          <div className="stat-box">
            <span className="label">总余额</span>
            <span className="value balance">{user.points} ⭐</span>
          </div>
        </section>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-bar">
            <Search size={16} />
            <input 
              placeholder="搜索习惯..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="view-toggle">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={18} /></button>
          </div>
        </div>

        {/* Habits Grid/List */}
        <div className={`habits-layout ${viewMode}-view`}>
          <AnimatePresence>
            {filteredHabits.map((habit, index) => {
              const timesToday = todayRecords.filter(r => r.habitId === habit.id).length;
              const isDone = habit.type === 'daily' && timesToday >= 1;
              const isMaxed = habit.type === 'daily_multiple' && timesToday >= habit.maxTimes;

              return (
                <motion.div 
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`habit-card card ${isDone || isMaxed ? 'completed' : ''}`}
                >
                  <div className="card-top">
                    <div className="icon-wrap" style={{ backgroundColor: habit.color + '20', color: habit.color }}>
                      {habit.icon}
                    </div>
                    <div className="points-tag" style={{ color: habit.points >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {habit.points >= 0 ? '+' : ''}{habit.points} ⭐
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h3>{habit.title}</h3>
                    <p>{habit.desc}</p>
                    <div className="frequency-info">
                      {habit.type === 'daily_multiple' ? `目标: ${habit.maxTimes}次/日` : '每日一次'}
                      {habit.type === 'daily_multiple' && <span className="progress"> ({timesToday}/{habit.maxTimes})</span>}
                    </div>
                  </div>

                  <button 
                    className={`check-in-btn ${habit.points < 0 ? 'negative' : ''}`}
                    disabled={isDone || isMaxed}
                    onClick={() => checkIn(habit.id)}
                  >
                    {isDone || isMaxed ? <CheckCircle2 size={18} /> : (habit.points < 0 ? '异常反馈' : '完成打卡')}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>



      <style jsx>{`
        .habits-container { min-height: 100vh; background: var(--bg-main); padding-bottom: 2rem; }
        .sticky-header { background: white; box-shadow: var(--shadow-sm); z-index: 100; position: sticky; top: 0; }
        .header-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 1rem; }
        .header-actions { display: flex; gap: 1rem; color: var(--text-main); }
        .header-actions a { color: inherit; }

        .habits-content { padding: 1rem var(--content-padding); max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
        
        @media (min-width: 641px) {
          .habits-content { gap: 1.5rem; }
        }
        
        .summary-card { display: grid; grid-template-columns: repeat(4, 1fr); padding: 1.5rem; gap: 1rem; text-align: center; }
        .stat-box { display: flex; flex-direction: column; gap: 0.25rem; }
        .stat-box .label { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; }
        .stat-box .value { font-size: 1.1rem; font-weight: 800; }
        .value.gain { color: var(--success); }
        .value.loss { color: var(--danger); }
        .value.balance { color: var(--primary); }

        .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
        .search-bar { 
          flex: 1; display: flex; align-items: center; gap: 0.5rem; 
          background: white; padding: 0.6rem 1rem; border-radius: 999px;
          border: 1px solid var(--border); box-shadow: var(--shadow-sm);
        }
        .search-bar input { border: none; outline: none; width: 100%; font-size: 0.9rem; }
        .view-toggle { display: flex; background: white; border-radius: 8px; border: 1px solid var(--border); overflow: hidden; }
        .view-toggle button { 
          padding: 0.5rem; border: none; background: none; cursor: pointer; color: var(--text-muted);
          display: flex; align-items: center;
        }
        .view-toggle button.active { background: #EEF2FF; color: var(--primary); }

        .habits-layout.grid-view { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
          gap: 1rem; 
        }
        .habits-layout.list-view { display: flex; flex-direction: column; gap: 1rem; }

        .habit-card { 
          display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem; 
          border: 2px solid transparent; transition: all 0.2s;
        }
        .habit-card:hover { border-color: var(--primary-light); }
        .completed { opacity: 0.6; filter: grayscale(0.5); border-color: transparent !important; }

        .card-top { display: flex; justify-content: space-between; align-items: center; }
        .icon-wrap { 
          width: 48px; height: 48px; border-radius: 14px; 
          display: flex; align-items: center; justify-content: center; font-size: 1.75rem;
        }
        .points-tag { font-size: 0.85rem; font-weight: 700; background: #F8FAFC; padding: 0.2rem 0.6rem; border-radius: 6px; }

        .card-body h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; color: var(--text-main); }
        .card-body p { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; height: 2.2rem; overflow: hidden; }
        .frequency-info { font-size: 0.7rem; color: var(--text-muted); }
        .progress { color: var(--primary); font-weight: 700; }

        .check-in-btn { 
          margin-top: auto; padding: 0.75rem; border: none; border-radius: 12px;
          background: #EEF2FF; color: var(--primary); font-weight: 700; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
        }
        .check-in-btn:hover:not(:disabled) { background: var(--primary); color: white; }
        .check-in-btn.negative { background: #FEF2F2; color: var(--danger); }
        .check-in-btn.negative:hover:not(:disabled) { background: var(--danger); color: white; }
        .check-in-btn:disabled { background: #F1F5F9; color: #94A3B8; cursor: not-allowed; }

        .list-view .habit-card { flex-direction: row; align-items: center; }
        .list-view .card-top { flex-shrink: 0; }
        .list-view .card-body { flex: 1; padding: 0 1rem; }
        .list-view .card-body p { height: auto; margin-bottom: 0.25rem; }
        .list-view .check-in-btn { min-width: 100px; margin-top: 0; }



        @media (max-width: 640px) {
          .page-header h1 { font-size: 1rem; }
          .habits-content { padding: 0.75rem; gap: 0.75rem; }
          .summary-card { grid-template-columns: repeat(2, 1fr); padding: 1rem; gap: 0.75rem; border-radius: 16px; }
          .stat-box .value { font-size: 1rem; }
          .habits-layout.grid-view { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
          .habit-card { padding: 1rem 0.75rem; border-radius: 16px; gap: 0.6rem; }
          .icon-wrap { width: 36px; height: 36px; border-radius: 10px; font-size: 1.25rem; }
          .points-tag { font-size: 0.7rem; padding: 0.15rem 0.4rem; }
          .card-body h3 { font-size: 0.9rem; }
          .card-body p { font-size: 0.7rem; height: 2rem; }
          .frequency-info { font-size: 0.65rem; }
          .check-in-btn { padding: 0.6rem; font-size: 0.8rem; border-radius: 10px; }

        }
      `}</style>
    </div>
  );
}
