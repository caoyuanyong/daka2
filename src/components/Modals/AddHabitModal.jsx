"use client";

import { useState, useEffect } from 'react';
import { X, Check, Search, Sparkles } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';

export default function AddHabitModal({ isOpen, onClose, habitToEdit }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      document.documentElement.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('modal-open');
    };
  }, [isOpen]);
  const { addHabit, updateHabit } = useHabits();
  
  const [formData, setFormData] = useState({
    title: '',
    icon: '💡',
    color: '#4F46E5',
    points: 5,
    type: 'daily',
    maxTimes: 1,
    category: '生活',
    duration: 30,
    desc: ''
  });

  useEffect(() => {
    if (habitToEdit) {
      setFormData(habitToEdit);
    } else {
      setFormData({
        title: '',
        icon: '💡',
        color: '#4F46E5',
        points: 5,
        type: 'daily',
        maxTimes: 1,
        category: '生活',
        duration: 30,
        desc: ''
      });
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const icons = ['💡', '🏃', '🥦', '💧', '🧹', '🎮', '📵', '🛌', '🎸', '🎨', '🐶', '🍕'];
  const colors = ['#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    
    // Ensure numeric values are valid
    const finalData = {
      ...formData,
      points: Number(formData.points) || 0,
      maxTimes: Number(formData.maxTimes) || 1,
      duration: Number(formData.duration) || 0
    };

    if (habitToEdit) {
      updateHabit(finalData);
    } else {
      addHabit(finalData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{habitToEdit ? '修改习惯' : '养成新习惯'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>习惯名称</label>
            <input 
              type="text" 
              placeholder="例如：每天阅读、收纳玩具..."
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="flex-row">
            <div className="form-group">
              <label>选择图标</label>
              <div className="icon-grid">
                {icons.map(icon => (
                  <button 
                    key={icon} type="button" 
                    className={`choice-btn ${formData.icon === icon ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, icon })}
                  >{icon}</button>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>主题色</label>
              <div className="color-grid">
                {colors.map(color => (
                  <button 
                    key={color} type="button" 
                    className="color-btn"
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  >
                    {formData.color === color && <Check size={14} color="white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>分值奖励/惩罚 (正数为奖励，负数为扣分)</label>
            <div className="points-input">
              <input 
                type="number" 
                value={formData.points}
                onChange={e => setFormData({ ...formData, points: e.target.value })}
                required
              />
              <span className="unit">⭐</span>
            </div>
          </div>

          <div className="flex-row">
            <div className="form-group">
              <label>习惯分类</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="学习">学习</option>
                <option value="生活">生活</option>
                <option value="运动">运动</option>
                <option value="健康">健康</option>
              </select>
            </div>
            <div className="form-group">
              <label>单次时长 (分钟)</label>
              <input 
                type="number" 
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>频率类型</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="daily">每日一次</option>
              <option value="daily_multiple">每日多次</option>
              <option value="weekly_multiple">每周多次</option>
            </select>
          </div>

          {(formData.type === 'daily_multiple' || formData.type === 'weekly_multiple') && (
            <div className="form-group">
              <label>目标次数</label>
              <input 
                type="number" 
                value={formData.maxTimes}
                onChange={e => setFormData({ ...formData, maxTimes: e.target.value })}
                min="1"
              />
            </div>
          )}

          <div className="form-group">
            <label>补充描述</label>
            <textarea 
              placeholder="具体的小要求或目标..."
              value={formData.desc}
              onChange={e => setFormData({ ...formData, desc: e.target.value })}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={!formData.title}>
            <Sparkles size={18} /> {habitToEdit ? '确认修改' : '立即开启'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);
          display: flex; align-items: flex-end; justify-content: center; z-index: 2000;
        }
        .modal-content {
          background: white; width: 100%; max-width: 600px;
          border-radius: 24px 24px 0 0; padding: 2rem;
          max-height: 90vh; overflow-y: auto;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .modal-header h2 { font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
        .close-btn { background: #F1F5F9; border: none; padding: 0.5rem; border-radius: 50%; cursor: pointer; }

        form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.6rem; }
        .flex-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; }
        
        label { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
        input, select, textarea {
          padding: 0.8rem 1rem; border: 1px solid var(--border);
          border-radius: 12px; font-size: 1rem; background: #F8FAFC; outline: none;
        }
        input:focus { border-color: var(--primary); background: white; }
        
        .icon-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem; }
        .choice-btn { 
          font-size: 1.25rem; padding: 0.5rem; border: 2px solid transparent; 
          background: #F1F5F9; border-radius: 10px; cursor: pointer; 
        }
        .choice-btn.active { border-color: var(--primary); background: #EEF2FF; }

        .color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
        .color-btn { 
          width: 32px; height: 32px; border-radius: 50%; border: none; 
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }

        .points-input { position: relative; }
        .points-input input { width: 100%; padding-right: 3rem; }
        .points-input .unit { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); font-weight: 800; }

        .submit-btn {
          margin-top: 1rem; background: var(--primary); color: white;
          border: none; padding: 1rem; border-radius: 999px;
          font-weight: 700; font-size: 1.1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.75rem;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
