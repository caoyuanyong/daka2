"use client";

import { useHabits } from "@/hooks/useHabits";
import { Check, Flame, TrendingDown, TrendingUp, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardHabitList() {
  const { habits, checkIn, records } = useHabits();
  const today = new Date().toISOString().split('T')[0];

  const getTodayCount = (habitId) => {
    return records.filter(r => r.habitId === habitId && r.date === today).length;
  };

  return (
    <div className="dashboard-habit-list">
      <div className="habit-header">
        <h3>习惯打卡</h3>
        <p className="hint">点击图标即刻记录行为</p>
      </div>

      <div className="habit-grid">
        {habits.map((habit, index) => {
          const count = getTodayCount(habit.id);
          const isDone = habit.type === 'daily' ? count >= 1 : count >= habit.maxTimes;
          
          return (
            <motion.div 
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`habit-card ${isDone ? 'done' : ''}`}
              onClick={() => checkIn(habit.id)}
            >
              <div className="habit-main">
                <div className="habit-icon-box" style={{ backgroundColor: habit.color + '15', color: habit.color }}>
                  <span className="habit-emoji">{habit.icon}</span>
                  {isDone && <div className="done-check"><Check size={12} color="white" /></div>}
                </div>
                <div className="habit-info">
                  <div className="title-row">
                    <h4>{habit.title}</h4>
                    <span className={`points ${habit.points >= 0 ? 'pos' : 'neg'}`}>
                      {habit.points >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(habit.points)}
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${(count / (habit.maxTimes || 1)) * 100}%`,
                        backgroundColor: habit.color 
                      }}
                    />
                  </div>
                  <div className="count-label">
                    {count}/{habit.maxTimes || 1} 次
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        .dashboard-habit-list { }
        .habit-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.25rem; }
        .habit-header h3 { font-size: 1rem; font-weight: 800; color: var(--text-main); border-left: 4px solid var(--primary); padding-left: 0.75rem; }
        .habit-header .hint { font-size: 0.75rem; color: var(--text-muted); }

        .habit-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); 
          gap: 0.75rem; 
        }

        @media (max-width: 480px) {
          .habit-grid { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 0.5rem;
          }
        }
        
        .habit-card { 
          background: #F8FAFC; border: 1px solid var(--border); border-radius: 16px; 
          padding: 1rem; cursor: pointer; transition: all 0.2s; position: relative;
        }
        .habit-card:hover { transform: translateY(-2px); border-color: var(--primary-light); background: white; box-shadow: var(--shadow-sm); }
        .habit-card.done { opacity: 0.8; }

        .habit-main { display: flex; gap: 0.75rem; align-items: flex-start; }
        .habit-icon-box { 
          width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; 
          justify-content: center; position: relative; flex-shrink: 0;
        }
        .habit-emoji { font-size: 1.25rem; }
        .done-check { position: absolute; -top: 4px; -right: 4px; background: #10B981; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border: 2px solid white; }

        .habit-info { flex: 1; min-width: 0; }
        .title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem; gap: 4px; }
        .title-row h4 { 
          font-size: 0.85rem; font-weight: 700; color: var(--text-main); 
          word-break: break-word; line-height: 1.2;
        }
        
        .points { font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; gap: 2px; padding: 0.1rem 0.4rem; border-radius: 4px; }
        .points.pos { background: #ECFDF5; color: #10B981; }
        .points.neg { background: #FEF2F2; color: #EF4444; }

        .progress-bar-bg { height: 4px; background: #E2E8F0; border-radius: 2px; margin-bottom: 0.25rem; overflow: hidden; }
        .progress-bar-fill { height: 100%; transition: width 0.3s ease; }
        .count-label { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; text-align: right; }
      `}</style>
    </div>
  );
}
