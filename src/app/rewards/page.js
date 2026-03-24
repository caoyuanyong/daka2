"use client";

import { useState, useEffect } from 'react';
import { useRewards } from '@/hooks/useRewards';
import { useApp } from '@/hooks/useAppContext';
import { Trophy, Gift, Plus, ChevronLeft, History, Star, ShoppingBag, Award } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState('mall'); // mall, medals
  const [showAddModal, setShowAddModal] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [selectedWish, setSelectedWish] = useState(null);
  const [newWish, setNewWish] = useState({ title: '', icon: '🎁', cost: 10, category: '其他' });
  
  useEffect(() => {
    if (showAddModal || isExchangeModalOpen) {
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
  }, [showAddModal, isExchangeModalOpen]);

  const { wishes, medals, redeemWish, addWish } = useRewards();
  const { user } = useApp();

  const handleRedeem = (id) => {
    const res = redeemWish(id);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleAddWish = (e) => {
    e.preventDefault();
    if (!newWish.title) return;
    addWish(newWish);
    setShowAddModal(false);
    setNewWish({ title: '', icon: '🎁', cost: 10, category: '其他' });
  };

  return (
    <div className="rewards-container">
      <header className="page-header">
        <div className="header-content">
          <Link href="/" className="back-btn"><ChevronLeft size={24} /></Link>
          <div className="title-area">
            <h1>激励中心</h1>
            <div className="balance-pill">
              <Star size={14} className="star-icon" />
              <span>{user.points}</span>
            </div>
          </div>
          <Link href="/rewards/history" className="history-btn"><History size={20} /></Link>
        </div>
      </header>

      <div className="tab-switcher">
        <button className={activeTab === 'mall' ? 'active' : ''} onClick={() => setActiveTab('mall')}>
          <ShoppingBag size={16} /> 愿望商城
        </button>
        <button className={activeTab === 'medals' ? 'active' : ''} onClick={() => setActiveTab('medals')}>
          <Award size={16} /> 勋章墙
        </button>
      </div>

      <main className="content-area">
        <AnimatePresence mode="wait">
          {activeTab === 'mall' ? (
            <motion.div 
              key="mall"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="wish-grid"
            >
              <div className="add-wish-card item-card" onClick={() => setShowAddModal(true)}>
                <div className="plus-icon"><Plus size={32} /></div>
                <p>添加新愿望</p>
              </div>

              {wishes.map((wish) => (
                <div key={wish.id} className="wish-card item-card">
                  <div className="wish-icon">{wish.icon}</div>
                  <div className="wish-info">
                    <span className="wish-cat">[{wish.category}]</span>
                    <h3>{wish.title}</h3>
                    <div className="cost-row">
                      <Star size={12} fill="#F59E0B" stroke="none" />
                      <span>{wish.cost}</span>
                    </div>
                  </div>
                  <button 
                    className={`redeem-btn ${user.points < wish.cost ? 'disabled' : ''}`}
                    onClick={() => handleRedeem(wish.id)}
                  >
                    兑换 {wish.count > 0 && `(${wish.count})`}
                  </button>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="medals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="medal-wall"
            >
              <div className="medal-grid">
                {medals.map((medal) => (
                  <div key={medal.id} className={`medal-card item-card ${medal.unlocked ? 'unlocked' : 'locked'}`}>
                    <div className="medal-icon">{medal.icon}</div>
                    <div className="medal-text">
                      <h4>{medal.title}</h4>
                      <p>{medal.desc}</p>
                    </div>
                    {!medal.unlocked && (
                      <div className="medal-progress">
                        <div className="progress-bar">
                          <div className="bar-fill" style={{ width: `${(medal.current / medal.target) * 100}%` }} />
                        </div>
                        <span className="progress-txt">{medal.current}/{medal.target}</span>
                      </div>
                    )}
                    {medal.unlocked && <span className="reward-tag">+{medal.reward}⭐</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Wish Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="modal-content item-card"
              onClick={e => e.stopPropagation()}
            >
              <h3>添加新愿望</h3>
              <form onSubmit={handleAddWish}>
                <div className="form-group">
                  <label>愿望名称</label>
                  <input 
                    type="text" 
                    value={newWish.title} 
                    onChange={e => setNewWish({...newWish, title: e.target.value})}
                    placeholder="如：去游乐园"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>所需星星</label>
                    <input 
                      type="number" 
                      value={newWish.cost} 
                      onChange={e => setNewWish({...newWish, cost: Number(e.target.value)})}
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>图标</label>
                    <select value={newWish.icon} onChange={e => setNewWish({...newWish, icon: e.target.value})}>
                      <option>🎁</option><option>🍔</option><option>🧸</option><option>🎡</option><option>🏝️</option><option>🎮</option><option>🍦</option>
                    </select>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>取消</button>
                  <button type="submit" className="confirm-btn">确认添加</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .rewards-container { min-height: 100vh; background: #F8FAFC; padding-bottom: 4rem; }
        .page-header { background: white; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; z-index: 100; }
        .header-content { max-width: 1000px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .title-area { display: flex; align-items: center; gap: 1rem; }
        .title-area h1 { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
        .balance-pill { background: #FEF3C7; color: #D97706; padding: 0.3rem 0.8rem; border-radius: 999px; display: flex; align-items: center; gap: 0.4rem; font-weight: 800; font-size: 0.85rem; }
        .back-btn, .history-btn { color: #64748b; padding: 0.5rem; border-radius: 50%; display: flex; text-decoration: none; }
        .back-btn:hover, .history-btn:hover { background: #f1f5f9; }

        .tab-switcher { margin: 1.5rem auto; max-width: 400px; display: flex; padding: 0.3rem; border-radius: 14px; background: #f1f5f9; }
        .tab-switcher button { flex: 1; border: none; background: none; padding: 0.75rem; font-size: 0.9rem; font-weight: 700; color: #64748b; cursor: pointer; border-radius: 11px; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: 0.2s; }
        .tab-switcher button.active { background: white; color: #3b82f6; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

        .content-area { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
        
        .item-card { background: white; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

        .wish-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem; }
        
        .wish-card { padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center; border: 2px solid transparent; transition: 0.2s; }
        .wish-card:hover { border-color: #3b82f6; transform: translateY(-2px); }
        .wish-icon { font-size: 3rem; margin-bottom: 1rem; }
        .wish-cat { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.25rem; }
        .wish-card h3 { font-size: 1rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem; }
        .cost-row { display: flex; align-items: center; gap: 0.3rem; margin-bottom: 1.5rem; font-weight: 900; color: #F59E0B; }
        .redeem-btn { width: 100%; padding: 0.8rem; border: none; border-radius: 12px; background: #3b82f6; color: white; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .redeem-btn.disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }

        .add-wish-card { border: 2px dashed #cbd5e1; background: none; color: #94a3b8; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220px; cursor: pointer; transition: 0.2s; }
        .add-wish-card:hover { border-color: #3b82f6; color: #3b82f6; background: #f0f9ff; }

        .medal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
        .medal-card { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem; position: relative; }
        .medal-card.locked { opacity: 0.6; filter: grayscale(1); }
        .medal-icon { font-size: 2.5rem; }
        .medal-text h4 { font-size: 1rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; }
        .medal-text p { font-size: 0.8rem; color: #64748b; }
        .medal-progress { flex: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; }
        .progress-bar { width: 80px; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .bar-fill { height: 100%; background: #3b82f6; border-radius: 3px; }
        .progress-txt { font-size: 0.65rem; font-weight: 700; color: #94a3b8; }
        .reward-tag { position: absolute; top: 1rem; right: 1.25rem; background: #ECFDF5; color: #10B981; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 800; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; backdrop-filter: blur(4px); }
        .modal-content { width: 100%; max-width: 400px; padding: 2rem; border: none; }
        .modal-content h3 { margin-bottom: 1.5rem; font-weight: 800; color: #1e293b; }
        .form-group { margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.75rem; font-weight: 700; color: #64748b; }
        .form-group input, .form-group select { padding: 0.75rem; border-radius: 12px; border: 1.5px solid #e2e8f0; font-size: 1rem; transition: 0.2s; }
        .form-group input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .modal-actions { display: flex; gap: 1rem; margin-top: 1rem; }
        .modal-actions button { flex: 1; padding: 0.8rem; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; transition: 0.2s; }
        .cancel-btn { background: #f1f5f9; color: #64748b; }
        .confirm-btn { background: #3b82f6; color: white; }

        @media (max-width: 640px) {
          .wish-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
          .wish-icon { font-size: 2.25rem; }
          .medal-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
