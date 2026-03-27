"use client";

import { useApp } from "@/hooks/useAppContext";
import { usePet, ALL_PET_TYPES } from "@/hooks/useGamification";
import { PET_LEVELS } from "@/constants/rules";
import { ChevronLeft, Edit2, Heart, Soup, Bath, TreePine, BedDouble, Lock, Check, Settings, Smile } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdoptPetModal from "@/components/Modals/AdoptPetModal";

export default function PetPage() {
  const { user } = useApp();
  const { pet, myPets, interact, renamePet, levelName, levelInfo, unlockPet, switchPet } = usePet();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(pet?.name || '');
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [selectedAdoptType, setSelectedAdoptType] = useState(null);

  const handleRename = () => {
    if (newName.trim()) {
      renamePet(newName);
      setIsEditingName(false);
    }
  };

  const handleAction = (type, label) => {
    const success = interact(type);
    if (success) {
      setActionFeedback(label);
      setTimeout(() => setActionFeedback(null), 2000);
    }
  };

  const handleAdoptClick = (type) => {
    setSelectedAdoptType(type);
    setIsAdoptModalOpen(true);
  };

  const handleAdoptConfirm = async (name, gender) => {
    if (!selectedAdoptType) return;
    await unlockPet(selectedAdoptType.id, gender);
    setIsAdoptModalOpen(false);
    setSelectedAdoptType(null);
  };

  const currentType = ALL_PET_TYPES.find(t => t.id === pet.typeId) || ALL_PET_TYPES[0];
  
  // Evolutionary image logic
  const isEvolutionary = currentType.isEvolutionary || pet.typeId === 'corgi';
  // Evolutionary or Gendered image logic
  let petImage = currentType.image;
  
  if (isEvolutionary) {
    petImage = `/pets/${pet.typeId}_lv${pet.level || 1}.png`;
  } else if (currentType.hasGender) {
    const genderSuffix = pet.gender === 'female' ? 'female' : 'male';
    petImage = `/pets/${pet.typeId}_${genderSuffix}.png`;
  }

  const heroGradient = pet.typeId === 'cyber_dragon'
    ? 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)'
    : 'linear-gradient(135deg, #22D3EE 0%, #34D399 100%)';

  const stats = [
    { 
      label: '饱腹', value: Number(pet.fullness) || 0, color: '#F59E0B', icon: <Soup size={16} />,
      desc: pet.fullness > 80 ? '非常饱' : (pet.fullness > 40 ? '还不饿' : '饿扁啦') 
    },
    { 
      label: '清洁', value: Number(pet.cleanliness) || 0, color: '#06B6D4', icon: <Bath size={16} />,
      desc: pet.cleanliness > 80 ? '香喷喷' : (pet.cleanliness > 40 ? '还算整洁' : '快给我洗澡') 
    },
    { 
      label: '心情', value: Number(pet.mood) || 0, color: '#10B981', icon: <Smile size={16} />,
      desc: pet.mood > 80 ? '超级开心' : (pet.mood > 40 ? '心情不错' : '有点郁闷') 
    },
  ];

  const actions = [
    { type: 'feed', label: '喂食', icon: Soup, cost: 10, bgcolor: '#F59E0B' },
    { type: 'wash', label: '洗香香', icon: Bath, cost: 15, bgcolor: '#0EA5E9' },
    { type: 'play', label: '去公园', icon: TreePine, cost: 20, bgcolor: '#22C55E' },
    { type: 'sleep', label: '睡觉', icon: BedDouble, cost: 8, bgcolor: '#8B5CF6' },
  ];

  const levelMilestones = PET_LEVELS;

  return (
    <div className="pet-page-container animate-fade-in">
      <header className="floating-header">
        <Link href="/" className="back-btn"><ChevronLeft size={24} /></Link>
        <div className="header-titles">
          <h1>电子宠物</h1>
          <p>用星星积分照顾你的陪伴伙伴</p>
        </div>
        <div className="header-actions">
          <div className="star-badge">
            <span className="star">⭐</span> {user.points} 星星
          </div>
          <button className="settings-btn"><Settings size={20} /></button>
        </div>
      </header>

      <main className="pet-main-layout">
        
        {/* 左列：主要互动区 */}
        <div className="layout-left">
            <div 
              className="hero-gradient-card"
              style={{ background: heroGradient }}
            >
            <div className="hero-top">
              <div className="hero-info">
                <span className="lvl-text">Lv.{pet.level} {levelName}</span>
                {isEditingName ? (
                  <div className="edit-name-row">
                    <input 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleRename}>确认</button>
                  </div>
                ) : (
                  <h2 className="pet-name" onClick={() => setIsEditingName(true)}>
                    {pet.name} <Edit2 size={16} className="edit-icon" />
                  </h2>
                )}
              </div>
              <div className="hero-tag">
                {currentType.name}
              </div>
            </div>

            <div className="hero-center">
              <AnimatePresence>
                {actionFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: -40 }}
                    exit={{ opacity: 0, y: -60 }}
                    className="feedback-bubble"
                  >
                    {actionFeedback}! ✨
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div 
                animate={{ 
                  y: [0, -12, 0], 
                  scale: actionFeedback ? [levelInfo?.scale || 1, (levelInfo?.scale || 1) * 1.05, levelInfo?.scale || 1] : (levelInfo?.scale || 1) 
                }}
                transition={{ 
                  y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 0.5 }
                }}
                style={{ filter: levelInfo?.effect || 'none' }}
              >
                <div className="pet-img-stage">
                  <img 
                    src={petImage} 
                    alt={currentType.name} 
                    className="hero-pet-image" 
                    onError={(e) => { 
                      if (e.target.src !== window.location.origin + '/pets/corgi.png') {
                        e.target.src = '/pets/corgi.png'; 
                      }
                    }}
                  />
                </div>
              </motion.div>
            </div>

            <div className="hero-bottom">
              <p className="mood-quote">每天都有你陪着，我真的很幸福...</p>
            </div>
            </div>

          <section className="status-cards-row">
            {stats.map(s => (
              <div key={s.label} className="status-small-card">
                <div className="status-header">
                  <div className="status-title">
                    <span className="s-icon">{s.icon}</span> {s.label}
                  </div>
                  <div className="status-value">{s.value.toFixed(0)}/100</div>
                </div>
                <div className="s-bar-bg">
                  <div className="s-bar-fill" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                </div>
                <div className="status-desc">{s.desc}</div>
              </div>
            ))}
          </section>

          <section className="actions-grid">
            {actions.map(action => (
              <button 
                key={action.type} 
                className="action-mega-card"
                style={{ backgroundColor: action.bgcolor }}
                onClick={() => handleAction(action.type, action.label)}
              >
                <div className="action-top">
                  <action.icon size={26} color="white" />
                  <div className="cost-pill">-{action.cost} 星星</div>
                </div>
                <div className="action-body">
                  <h3>{action.label}</h3>
                  <p>轻轻点一下，就能让它更开心。</p>
                </div>
              </button>
            ))}
          </section>
        </div>

        {/* 右列：信息面板 */}
        <div className="layout-right">
          <section className="growth-progress-card">
            <div className="panel-title">
              <Heart size={20} color="#ef4444" fill="#ef4444" />
              <span>成长进度</span>
            </div>
            
            <div className="intimacy-huge-number">
              <h1>{pet.intimacy}</h1>
              <p>当前亲密度</p>
            </div>

            <div className="levels-stepper">
              {levelMilestones.map(m => {
                const isCurrent = pet.level === m.level;
                return (
                  <div key={m.level} className={`milestone-item ${isCurrent ? 'current' : ''}`}>
                    <div className="m-info">
                      <div className="m-title">
                        Lv.{m.level} {m.name}
                        {isCurrent && <span className="current-badge">当前形态</span>}
                      </div>
                      <p className="m-desc">{m.form === 'legendary' ? '最高阶形态，拥有神秘力量。' : `亲密度达到 ${m.threshold} 即可进化。`}</p>
                    </div>
                    <div className="m-req">{m.threshold}+</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="more-pets-section">
            <div className="panel-title">
              <span className="paw-icon">🐾</span>
              <span>更换宠物</span>
            </div>
            
            <div className="pets-vertical-list">
              {ALL_PET_TYPES.map(type => {
                const isActive = pet.typeId === type.id;
                const isUnlocked = myPets.includes(type.id) || isActive;

                return (
                  <div key={type.id} className={`pet-list-item ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked-item' : ''}`}>
                    <div className="item-avatar-box">
                      <img 
                        src={type.hasGender ? `/pets/${type.id}_male.png` : (type.image || '/pets/corgi.png')} 
                        alt={type.name} 
                        className={`item-pet-img ${!isUnlocked ? 'gray-avatar' : ''}`} 
                        onError={(e) => { 
                          if (e.target.src !== window.location.origin + '/pets/corgi.png') {
                            e.target.src = '/pets/corgi.png'; 
                          }
                        }}
                      />
                      {!isUnlocked && (
                        <div className="lock-overlay"><Lock size={12} strokeWidth={3} color="white" /></div>
                      )}
                    </div>
                    
                    <div className="item-info">
                      <div className="item-name-row">
                        <h4>{type.name}</h4>
                        <span className={`rarity-badge ${type.rarity}`}>{type.rarity.toUpperCase()}</span>
                      </div>
                      <p>{type.desc}</p>
                    </div>

                    <div className="item-action">
                      {isActive ? (
                        <div className="active-status">陪伴中</div>
                      ) : isUnlocked ? (
                        <button className="btn-switch" onClick={() => switchPet(type.id)}>切换</button>
                      ) : (
                        <button className="btn-buy" onClick={() => handleAdoptClick(type)}>-{type.cost} 星星</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <AdoptPetModal 
        isOpen={isAdoptModalOpen} 
        onClose={() => setIsAdoptModalOpen(false)}
        petType={selectedAdoptType}
        onConfirm={handleAdoptConfirm}
      />

      <style jsx>{`
        .pet-page-container {
          min-height: 100vh;
          background: #F1F5F9;
          padding: 1.5rem var(--content-padding);
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .floating-header {
          background: white;
          padding: 1.5rem 2rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          width: 100%;
          box-sizing: border-box;
        }
        .back-btn { color: #475569; display: flex; }
        .header-titles { flex: 1; }
        .header-titles h1 { font-size: 1.1rem; font-weight: 900; color: #0f172a; margin-bottom: 0.1rem; }
        .header-titles p { font-size: 0.75rem; color: #64748b; font-weight: 500; }
        .header-actions { display: flex; align-items: center; gap: 0.8rem; }
        .star-badge { background: #FEF3C7; color: #B45309; padding: 0.4rem 0.8rem; border-radius: 999px; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; gap: 0.3rem; }
        .settings-btn { background: #F1F5F9; border: none; padding: 0.5rem; border-radius: 50%; color: #64748b; cursor: pointer; display: flex; }

        .pet-main-layout {
          display: grid;
          max-width: 100%;
          grid-template-columns: 1fr 380px;
          gap: 1.5rem;
          width: 100%;
          box-sizing: border-box;
          margin: 0 auto;
          align-items: start;
        }

        .layout-left { display: flex; flex-direction: column; gap: 1.5rem; }
        .layout-right { display: flex; flex-direction: column; gap: 1.5rem; }

        /* ----- Hero Gradient Stage ----- */
        .hero-gradient-card {
          width: 100%;
          box-sizing: border-box;
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          padding: 2.5rem;
          border-radius: 32px;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
          display: flex;
          flex-direction: column;
          height: 380px;
        }
        
        .hero-top { display: flex; justify-content: space-between; align-items: flex-start; z-index: 2; }
        .hero-info { display: flex; flex-direction: column; gap: 0.4rem; }
        .lvl-text { font-size: 0.9rem; font-weight: 700; opacity: 0.9; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .pet-name { font-size: 2.5rem; font-weight: 900; display: flex; align-items: center; gap: 0.5rem; text-shadow: 0 2px 8px rgba(0,0,0,0.15); cursor: pointer; margin: 0; line-height: 1; }
        .edit-icon { opacity: 0.5; padding: 4px; border-radius: 50%; background: rgba(255,255,255,0.2); width: 32px; height: 32px; transition: 0.2s; }
        .pet-name:hover .edit-icon { opacity: 1; background: rgba(255,255,255,0.3); }
        .hero-tag { background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); padding: 0.5rem 1rem; border-radius: 999px; font-weight: 800; font-size: 0.9rem; }
        .edit-name-row { display: flex; gap: 0.5rem; }
        .edit-name-row input { background: rgba(255,255,255,0.2); border: 2px solid white; color: white; padding: 0.5rem 1rem; border-radius: 12px; font-size: 1.5rem; font-weight: 800; outline: none; width: 200px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .edit-name-row button { background: white; color: #0EA5E9; border: none; border-radius: 12px; padding: 0 1.2rem; font-weight: 800; cursor: pointer; }

        .hero-center { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; min-height: 220px; }
        .pet-img-stage { filter: drop-shadow(0 20px 30px rgba(0,0,0,0.2)); display: flex; align-items: center; justify-content: center; user-select: none; }
        .hero-pet-image { width: 220px; height: 220px; object-fit: contain; pointer-events: none; }
        .feedback-bubble { position: absolute; background: white; color: #0EA5E9; padding: 0.8rem 1.5rem; border-radius: 999px; font-weight: 900; font-size: 1.1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }

        .hero-bottom { text-align: center; z-index: 2; padding-top: 2rem; }
        .mood-quote { font-size: 0.95rem; font-weight: 600; opacity: 0.95; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }

        /* ----- Status Strip (3 Cards) ----- */
        .status-cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .status-small-card { background: white; border-radius: 20px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.8rem; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
        .status-header { display: flex; justify-content: space-between; align-items: center; }
        .status-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 800; color: #1e293b; }
        .s-icon { color: #94a3b8; display: flex; }
        .status-value { font-size: 0.9rem; font-weight: 900; color: #0f172a; }
        
        .s-bar-bg { height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
        .s-bar-fill { height: 100%; border-radius: 999px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .status-desc { font-size: 0.75rem; color: #64748b; font-weight: 500; }

        /* ----- Mega Actions Grid ----- */
        .actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .action-mega-card { border: none; border-radius: 24px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; min-height: 140px; color: white; cursor: pointer; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); text-align: left; box-shadow: inset 0 -4px 0 rgba(0,0,0,0.1); position: relative; overflow: hidden; }
        .action-mega-card:hover { transform: translateY(-4px); box-shadow: inset 0 -4px 0 rgba(0,0,0,0.1), 0 10px 25px rgba(0,0,0,0.15); filter: brightness(1.05); }
        .action-mega-card:active { transform: translateY(0); box-shadow: inset 0 -2px 0 rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.1); }
        
        .action-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .cost-pill { background: rgba(255,255,255,0.25); backdrop-filter: blur(4px); padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.75rem; font-weight: 800; color: white; }
        
        .action-body h3 { font-size: 1.4rem; font-weight: 900; margin-bottom: 0.3rem; }
        .action-body p { font-size: 0.75rem; opacity: 0.9; font-weight: 500; }

        /* ----- Right Panel Base ----- */
        .growth-progress-card, .more-pets-section { 
          width: 100%;
          box-sizing: border-box;
          background: white; 
          border-radius: 24px; 
          padding: 1.5rem; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.02); 
        }
        .panel-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.05rem; font-weight: 900; color: #0f172a; margin-bottom: 1.5rem; }
        .paw-icon { color: #f59e0b; }

        /* ----- Growth Progress ----- */
        .intimacy-huge-number { margin-bottom: 1.5rem; }
        .intimacy-huge-number h1 { font-size: 2.8rem; font-weight: 900; color: #0f172a; line-height: 1; margin: 0; }
        .intimacy-huge-number p { font-size: 0.8rem; color: #64748b; font-weight: 600; margin-top: 0.4rem; }

        .levels-stepper { display: flex; flex-direction: column; gap: 0.8rem; }
        .milestone-item { padding: 1rem; border-radius: 16px; border: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
        .milestone-item.current { background: #dcfce7; border-color: #86efac; }
        
        .m-info { display: flex; flex-direction: column; gap: 0.3rem; }
        .m-title { font-size: 0.9rem; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
        .current-badge { background: #16a34a; color: white; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.65rem; font-weight: 800; }
        .m-desc { font-size: 0.75rem; color: #64748b; font-weight: 500; max-width: 200px; }
        .current .m-desc { color: #166534; }
        
        .m-req { font-size: 0.85rem; font-weight: 700; color: #94a3b8; }
        .current .m-req { color: #166534; }

        /* ----- Changing Pets Vertical List ----- */
        .pets-vertical-list { display: flex; flex-direction: column; gap: 1rem; margin-top: -0.5rem; }
        .pet-list-item { display: flex; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #f1f5f9; }
        .pet-list-item:last-child { border-bottom: none; padding-bottom: 0; }

        .item-avatar-box { position: relative; width: 64px; height: 64px; border-radius: 16px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; flex-shrink: 0; }
        .item-pet-img { width: 100%; height: 100%; object-fit: cover; }
        .gray-avatar { filter: grayscale(1) brightness(0.9); }
        .lock-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; }

        .item-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.3rem; }
        .item-info h4 { font-size: 0.95rem; font-weight: 800; color: #1e293b; margin: 0; }
        .item-info p { font-size: 0.75rem; color: #64748b; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 0.5rem; }

        .item-action { flex-shrink: 0; }
        .active-status { font-size: 0.8rem; font-weight: 800; color: #10b981; padding: 0.4rem 0.8rem; background: #dcfce7; border-radius: 999px; }
        .btn-switch { background: white; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 999px; padding: 0.4rem 1rem; font-size: 0.8rem; font-weight: 800; cursor: pointer; }
        .btn-buy { background: #f59e0b; color: white; border: none; border-radius: 999px; padding: 0.4rem 1rem; font-size: 0.8rem; font-weight: 800; cursor: pointer; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2); }

        .item-name-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem; }
        .rarity-badge { font-size: 0.6rem; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 900; letter-spacing: 0.5px; }
        .rarity-badge.common { background: #f1f5f9; color: #64748b; }
        .rarity-badge.rare { background: #dcfce7; color: #16a34a; }
        .rarity-badge.epic { background: #e0e7ff; color: #4338ca; }
        .rarity-badge.legendary { background: #fef3c7; color: #b45309; }
        .rarity-badge.mythic { background: #fae8ff; color: #a21caf; border: 1px solid #d946ef; animation: pulse-shadow 2s infinite; }

        @keyframes pulse-shadow {
          0% { box-shadow: 0 0 0 0 rgba(217, 70, 239, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(217, 70, 239, 0); }
          100% { box-shadow: 0 0 0 0 rgba(217, 70, 239, 0); }
        }

        @media (max-width: 900px) {
          .pet-main-layout { grid-template-columns: 1fr; }
          .layout-right { order: 2; }
          .layout-left { order: 1; }
        }

        @media (max-width: 768px) {
          .pet-page-container { 
            padding: 0 0 2rem 0 !important; 
            overflow-x: hidden !important; 
            display: block !important;
            width: 100% !important; 
            box-sizing: border-box !important; 
          }
          .floating-header { 
            padding: 10px !important; margin-bottom: 10px !important; border-radius: 12px !important; gap: 8px !important; 
            width: 100% !important; max-width: 100% !important; box-sizing: border-box !important;
          }
          .header-titles h1 { font-size: 1rem; }
          .header-titles p { display: none; }
          .star-badge { font-size: 0.75rem; padding: 0.3rem 0.6rem; }

          .hero-gradient-card { 
            padding: 1.25rem !important; height: auto !important; min-height: 180px !important; 
            border-radius: 20px !important; width: auto !important; max-width: 100% !important; 
            margin: 0 0 1rem 0 !important; box-sizing: border-box !important;
          }
          .pet-name { font-size: 1.5rem; }
          .lvl-text { font-size: 0.75rem; }
          .hero-tag { font-size: 0.75rem; padding: 0.3rem 0.75rem; }
          .hero-center { min-height: 140px; }
          .hero-pet-image { width: 140px; height: 140px; }
          .hero-bottom { padding-top: 1rem; }
          .mood-quote { font-size: 0.8rem; }
          
          .status-cards-row { grid-template-columns: repeat(3, 1fr) !important; gap: 8px !important; width: auto !important; }
          .status-small-card { padding: 0.75rem 0.5rem; border-radius: 12px; gap: 0.4rem; }
          .status-header { flex-direction: column; align-items: flex-start; gap: 0.2rem; }
          .status-title { font-size: 0.7rem; }
          .status-value { font-size: 0.75rem; }
          .s-bar-bg { height: 4px; }
          .status-desc { font-size: 0.6rem; }

          .actions-grid { 
            display: flex !important; flex-direction: column !important; 
            grid-template-columns: none !important; 
            gap: 10px !important; width: auto !important; box-sizing: border-box !important; 
          }
          .action-mega-card { 
            padding: 12px !important; min-height: none !important; height: auto !important; 
            border-radius: 12px !important; width: auto !important; max-width: 100% !important;
            box-sizing: border-box !important; 
            display: flex !important; align-items: center !important; justify-content: space-between !important;
            gap: 10px !important;
          }
          .action-top { margin-bottom: 0 !important; display: flex !important; align-items: center !important; gap: 6px !important; order: 2 !important; }
          .cost-pill { font-size: 11px !important; padding: 2px 6px !important; white-space: nowrap !important; line-height: 1 !important; }
          .action-body { order: 1 !important; flex: 1 !important; min-width: 0 !important; }
          .action-body h3 { font-size: 14px !important; margin: 0 !important; word-break: break-all !important; }
          .icon-badge { width: 32px !important; height: 32px !important; flex-shrink: 0 !important; }

          .growth-progress-card { padding: 12px !important; border-radius: 16px !important; width: auto !important; max-width: 100% !important; margin: 0 0 1rem 0 !important; box-sizing: border-box !important; }
          .more-pets-section { padding: 12px 10px !important; border-radius: 16px !important; margin: 1rem 0 0 0 !important; width: auto !important; max-width: 100% !important; box-sizing: border-box !important; }
          .milestone-item { 
            padding: 10px 8px !important; border-radius: 12px !important; gap: 8px !important; 
            display: flex !important; align-items: center !important; justify-content: space-between !important;
            width: auto !important; box-sizing: border-box !important;
          }
          .milestone-info { flex: 1 !important; min-width: 0 !important; }
          .m-desc { font-size: 11px !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
          .m-points { font-size: 14px !important; font-weight: 800 !important; min-width: 30px !important; text-align: right !important; flex-shrink: 0 !important; }
          
          .pet-list-item { padding: 10px 0 !important; gap: 8px !important; width: auto !important; border-bottom: 1px solid #f1f5f930 !important; }
          .item-avatar-box { width: 44px !important; height: 44px !important; border-radius: 12px !important; }
          .item-info { flex: 1 !important; min-width: 0 !important; }
          .item-name-row h4 { font-size: 14px !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }
          .item-info p { 
            font-size: 11px !important; line-height: 1.3 !important; 
            white-space: normal !important; word-break: break-all !important;
            opacity: 0.8 !important;
          }
          .btn-switch, .btn-buy, .active-status { 
            padding: 6px 10px !important; font-size: 11px !important; 
            min-width: 58px !important; text-align: center !important; border-radius: 8px !important;
          }
          .item-action { margin-left: 8px !important; flex-shrink: 0 !important; }
        }

        @media (max-width: 480px) {
          .status-cards-row { gap: 0.35rem; }
          .status-small-card { padding: 0.6rem 0.25rem; border-radius: 10px; }
          .pet-name { font-size: 1.35rem; }
          .m-lvl { font-size: 0.7rem; }
          .m-points { font-size: 0.85rem; font-weight: 800; min-width: 24px; text-align: right; }
          .item-avatar-box { width: 40px; height: 40px; }
          .item-name-row h4 { font-size: 0.8rem; }
          .btn-switch, .btn-buy, .active-status { min-width: 54px; font-size: 0.65rem; padding: 0.3rem 0.5rem; }
        }
      `}</style>
    </div>
  );
}
