"use client";

import { useLearningPlan } from '@/hooks/useLearningPlan';
import { Share2, Check, Trash2, Sparkles, Clock, CheckCircle2, Timer, BookOpen, Calculator, FileText, Dumbbell, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AIGeneratorModal from '../Modals/AIGeneratorModal';

// Category config: color, icon, label
const CATEGORY_CONFIG = {
  '语文': { color: '#4F6EF7', gradient: 'linear-gradient(135deg, #4F6EF7 0%, #6C8CFF 100%)', icon: FileText, label: '语文' },
  '数学': { color: '#7C5CFC', gradient: 'linear-gradient(135deg, #7C5CFC 0%, #9B7DFF 100%)', icon: Calculator, label: '数学' },
  '英文': { color: '#4F6EF7', gradient: 'linear-gradient(135deg, #4F6EF7 0%, #5B9BFF 100%)', icon: BookOpen, label: '英文' },
  '学习': { color: '#4F6EF7', gradient: 'linear-gradient(135deg, #4F6EF7 0%, #6C8CFF 100%)', icon: BookOpen, label: '学习' },
  '阅读': { color: '#7C5CFC', gradient: 'linear-gradient(135deg, #7C5CFC 0%, #9B7DFF 100%)', icon: BookOpen, label: '阅读' },
  '运动': { color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', icon: Dumbbell, label: '运动' },
  '生活': { color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', icon: Home, label: '生活' },
};

function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG['学习'];
}

function getDurationText(plan) {
  if (plan.timeType === 'duration' && plan.duration) {
    return `${plan.duration}分钟`;
  }
  if (plan.timeType === 'range' && plan.startTime && plan.endTime) {
    return `${plan.startTime} - ${plan.endTime}`;
  }
  return null;
}

export default function PlanList() {
  const { plans, togglePlan, deletePlan } = useLearningPlan();
  const [showAIModal, setShowAIModal] = useState(false);

  const router = useRouter();

  const handleQuickComplete = (e, plan) => {
    e.stopPropagation();
    if (!plan.completed) {
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
      const randomInRange = (min, max) => Math.random() * (max - min) + min;
      const interval = setInterval(function() {
        const particleCount = 50;
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
      setTimeout(() => clearInterval(interval), 600);
    }
    togglePlan(plan.id);
  };

  const handleStartTimer = (e, plan) => {
    e.stopPropagation();
    router.push(`/plans/timer/${plan.id}`);
  };

  return (
    <div className="plan-list-container animate-fade-in">
      <div className="list-header">
        <h3>我的计划</h3>
        <div className="header-actions">
          <button className="share-btn"><Share2 size={16} /> 分享</button>
        </div>
      </div>

      <div className="list-content">
        <AnimatePresence>
          {plans.map((plan, index) => {
            const config = getCategoryConfig(plan.category);
            const IconComponent = config.icon;
            const durationText = getDurationText(plan);
            const isOnlyToday = plan.repeatType === 'NONE' || !plan.repeatType;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`plan-card ${plan.completed ? 'completed' : ''}`}
              >
                {/* Left color bar */}
                <div className="card-color-bar" style={{ background: config.gradient }} />
                
                {/* Content Container */}
                <div className="card-main-row">
                  {/* Category icon block */}
                  <div className="category-block" style={{ background: config.gradient }}>
                    <IconComponent size={22} color="white" strokeWidth={2} />
                    <span className="category-label">{config.label}</span>
                  </div>

                  {/* Title & Status */}
                  <div className="plan-info">
                    <h4 className="plan-title">{plan.title}</h4>
                    <div className="status-tags">
                      {isOnlyToday && <span className="today-badge">今日目标</span>}
                      {durationText && (
                        <div className="plan-duration">
                          <Clock size={12} />
                          <span>{durationText}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="card-actions">
                    {plan.completed ? (
                      <button 
                        className="action-btn done-btn"
                        onClick={(e) => handleQuickComplete(e, plan)}
                      >
                        <CheckCircle2 size={14} />
                        已完成
                      </button>
                    ) : (
                      <>
                        <button 
                          className="action-btn complete-btn"
                          onClick={(e) => handleQuickComplete(e, plan)}
                        >
                          <CheckCircle2 size={16} />
                          <span>快速完成</span>
                        </button>
                        <button 
                          className="action-btn timer-btn"
                          onClick={(e) => handleStartTimer(e, plan)}
                        >
                          <Timer size={16} />
                          <span>开始计时</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete button (on hover) */}
                <button
                  className="delete-btn"
                  onClick={(e) => { e.stopPropagation(); deletePlan(plan.id); }}
                  title="删除计划"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {showAIModal && <AIGeneratorModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />}

      <style jsx>{`
        .plan-list-container { margin-top: 1.5rem; }
        
        .list-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;
        }
        .list-header h3 { font-size: 1rem; border-left: 4px solid var(--primary); padding-left: 0.75rem; font-weight: 800; color: var(--text-main); }
        
        .header-actions { display: flex; align-items: center; gap: 0.8rem; }
        .share-btn { 
          background: rgba(148, 163, 184, 0.1); border: none; font-size: 0.75rem; color: var(--text-muted); font-weight: 700;
          display: flex; align-items: center; gap: 0.3rem; cursor: pointer; padding: 0.4rem 0.8rem; border-radius: 8px; transition: all 0.2s;
        }
        .share-btn:hover { background: rgba(148, 163, 184, 0.2); color: var(--text-main); }
        
        .list-content { 
          display: flex; 
          flex-direction: column; 
          gap: 1rem; 
          padding-bottom: 2rem; 
        }
        
        .plan-card {
          background: #ffffff;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(226, 232, 240, 0.5);
          min-height: 80px;
          display: flex;
          align-items: stretch;
        }
        .plan-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border-color: var(--primary-light);
        }
        .plan-card.completed { opacity: 0.6; background: #f8fafc; }

        .card-color-bar {
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
        }

        .card-main-row {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 12px 20px;
          gap: 0;
        }

        /* Category block - Left */
        .category-block {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .category-label { color: white; font-size: 0.6rem; font-weight: 800; opacity: 0.9; }

        /* Information - Middle */
        .plan-info {
          display: flex;
          align-items: center;
          margin-left: 20px; /* Precise 20px as requested */
          flex: 1;
          min-width: 0;
          gap: 15px;
        }
        .plan-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
          max-width: 200px;
        }
        .completed .plan-title { text-decoration: line-through; color: #94a3b8; }

        .status-tags {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .today-badge {
          background: #f0fdf4; color: #16a34a; font-size: 0.65rem; font-weight: 800;
          padding: 2px 10px; border-radius: 6px; border: 1px solid #dcfce7; white-space: nowrap;
        }
        .plan-duration {
          display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #64748b; font-weight: 600; white-space: nowrap;
        }

        /* Actions - Right */
        .card-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .action-btn {
          display: flex; align-items: center; gap: 6px; padding: 0.6rem 1.2rem;
          border-radius: 12px; font-size: 0.8rem; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s;
          white-space: nowrap;
        }
        .action-btn:hover { transform: translateY(-1px); }
        .complete-btn { background: #eff6ff; color: #3b82f6; }
        .complete-btn:hover { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .timer-btn { background: #f5f3ff; color: #8b5cf6; }
        .timer-btn:hover { background: #8b5cf6; color: white; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
        .done-btn { background: #f1f5f9; color: #94a3b8; cursor: default; }

        /* Delete button */
        .delete-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(241, 245, 249, 0.5);
          border: none;
          color: #94a3b8;
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.8);
          z-index: 10;
        }
        .plan-card:hover .delete-btn {
          opacity: 1;
          transform: scale(1);
        }
        .delete-btn:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .card-main-row { padding: 10px 12px; gap: 10px; }
          .category-block { width: 44px; height: 44px; border-radius: 10px; }
          .category-block :global(svg) { width: 18px !important; height: 18px !important; }
          .category-label { font-size: 0.55rem; }
          .plan-info { margin-left: 0; flex-direction: column; align-items: flex-start; gap: 4px; }
          .plan-title { font-size: 0.9rem; max-width: 100%; white-space: normal; line-height: 1.2; margin-bottom: 2px; }
          .status-tags { gap: 6px; flex-wrap: wrap; }
          .action-btn span { display: none; }
          .action-btn { padding: 0.5rem; border-radius: 10px; }
          .card-actions { gap: 6px; }
        }
      `}</style>
    </div>
  );
}
