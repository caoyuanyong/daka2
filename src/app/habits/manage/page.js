"use client";

import { useHabits } from "@/hooks/useHabits";
import { ChevronLeft, Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AddHabitModal from "@/components/Modals/AddHabitModal";

export default function HabisManagePage() {
  const { habits, deleteHabit } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="manage-container animate-fade-in">
      <header className="page-header header-sticky">
        <div className="header-inner">
          <Link href="/habits" className="back-btn"><ChevronLeft size={24} /></Link>
          <h1>习惯管理</h1>
          <button className="add-text-btn" onClick={handleAdd}>新建习惯</button>
        </div>
      </header>

      <main className="manage-content">
        <div className="habit-manager-list">
          {habits.map(habit => (
            <div key={habit.id} className="manager-card card">
              <div className="drag-handle"><GripVertical size={20} color="#CBD5E1" /></div>
              <div className="habit-icon-circle" style={{ backgroundColor: habit.color + '15', color: habit.color }}>
                {habit.icon}
              </div>
              <div className="habit-detail">
                <h3>{habit.title}</h3>
                <p>{habit.points > 0 ? '+' : ''}{habit.points} ⭐ · {habit.type === 'daily' ? '每日一次' : '多次'}</p>
              </div>
              <div className="actions">
                <button className="btn-icon edit" onClick={() => handleEdit(habit)}><Edit2 size={18} /></button>
                <button className="btn-icon delete" onClick={() => deleteHabit(habit.id)}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>

        <button className="big-add-btn" onClick={handleAdd}>
          <Plus size={20} /> 新建个习惯
        </button>
      </main>

      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        habitToEdit={editingHabit}
      />

      <style jsx>{`
        .manage-container { min-height: 100vh; background: var(--bg-main); padding-bottom: 3rem; }
        .header-sticky { background: white; box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 100; }
        .header-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 1rem; }
        .page-header h1 { font-size: 1.1rem; font-weight: 700; }
        .add-text-btn { background: none; border: none; color: var(--primary); font-weight: 700; cursor: pointer; }

        .manage-content { padding: 1rem; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
        
        .habit-manager-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .manager-card { display: flex; align-items: center; padding: 1rem; gap: 1rem; }
        .drag-handle { cursor: grab; }
        .habit-icon-circle { 
          width: 44px; height: 44px; border-radius: 12px; 
          display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
        }
        .habit-detail { flex: 1; }
        .habit-detail h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.2rem; }
        .habit-detail p { font-size: 0.75rem; color: var(--text-muted); }

        .actions { display: flex; gap: 0.5rem; }
        .btn-icon { background: #F8FAFC; border: none; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); transition: all 0.2s; }
        .btn-icon.edit:hover { background: #EEF2FF; color: var(--primary); }
        .btn-icon.delete:hover { background: #FEF2F2; color: var(--danger); }

        .big-add-btn {
          margin-top: 1rem; background: white; border: 2px dashed var(--border);
          color: var(--primary); padding: 1rem; border-radius: var(--radius-lg);
          font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: all 0.2s;
        }
        @media (max-width: 640px) {
          .manage-content { padding: 0.75rem; }
          .manager-card { padding: 0.75rem; gap: 0.75rem; border-radius: 16px; }
          .habit-icon-circle { width: 38px; height: 38px; font-size: 1.25rem; border-radius: 10px; }
          .habit-detail h3 { font-size: 0.85rem; }
          .habit-detail p { font-size: 0.7rem; }
          .btn-icon { width: 32px; height: 32px; border-radius: 6px; }
          .page-header h1 { font-size: 1rem; }
          .add-text-btn { font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
}
