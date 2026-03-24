"use client";

import { useApp } from "@/hooks/useAppContext";
import { ChevronLeft, Plus, Users, Edit2, Trash2, Check, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersPage() {
  const { members, currentMemberId, addMember, updateMember, deleteMember, switchMember } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', avatar: '' });

  useEffect(() => {
    if (isAddModalOpen || editingMember) {
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
  }, [isAddModalOpen, editingMember]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      addMember(formData.name, formData.avatar);
      setIsAddModalOpen(false);
      setFormData({ name: '', avatar: '' });
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && editingMember) {
      updateMember(editingMember.id, { name: formData.name, avatar: formData.avatar });
      setEditingMember(null);
      setFormData({ name: '', avatar: '' });
    }
  };

  const openEdit = (member) => {
    setEditingMember(member);
    setFormData({ name: member.name, avatar: member.avatar });
  };

  return (
    <div className="users-page-container animate-fade-in">
      <header className="page-header border-b">
        <div className="header-inner">
          <Link href="/" className="back-btn"><ChevronLeft size={24} /></Link>
          <h1>多成员档案管理</h1>
          <button className="add-text-btn" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} /> 添加成员
          </button>
        </div>
      </header>

      <main className="users-main">
        <section className="members-grid">
          {members.map(member => (
            <div 
              key={member.id} 
              className={`member-card card ${member.id === currentMemberId ? 'active' : ''}`}
            >
              <div className="member-info-row">
                <div className="member-avatar-box" onClick={() => switchMember(member.id)}>
                  <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} alt={member.name} />
                  {member.id === currentMemberId && <div className="active-tag"><Check size={12} /></div>}
                </div>
                <div className="member-text" onClick={() => switchMember(member.id)}>
                  <h3>{member.name}</h3>
                  <p className="role-tag">{member.role === 'primary' ? '主档案' : '普通档案'}</p>
                </div>
                <div className="member-actions">
                  <button className="icon-btn edit" onClick={() => openEdit(member)} title="编辑"><Edit2 size={16} /></button>
                  {member.role !== 'primary' && (
                    <button className="icon-btn delete" onClick={() => {
                        if(confirm(`确定要删除成员 "${member.name}" 吗？该操作不可撤销。`)) {
                            deleteMember(member.id);
                        }
                    }} title="删除"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
              <div className="member-footer">
                <div className="stat-pill">⭐ {member.points} 积分</div>
                <div className="stat-pill">📅 {member.checkInDays} 天打卡</div>
              </div>
              {member.id === currentMemberId && (
                <div className="current-badge">正在使用</div>
              )}
            </div>
          ))}

          <div className="add-member-card card" onClick={() => setIsAddModalOpen(true)}>
             <div className="add-circle">
               <UserRoundPlus size={32} />
             </div>
             <p>添加新档案</p>
          </div>
        </section>

        {members.length === 0 && (
          <div className="empty-state">
            <Users size={64} className="empty-icon" />
            <p>暂无成员档案，快去添加一个吧</p>
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>立即添加</button>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAddModalOpen || editingMember) && (
          <div className="modal-overlay" onClick={() => {setIsAddModalOpen(false); setEditingMember(null);}}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="modal-content card"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingMember ? '编辑档案信息' : '添加新成员档案'}</h2>
              </div>
              <form onSubmit={editingMember ? handleEdit : handleAdd} className="member-form">
                <div className="form-item">
                  <label>档案名称</label>
                  <input 
                    placeholder="例如：大宝、小美"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    autoFocus
                    required
                  />
                </div>
                <div className="form-item">
                  <label>头像地址 (URL)</label>
                  <input 
                    placeholder="https://api.dicebear.com/..."
                    value={formData.avatar}
                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  />
                  <p className="hint">留空将根据名称自动生成可爱头像</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => {setIsAddModalOpen(false); setEditingMember(null);}}>取消</button>
                  <button type="submit" className="btn-primary" disabled={!formData.name.trim()}>
                    {editingMember ? '保存修改' : '立即创建'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .users-page-container {
          min-height: 100vh;
          background-color: #f8fafc;
          padding-bottom: 4rem;
        }
        .page-header {
          background: white;
          padding: 1.25rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          gap: 1.5rem;
        }
        .header-inner h1 { flex: 1; font-size: 1.25rem; font-weight: 850; color: #1e293b; }
        .back-btn { color: #64748b; display: flex; align-items: center; transition: 0.2s; }
        .back-btn:hover { color: #3b82f6; transform: translateX(-2px); }
        
        .add-text-btn {
          display: flex; align-items: center; gap: 0.5rem;
          background: #3b82f6; color: white; border: none;
          padding: 0.6rem 1.2rem; border-radius: 12px;
          font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .add-text-btn:hover { background: #2563eb; transform: translateY(-2px); }

        .users-main { padding: 2rem 1.5rem; max-width: 1200px; margin: 0 auto; }
        .members-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
          gap: 1.5rem; 
        }

        .member-card {
          padding: 1.5rem;
          background: white;
          border-radius: 28px;
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .member-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        .member-card.active { border-color: #3b82f6; background: #f0f7ff; }

        .member-info-row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
        .member-avatar-box { 
          position: relative; width: 72px; height: 72px; cursor: pointer;
          background: #f1f5f9; border-radius: 20px; padding: 4px;
        }
        .member-avatar-box img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; border: 2px solid white; }
        .active-tag { 
          position: absolute; right: -8px; top: -8px; width: 24px; height: 24px; 
          background: #10b981; color: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 3px solid white;
        }

        .member-text { flex: 1; cursor: pointer; }
        .member-text h3 { font-size: 1.2rem; font-weight: 850; color: #1e293b; margin-bottom: 0.4rem; }
        .role-tag { font-size: 0.75rem; color: #64748b; background: #e2e8f0; padding: 0.2rem 0.6rem; border-radius: 8px; font-weight: 700; }

        .member-actions { display: flex; gap: 0.5rem; }
        .icon-btn { 
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid #f1f5f9;
          background: #f8fafc; color: #64748b; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.2s;
        }
        .icon-btn:hover { background: white; color: #3b82f6; border-color: #3b82f6; }
        .icon-btn.delete:hover { color: #ef4444; border-color: #ef4444; background: #fff5f5; }

        .member-footer { display: flex; gap: 0.75rem; border-top: 1px solid #f1f5f9; padding-top: 1.25rem; }
        .stat-pill { background: #f8fafc; border: 1px solid #f1f5f9; padding: 0.4rem 0.8rem; border-radius: 12px; font-size: 0.8rem; font-weight: 700; color: #475569; }

        .current-badge {
          position: absolute; right: -25px; top: 15px; background: #3b82f6; color: white;
          font-size: 0.65rem; font-weight: 800; padding: 0.2rem 2rem; transform: rotate(45deg);
        }

        .add-member-card {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 1rem; padding: 2rem; border: 2px dashed #e2e8f0; background: rgba(255,255,255,0.5);
          cursor: pointer; border-radius: 28px; transition: 0.2s;
        }
        .add-member-card:hover { border-color: #3b82f6; background: white; }
        .add-circle { width: 64px; height: 64px; background: #f1f5f9; border-radius: 50%; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .add-member-card:hover .add-circle { background: #eff6ff; color: #3b82f6; }
        .add-member-card p { font-size: 0.95rem; font-weight: 700; color: #64748b; }

        .empty-state { text-align: center; padding: 6rem 2rem; background: white; border-radius: 32px; border: 2px dashed #e2e8f0; grid-column: 1 / -1; }
        .empty-icon { color: #cbd5e1; margin-bottom: 1.5rem; }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .modal-content { width: 100%; max-width: 420px; padding: 2.5rem; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); background: white; }
        .modal-header h2 { font-size: 1.4rem; font-weight: 900; color: #1e293b; margin-bottom: 2rem; text-align: center; }
        .form-item { margin-bottom: 1.5rem; }
        .form-item label { display: block; font-size: 0.9rem; font-weight: 800; margin-bottom: 0.6rem; color: #475569; }
        .form-item input { width: 100%; padding: 0.9rem 1.1rem; border: 2px solid #f1f5f9; border-radius: 16px; font-size: 1rem; outline: none; transition: 0.2s; background: #f8fafc;}
        .form-item input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); background: white; }
        .hint { font-size: 0.75rem; color: #94a3b8; margin-top: 0.6rem; }
        .modal-footer { display: flex; gap: 1rem; margin-top: 2.5rem; }
        .btn-secondary { flex: 1; padding: 0.9rem; border: none; background: #f1f5f9; color: #64748b; border-radius: 16px; font-weight: 800; cursor: pointer; }
        .btn-primary { flex: 2; padding: 0.9rem; background: #3b82f6; color: white; border: none; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
        .btn-primary:disabled { opacity: 0.5; transform: none; box-shadow: none; }
      `}</style>
    </div>
  );
}
