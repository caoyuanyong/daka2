"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePet, ALL_PET_TYPES } from '@/hooks/useGamification';
import { PET_LEVELS } from '@/constants/rules';
import { Trophy } from 'lucide-react';

export default function EvolutionModal() {
  const { evolutionEvent, clearEvolutionEvent } = usePet();
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (evolutionEvent) {
      setShow(true);
    }
  }, [evolutionEvent]);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!evolutionEvent || !mounted) return null;

  const { typeId, oldLevel, newLevel, petName } = evolutionEvent;
  const petType = ALL_PET_TYPES.find(t => t.id === typeId);
  const newLevelInfo = PET_LEVELS.find(l => l.level === newLevel);
  const oldLevelInfo = PET_LEVELS.find(l => l.level === oldLevel);

  // Correct path for evolutionary images
  const petImage = typeId === 'corgi' 
    ? `/pets/corgi_lv${newLevel}.png` 
    : (petType?.image || '/pets/corgi.png');

  const modalContent = (
    <AnimatePresence>
      {show && (
        <div className="evolution-overlay">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="evolution-backdrop"
          />
          
          <div className="evolution-content-wrapper">
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="evolution-flash"
            />

            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
              className="evolution-card"
            >
              <div className="card-header">
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 0] }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  <Trophy size={64} color="#F59E0B" strokeWidth={2.5} />
                </motion.div>
                <h2>进化成功！</h2>
                <p className="subtitle">{petName} 已经突破了瓶颈</p>
              </div>

              <div className="visual-stage">
                <div className="glow-burst" />
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 2.5, repeat: Infinity }
                  }}
                  className="pet-showcase"
                >
                  <img 
                    src={petImage} 
                    alt="Evolved Pet" 
                    className="evolved-img" 
                    onError={(e) => { e.target.src = '/pets/corgi.png'; }}
                  />
                </motion.div>
              </div>

              <div className="evolution-stats">
                <div className="stage-badges">
                  <span className="badge old">{oldLevelInfo?.name || '初始态'}</span>
                  <div className="arrow-line">→</div>
                  <span className="badge new">{newLevelInfo?.name}</span>
                </div>
                <div className="congrats-text">
                  形态已变为 <span className="highlight">{newLevelInfo?.name}</span>
                </div>
              </div>

              <button className="confirm-btn" onClick={() => {
                setShow(false);
                setTimeout(clearEvolutionEvent, 300);
              }}>
                看我的！
              </button>
            </motion.div>
          </div>

          <style jsx global>{`
            .evolution-overlay {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              z-index: 200000 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .evolution-backdrop {
              position: absolute !important;
              inset: 0 !important;
              background: rgba(0, 0, 0, 0.85) !important;
              backdrop-filter: blur(15px) !important;
              z-index: -1 !important;
            }
            .evolution-content-wrapper {
              position: relative !important;
              z-index: 200001 !important;
              width: 100% !important;
              max-width: 500px !important;
              padding: 20px !important;
              display: flex !important;
              justify-content: center !important;
            }
            .evolution-flash {
              position: fixed !important;
              inset: 0 !important;
              background: white !important;
              z-index: 200005 !important;
              pointer-events: none !important;
            }
            .evolution-card {
              background: white !important;
              width: 100% !important;
              border-radius: 48px !important;
              padding: 4rem 2rem !important;
              text-align: center !important;
              box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8) !important;
            }
            .card-header h2 {
              font-size: 2.6rem !important;
              font-weight: 900 !important;
              background: linear-gradient(135deg, #F59E0B, #EF4444) !important;
              -webkit-background-clip: text !important;
              -webkit-text-fill-color: transparent !important;
              margin: 1.2rem 0 0.5rem !important;
            }
            .subtitle { color: #64748b !important; font-size: 1.1rem !important; margin-bottom: 2.5rem !important; font-weight: 600 !important; }

            .visual-stage {
              height: 240px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              position: relative !important;
              margin-bottom: 3rem !important;
            }
            .glow-burst {
              position: absolute !important;
              width: 300px !important;
              height: 300px !important;
              background: radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%) !important;
              border-radius: 50% !important;
              animation: evo-pulse 3s infinite ease-in-out !important;
            }
            .pet-showcase { position: relative !important; z-index: 2 !important; width: 220px !important; height: 220px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
            .evolved-img { width: 100% !important; height: 100% !important; object-fit: contain !important; filter: drop-shadow(0 0 25px rgba(245, 158, 11, 0.5)) !important; }

            .evolution-stats { margin-bottom: 3.5rem !important; }
            .stage-badges { display: flex !important; align-items: center !important; justify-content: center !important; gap: 1.5rem !important; margin-bottom: 1.5rem !important; }
            .badge { padding: 0.7rem 1.4rem !important; border-radius: 99px !important; font-weight: 800 !important; font-size: 1rem !important; }
            .badge.old { background: #f1f5f9 !important; color: #94a3b8 !important; text-decoration: line-through !important; }
            .badge.new { background: #fee2e2 !important; color: #ef4444 !important; box-shadow: 0 0 25px rgba(239, 68, 68, 0.4) !important; border: 2px solid #fecaca !important; }
            .arrow-line { color: #cbd5e1 !important; font-weight: 900 !important; font-size: 1.5rem !important; }
            .congrats-text { font-size: 1.3rem !important; color: #1e293b !important; font-weight: 800 !important; }
            .highlight { color: #ef4444 !important; }

            .confirm-btn {
              width: 100% !important;
              padding: 1.4rem !important;
              background: #1e293b !important;
              color: white !important;
              border: none !important;
              border-radius: 28px !important;
              font-weight: 900 !important;
              font-size: 1.3rem !important;
              cursor: pointer !important;
              transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
              box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important;
            }
            .confirm-btn:hover { background: #0f172a !important; transform: translateY(-4px) scale(1.02) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important; }
            .confirm-btn:active { transform: translateY(0) scale(0.98) !important; }

            @keyframes evo-pulse {
              0% { transform: scale(0.8); opacity: 0.2; }
              50% { transform: scale(1.15); opacity: 0.6; }
              100% { transform: scale(0.8); opacity: 0.2; }
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
