"use client";

import { useApp } from "@/hooks/useAppContext";
import { useHabits } from "@/hooks/useHabits";
import { User, Gift, Zap, Ticket, ChevronDown, Users, LogOut, Settings, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { user, members, switchMember, family, logout, addMember } = useApp();
  const { stats } = useHabits();
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
  const displayCheckInDays = stats?.totalActiveDays ?? user?.checkInDays ?? 0;

  return (
    <header className="header">
      <div className="brand">
        <h1>小打卡 - 学习打卡助手</h1>
        <p>累计打卡 <span className="highlight">{displayCheckInDays}</span> 天</p>
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
          flex-direction: column;
          gap: 1rem;
          padding: 1rem var(--content-padding) 3rem var(--content-padding);
          background: var(--gender-gradient);
          color: white;
          border-radius: 0 0 24px 24px;
          margin-bottom: 1rem;
          box-shadow: 0 8px 30px var(--gender-shadow);
          position: relative;
        }

        @media (min-width: 641px) {
          .header { 
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            padding: 1.5rem var(--content-padding) 4.5rem var(--content-padding); 
            border-radius: 0 0 48px 48px;
            gap: 2rem;
            margin-bottom: 1.5rem;
          }
        }

        .brand {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .brand h1 {
          font-size: 1.25rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        @media (min-width: 641px) {
          .brand h1 { font-size: 1.35rem; }
        }

        .brand p {
          font-size: 0.8rem;
          opacity: 0.9;
          font-weight: 600;
          margin: 0;
        }

        .highlight {
          color: #FCD34D;
          font-weight: 900;
        }
        
        .user-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          gap: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }

        @media (min-width: 641px) {
          .user-info {
            flex-direction: column;
            align-items: flex-end;
            width: auto;
            border-top: none;
            padding-top: 0;
          }
        }

        .vip-badge-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          min-width: 0; /* Allow shrinking */
        }
        
        .vip-badge {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(12px);
          padding: 0.35rem 0.6rem;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (min-width: 641px) {
          .vip-badge { font-size: 0.8rem; padding: 0.5rem 1rem; border-radius: 999px; }
        }

        .crown { font-size: 0.8rem; }

        .btn-exchange {
          background: #F59E0B;
          color: white;
          text-decoration: none;
          padding: 0.35rem 0.65rem;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          flex-shrink: 0;
        }

        @media (min-width: 641px) {
          .btn-exchange { font-size: 0.8rem; padding: 0.5rem 1rem; border-radius: 999px; }
        }

        .btn-exchange:hover { transform: translateY(-2px); background: #D97706; }

        .avatar-group-wrap { position: relative; display: flex; align-items: center; }
        
        .avatar-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 16px;
          transition: background 0.2s;
        }

        @media (min-width: 641px) {
          .avatar-group { border-radius: 999px; padding: 0.3rem; }
        }

        .avatar-group:hover { background: rgba(255,255,255,0.15); }
        
        .name-wrap { display: flex; flex-direction: column; align-items: flex-end; }
        .user-nickname { font-size: 0.95rem; font-weight: 800; line-height: 1.1; color: white; }
        
        .quick-manage-link { 
          font-size: 0.65rem; color: rgba(255,255,255,0.9); text-decoration: none; 
          background: rgba(255,255,255,0.2); padding: 0.1rem 0.5rem; border-radius: 6px;
          margin-top: 3px; font-weight: 800; transition: 0.2s;
        }
        .quick-manage-link:hover { background: white; color: var(--primary); }
        
        .avatar-ring { 
          width: 36px; height: 36px; border-radius: 12px; 
          border: 2px solid white; overflow: hidden; background: white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        @media (min-width: 641px) {
          .avatar-ring { width: 42px; height: 42px; border-radius: 50%; }
        }

        .avatar { width: 100%; height: 100%; object-fit: cover; }
        .arrow-icon { opacity: 0.8; transition: transform 0.2s; }
        .arrow-icon.rotate { transform: rotate(180deg); }

        .user-dropdown {
          background: white; border-radius: 20px; box-shadow: 0 15px 50px rgba(0,0,0,0.2); 
          color: #1e293b; border: 1px solid rgba(0,0,0,0.05);
        }

        .dropdown-header { 
          padding: 1rem 1.25rem 0.5rem; font-size: 0.7rem; font-weight: 800; 
          color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; 
        }

        .members-list { max-height: 280px; overflow-y: auto; padding: 0.5rem; }
        
        .member-item {
          display: flex; align-items: center; gap: 0.85rem; padding: 0.85rem 1rem; 
          cursor: pointer; transition: all 0.2s; color: #1e293b; border-radius: 12px;
        }
        .member-item:hover { background: #f1f5f9; transform: translateX(4px); }
        .member-item.active { background: #eff6ff; color: #2563eb; }
        
        .member-item.add-btn { color: #64748b; margin-top: 0.25rem; border: 1px dashed #e2e8f0; }
        .member-item.add-btn:hover { background: white; border-color: #2563eb; color: #2563eb; }
        
        .add-icon { 
          display: flex; align-items: center; justify-content: center; 
          background: #f8fafc; color: inherit; font-size: 1.2rem;
        }
        
        .mini-avatar { width: 32px; height: 32px; border-radius: 10px; border: 1px solid #f1f5f9; }
        .member-item .name { flex: 1; font-size: 0.95rem; font-weight: 700; color: inherit; }
        .active-dot { width: 8px; height: 8px; background: #2563eb; border-radius: 50%; box-shadow: 0 0 8px rgba(37, 99, 235, 0.4); }

        .dropdown-footer { border-top: 1px solid #f1f5f9; margin-top: 0.25rem; padding: 0.5rem; }
        .footer-link {
          display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 0.75rem; 
          font-size: 0.85rem; font-weight: 800; color: #475569; text-decoration: none; 
          cursor: pointer; transition: 0.2s; border-radius: 10px;
        }
        .footer-link:hover { background: #f1f5f9; color: #1e293b; }
        .footer-link.manage-center { color: #2563eb; margin-bottom: 2px; }
        .footer-link.manage-center:hover { background: #eff6ff; }
        .footer-link.logout { color: #ef4444; }
        .footer-link.logout:hover { background: #fef2f2; }

        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px);
          z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 1.5rem;
        }
        .quick-modal {
          width: 100%; max-width: 400px; padding: 2.5rem; border-radius: 32px;
          background: white; text-align: center; box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.3);
        }
        .quick-modal h3 { font-size: 1.35rem; font-weight: 900; color: #1e293b; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .modal-desc { font-size: 0.9rem; color: #64748b; margin-bottom: 2rem; }
        .quick-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .input-group { text-align: left; }
        .input-group label { display: block; font-size: 0.85rem; font-weight: 800; color: #475569; margin-bottom: 0.6rem; }
        .input-group input {
          width: 100%; padding: 1rem 1.25rem; border: 2px solid #f1f5f9; border-radius: 16px;
          font-size: 1rem; outline: none; transition: 0.2s; background: #f8fafc; font-weight: 600;
        }
        .input-group input:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        .modal-actions { display: flex; gap: 1rem; margin-top: 0.5rem; }
        .btn-cancel { flex: 1; padding: 1rem; border: none; background: #f1f5f9; color: #64748b; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .btn-confirm { flex: 2; padding: 1rem; border: none; background: #2563eb; color: white; border-radius: 16px; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.25); }
        .btn-confirm:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(37, 99, 235, 0.35); }
        .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </header>
  );
}
