"use client";

import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';

export default function AddWishModal({ isOpen, onClose, onAdd }) {
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
  const { addWish } = useRewards();
  const [formData, setFormData] = useState({
    title: '',
    icon: '🎁',
    costPoints: 50,
    category: '生活'
  });

  const icons = ['🎁', '🧸', '🍦', '🎮', '📱', '🚲', '🍕', '🎡', '📚', '🎬'];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    addWish(formData);
    setFormData({ title: '', icon: '🎁', costPoints: 50, category: '生活' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>添加愿望</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>愿望名称</label>
            <input 
              type="text" 
              placeholder="例如：买一套乐高积木"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>选择图标</label>
            <div className="icon-selector">
              {icons.map(icon => (
                <button 
                  key={icon}
                  type="button"
                  className={`icon-btn ${formData.icon === icon ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>所需星星数量</label>
            <input 
              type="number" 
              value={formData.costPoints}
              onChange={e => setFormData({ ...formData, costPoints: parseInt(e.target.value) })}
              min="1"
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            <Sparkles size={16} /> 保存愿望
          </button>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 2000;
        }
        .modal-content {
          background: white; width: 100%; max-width: 500px;
          border-radius: 20px 20px 0 0; padding: 1.5rem;
          box-shadow: 0 -10px 25px rgba(0,0,0,0.1);
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 2rem;
        }
        .modal-header h2 { font-size: 1.25rem; font-weight: 800; }
        .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }

        form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        label { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
        input {
          padding: 0.75rem 1rem; border: 1px solid var(--border);
          border-radius: var(--radius); font-size: 1rem; background: #F8FAFC;
        }
        
        .icon-selector {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem;
        }
        .icon-btn {
          font-size: 1.5rem; padding: 0.5rem; border: 2px solid transparent;
          background: #F1F5F9; border-radius: var(--radius); cursor: pointer;
        }
        .icon-btn.active { border-color: var(--primary); background: #EEF2FF; }

        .submit-btn {
          margin-top: 1rem; background: var(--primary); color: white;
          border: none; padding: 1rem; border-radius: 999px;
          font-weight: 700; font-size: 1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}
