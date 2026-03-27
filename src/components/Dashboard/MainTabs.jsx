"use client";

import { useState } from 'react';
import CalendarStrip from './CalendarStrip';
import PlanList from './PlanList';
import DashboardHabitList from './DashboardHabitList';
import TaskDetailModal from '../Modals/TaskDetailModal';
import { useLearning } from '@/hooks/useLearningPlan';
import { Sparkles, ListPlus, Plus, Settings2, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MainTabs() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('learning');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addPlan } = useLearning();

  return (
    <div className="main-tabs-container card">
      <div className="tab-header">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
            onClick={() => setActiveTab('learning')}
          >
            学习计划
          </button>
          <button
            className={`tab-btn ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            行为习惯
          </button>
        </div>

        <div className="tab-actions">
          {activeTab === 'learning' ? (
            <>
              {/*<button className="action-icon-btn primary"><Sparkles size={14} /> AI创建</button>*/}
              <button
                className="action-icon-btn secondary"
                onClick={() => router.push('/plans/batch-add')}
              >
                <ListPlus size={14} /> 批量添加
              </button>
              <button className="action-icon-btn accent" onClick={() => setIsModalOpen(true)}>
                <Plus size={14} /> 添加计划
              </button>
            </>
          ) : (
            <>
              <Link href="/habits" className="action-icon-btn primary text-link">
                <BarChart3 size={14} /> 坚持统计
              </Link>
              <Link href="/habits/manage" className="action-icon-btn accent text-link">
                <Settings2 size={14} /> 管理习惯
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="tab-content transition-fade">
        <CalendarStrip />
        <div className="tab-list-wrapper">
          {activeTab === 'learning' ? (
            <PlanList />
          ) : (
            <DashboardHabitList />
          )}
        </div>
      </div>

      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addPlan}
      />

      <style jsx>{`
        .main-tabs-container { padding: 1.25rem; min-height: 520px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .tabs { display: flex; background: #F1F5F9; padding: 0.3rem; border-radius: 14px; }
        .tab-btn { border: none; background: none; padding: 0.7rem 1.5rem; font-size: 0.9rem; font-weight: 700; color: #64748b; cursor: pointer; border-radius: 11px; transition: all 0.2s; }
        .tab-btn.active { background: white; color: #3b82f6; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        .tab-actions { display: flex; gap: 0.6rem; }
        .action-icon-btn { display: flex; align-items: center; gap: 0.5rem; border: none; padding: 0.6rem 1.1rem; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; color: white; transition: all 0.2s; text-decoration: none; }
        .action-icon-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .action-icon-btn.primary { background: #3b82f6; }
        .action-icon-btn.secondary { background: #6366F1; }
        .action-icon-btn.accent { background: #1e293b; }
        
        .tab-content { animation: fadeIn 0.4s ease; }
        .tab-list-wrapper { margin-top: 1rem; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 640px) {
          .main-tabs-container { padding: 0.75rem; min-height: auto; border-radius: 18px; }
          .tab-header { flex-direction: column; align-items: stretch; gap: 0.75rem; margin-bottom: 1rem; }
          .tabs { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 0.25rem; }
          .tab-btn { padding: 0.5rem 0.4rem; font-size: 0.8rem; border-radius: 10px; }
          .tab-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: flex-start; width: 100%; }
          .action-icon-btn { flex: 1; min-width: calc(50% - 0.25rem); padding: 0.5rem; font-size: 0.75rem; justify-content: center; border-radius: 10px; height: 36px; }
          .action-icon-btn.text-link { min-width: calc(50% - 0.25rem); }
        }
      `}</style>
    </div>
  );
}
