"use client";

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function AddPlanModal({ isOpen, onClose, onAdd }) {
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
  const [formData, setFormData] = useState({
    title: '',
    category: '学习',
    reward: 10,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
    setFormData({ title: '', category: '学习', reward: 10 });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>新建计划</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>计划名称</label>
            <input 
              type="text" 
              placeholder="你想坚持做什么？" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>分类</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option>学习</option>
                <option>运动</option>
                <option>生活</option>
                <option>娱乐</option>
              </select>
            </div>
            <div className="form-group">
              <label>完成奖励 (星星)</label>
              <input 
                type="number" 
                value={formData.reward}
                onChange={e => setFormData({ ...formData, reward: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary submit-btn">
            确定创建
          </button>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          width: 100%;
          max-width: 400px;
          padding: 2rem;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .close-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        label { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        input, select { 
          padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius); 
          font-size: 0.9rem; outline: none; transition: border-color 0.2s;
        }
        input:focus { border-color: var(--primary); }
        .submit-btn { width: 100%; margin-top: 1rem; }
      `}</style>
    </div>
  );
}
