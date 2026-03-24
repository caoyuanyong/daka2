"use client";

import { useApp } from "@/hooks/useAppContext";
import { User, Gift, Zap, Ticket, ChevronDown, Users, LogOut, Settings, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { user, members, switchMember, family, logout, addMember } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isAddModalOpen) {
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
  }, [isAddModalOpen]);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    const newMember = await addMember(newName);
    setLoading(false);
    if (newMember) {
      setNewName("");
      setIsAddModalOpen(false);
      // Wait a bit then switch? Or just let user switch.
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const vipDays = family?.vipExpiry ? Math.max(0, Math.ceil((Number(family.vipExpiry) - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <header className="header">
      <div className="brand">
        <h1>小打卡 - 学习打卡助手</h1>
        <p>今日已打卡 <span className="highlight">{user.checkInDays}</span> 天</p>
      </div>

      <div className="user-info">
        <div className="vip-badge-row">
          <div className={`vip-badge ${family?.isVip ? 'active' : ''}`}>
            <span className="crown">{family?.isVip ? '👑' : '💎'}</span> 
            {family?.isVip ? `会员剩余 ${vipDays} 天` : '未激活会员'}
          </div>
          <Link href="/redeem" className="btn-exchange">
            <Zap size={12} /> 兑换
          </Link>
        </div>
        
        <div className="avatar-group-wrap" ref={menuRef}>
          <div className="avatar-group" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="name-wrap">
              <span className="user-nickname">{user.name}</span>
              <Link href="/users" className="quick-manage-link" onClick={e => e.stopPropagation()}>
                管理
              </Link>
            </div>
            <div className="avatar-ring">
              <img src={user.avatar} alt="Avatar" className="avatar" />
            </div>
            <ChevronDown size={14} className={`arrow-icon ${isMenuOpen ? 'rotate' : ''}`} />
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="user-dropdown card"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '240px',
                  zIndex: 1000,
                  padding: '0.5rem 0',
                  overflow: 'hidden'
                }}
              >
                <div className="dropdown-header">切换成员档案</div>
                <div className="members-list">
                  {members.map(member => (
                    <div 
                      key={member.id} 
                      className={`member-item ${member.id === user.id ? 'active' : ''}`}
                      onClick={() => { switchMember(member.id); setIsMenuOpen(false); }}
                    >
                      <img src={member.avatar} alt={member.name} className="mini-avatar" />
                      <span className="name">{member.name}</span>
                      {member.id === user.id && <span className="active-dot" />}
                    </div>
                  ))}
                  
                  {/* Quick Add Button in Dropdown */}
                  <div className="member-item add-btn" onClick={() => { setIsAddModalOpen(true); setIsMenuOpen(false); }}>
                    <div className="mini-avatar add-icon">
                      <UserRoundPlus size={14} />
                    </div>
                    <span className="name">添加新用户</span>
                  </div>
                </div>

                <div className="dropdown-footer">
                  <Link href="/users" className="footer-link manage-center" onClick={() => setIsMenuOpen(false)}>
                    <Settings size={14} /> 档案管理中心
                  </Link>
                  <div className="footer-link logout" onClick={logout}>
                    <LogOut size={14} /> 退出登录
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Add Member Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="quick-modal card"
              onClick={e => e.stopPropagation()}
            >
              <h3>添加新成员</h3>
              <p className="modal-desc">为家人创建一个独立的打卡档案</p>
              
              <form onSubmit={handleQuickAdd} className="quick-form">
                <div className="input-group">
                  <label>档案名称</label>
                  <input 
                    type="text" 
                    placeholder="输入名字，如：小宝" 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>取消</button>
                  <button type="submit" className="btn-confirm" disabled={!newName.trim() || loading}>
                    {loading ? '创建中...' : '立即创建'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem 1rem;
          background: linear-gradient(to bottom, var(--primary), var(--primary-dark));
          color: white;
          border-radius: 0 0 var(--radius-xl) var(--radius-xl);
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(79, 70, 229, 0.15);
        }
        .brand h1 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .brand p {
          font-size: 0.75rem;
          opacity: 0.9;
        }
        .highlight {
          color: #FCD34D;
          font-weight: 850;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.75rem;
        }
        .vip-badge-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .vip-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          padding: 0.4rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .crown { font-size: 0.85rem; }
        .btn-exchange {
          background: #F59E0B;
          color: white;
          text-decoration: none;
          padding: 0.4rem 0.8rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.2s;
        }
        .btn-exchange:hover { transform: translateY(-2px); background: #D97706; }

        .avatar-group-wrap { position: relative; display: flex; align-items: center; }
        .avatar-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
          padding: 0.2rem;
          border-radius: 999px;
          transition: background 0.2s;
        }
        .avatar-group:hover { background: rgba(255,255,255,0.1); }
        .name-wrap { display: flex; flex-direction: column; align-items: flex-end; }
        .user-nickname { font-size: 0.9rem; font-weight: 600; line-height: 1.2; }
        .quick-manage-link { 
          font-size: 0.65rem; color: rgba(255,255,255,0.8); text-decoration: none; 
          background: rgba(255,255,255,0.15); padding: 0.1rem 0.4rem; border-radius: 4px;
          margin-top: 2px; transition: 0.2s;
        }
        .quick-manage-link:hover { background: white; color: var(--primary); }
        .avatar-ring { width: 34px; height: 34px; border-radius: 50%; border: 2px solid white; overflow: hidden; background: white; }
        .avatar { width: 100%; height: 100%; object-fit: cover; }
        .arrow-icon { opacity: 0.7; transition: transform 0.2s; }
        .arrow-icon.rotate { transform: rotate(180deg); }

        .user-dropdown {
          background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); 
          color: #1e293b;
        }
        .dropdown-header { padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .members-list { max-height: 240px; overflow-y: auto; }
        .member-item {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; 
          cursor: pointer; transition: 0.2s; color: #1e293b;
        }
        .member-item:hover { background: #f8fafc; }
        .member-item.active { background: #eff6ff; color: var(--primary); }
        .member-item.add-btn { color: var(--text-muted); opacity: 0.8; }
        .member-item.add-btn:hover { opacity: 1; color: var(--primary); }
        .add-icon { display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: inherit; }
        
        .mini-avatar { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #e2e8f0; }
        .member-item .name { flex: 1; font-size: 0.9rem; font-weight: 600; color: inherit; }
        .active-dot { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; }

        .dropdown-footer { border-top: 1px solid #f1f5f9; margin-top: 0.5rem; padding-top: 0.5rem; }
        .footer-link {
          display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1rem; 
          font-size: 0.85rem; font-weight: 700; color: #1e293b; text-decoration: none; cursor: pointer; transition: 0.2s;
        }
        .footer-link:hover { background: #f8fafc; color: var(--primary); }
        .footer-link.manage-center { background: #f0f7ff; color: var(--primary); margin-bottom: 2px; }
        .footer-link.manage-center:hover { background: #e0efff; }
        .footer-link.logout { color: var(--danger); }
        .footer-link.logout:hover { background: #fff5f5; }

        /* Quick Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .quick-modal {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
          border-radius: 32px;
          background: white;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
        }
        .quick-modal h3 { font-size: 1.2rem; font-weight: 850; color: #1e293b; margin-bottom: 0.4rem; }
        .modal-desc { font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; }
        
        .quick-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .input-group { text-align: left; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; }
        .input-group input {
          width: 100%; padding: 0.85rem 1rem; border: 2px solid #f1f5f9; border-radius: 12px;
          font-size: 1rem; outline: none; transition: 0.2s;
        }
        .input-group input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        
        .modal-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
        .btn-cancel { flex: 1; padding: 0.85rem; border: none; background: #f1f5f9; color: #64748b; border-radius: 12px; font-weight: 700; cursor: pointer; }
        .btn-confirm { flex: 2; padding: 0.85rem; border: none; background: var(--primary); color: white; border-radius: 12px; font-weight: 700; cursor: pointer; }
        .btn-confirm:disabled { opacity: 0.5; }
      `}</style>
    </header>
  );
}
