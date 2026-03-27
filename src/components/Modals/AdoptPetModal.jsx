"use client";

import { X, Check, Heart, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdoptPetModal({ isOpen, onClose, petType, onConfirm }) {
  const [gender, setGender] = useState('male');
  const [name, setName] = useState(`我的${petType?.name || ''}`);

  if (!isOpen || !petType) return null;

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="modal-container"
      >
        <div className="modal-header">
          <h3>领养新伙伴</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          <div className="pet-preview">
            <div className={`preview-circle ${gender}`}>
              <img 
                src={petType.hasGender ? `/pets/${petType.id}_${gender}.png` : (petType.image || '/pets/corgi.png')} 
                alt="Preview" 
              />
            </div>
            <div className="rarity-badge">{petType.rarity.toUpperCase()}</div>
          </div>

          <div className="form-group">
            <label>给它取个名字吧</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="输入名字..."
              autoFocus
            />
          </div>

          {petType.hasGender && (
            <div className="form-group">
              <label>选择个性形态</label>
              <div className="gender-selector">
                <button 
                  className={`gender-btn male ${gender === 'male' ? 'active' : ''}`}
                  onClick={() => setGender('male')}
                >
                  <div className="icon-circle"><User size={16} /></div>
                  <span>男性化形态 (Alpha)</span>
                  {gender === 'male' && <Check size={16} className="check" />}
                </button>
                <button 
                  className={`gender-btn female ${gender === 'female' ? 'active' : ''}`}
                  onClick={() => setGender('female')}
                >
                  <div className="icon-circle"><Heart size={16} /></div>
                  <span>女性化形态 (Beta)</span>
                  {gender === 'female' && <Check size={16} className="check" />}
                </button>
              </div>
            </div>
          )}

          <div className="cost-info">
            消耗 <span className="stars">⭐ {petType.cost}</span> 星星
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>先考虑下</button>
          <button className="btn-confirm" onClick={() => onConfirm(name, gender)}>
            立即领养
          </button>
        </div>
      </motion.div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
          padding: 1.5rem; z-index: 2000;
        }
        .modal-container {
          background: white; width: 100%; max-width: 440px;
          border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        .modal-header {
          padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid #f1f5f9;
        }
        .modal-header h3 { font-size: 1.2rem; font-weight: 900; color: #1e293b; margin: 0; }
        .close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; transition: 0.2s; }
        .close-btn:hover { color: #1e293b; transform: rotate(90deg); }

        .modal-body { padding: 2rem; }
        
        .pet-preview { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 2rem; }
        .preview-circle { 
          width: 120px; height: 120px; border-radius: 40px; 
          display: flex; align-items: center; justify-content: center;
          background: #f8fafc; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 1rem;
        }
        .preview-circle.male { background: #eff6ff; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.1); }
        .preview-circle.female { background: #fdf2f8; box-shadow: 0 10px 20px rgba(236, 72, 153, 0.1); }
        .preview-circle img { width: 100%; height: 100%; object-fit: contain; }
        
        .rarity-badge { background: #fef3c7; color: #b45309; font-size: 0.65rem; font-weight: 900; padding: 0.2rem 0.6rem; border-radius: 6px; }

        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-size: 0.8rem; font-weight: 800; color: #64748b; margin-bottom: 0.6rem; }
        .form-group input { 
          width: 100%; background: #f1f5f9; border: 2px solid transparent; 
          padding: 0.8rem 1.2rem; border-radius: 14px; font-weight: 700; outline: none; transition: 0.2s;
        }
        .form-group input:focus { border-color: var(--primary); background: white; }

        .gender-selector { display: flex; flex-direction: column; gap: 0.8rem; }
        .gender-btn { 
          border: 2px solid #f1f5f9; background: white; padding: 0.8rem 1rem;
          border-radius: 16px; display: flex; align-items: center; gap: 1rem;
          cursor: pointer; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative;
        }
        .gender-btn.active.male { border-color: #3b82f6; background: #eff6ff; }
        .gender-btn.active.female { border-color: #ec4899; background: #fdf2f8; }
        
        .icon-circle { 
          width: 32px; height: 32px; border-radius: 10px; display: flex; 
          align-items: center; justify-content: center; transition: 0.3s;
        }
        .male .icon-circle { background: #dbeafe; color: #3b82f6; }
        .female .icon-circle { background: #fce7f3; color: #ec4899; }
        
        .gender-btn span { font-weight: 700; font-size: 0.9rem; color: #1e293b; }
        .gender-btn .check { margin-left: auto; color: #10b981; }

        .cost-info { text-align: center; font-size: 0.9rem; font-weight: 800; color: #64748b; margin-top: 1rem; }
        .stars { color: #f59e0b; font-size: 1.1rem; }

        .modal-footer { padding: 1.5rem 2rem; background: #f8fafc; display: flex; gap: 1rem; }
        .btn-cancel { flex: 1; padding: 0.8rem; border-radius: 14px; border: none; background: #e2e8f0; color: #64748b; font-weight: 800; cursor: pointer; }
        .btn-confirm { flex: 2; padding: 0.8rem; border-radius: 14px; border: none; background: #1e293b; color: white; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .btn-confirm:hover { background: #0f172a; transform: translateY(-2px); }

        /* Responsive */
        @media (max-width: 640px) {
          .modal-overlay { align-items: flex-end; padding: 0; }
          .modal-container { border-radius: 32px 32px 0 0; max-width: none; }
        }
      `}</style>
    </div>
  );
}
