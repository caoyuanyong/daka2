"use client";

import { usePet, ALL_PET_TYPES } from "@/hooks/useGamification";
import { PET_LEVELS } from "@/constants/rules";
import { Heart, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PetHouse() {
  const { pet, levelName, levelInfo } = usePet();

  const currentType = ALL_PET_TYPES.find(t => t.id === pet.typeId) || ALL_PET_TYPES[0];
  
  // Evolutionary image logic (Dynamic for corgi and cyber_dragon)
  const isEvolutionary = currentType.isEvolutionary || pet.typeId === 'corgi';
  // Evolutionary or Gendered image logic
  let petImage = currentType.image;
  
  if (isEvolutionary) {
    petImage = `/pets/${pet.typeId}_lv${pet.level || 1}.png`;
  } else if (currentType.hasGender) {
    // Determine suffix based on gender (default to male if missing)
    const genderSuffix = pet.gender === 'female' ? 'female' : 'male';
    petImage = `/pets/${pet.typeId}_${genderSuffix}.png`;
  }

  // Ensure values are within valid ranges
  const safeFullness = Math.min(100, Math.max(0, Number(pet.fullness) || 0));
  const safeMood = Math.min(100, Math.max(0, Number(pet.mood) || 0));

  const nextLevelInfo = PET_LEVELS.find(l => l.level === (pet.level || 1) + 1);
  const nextLevelThreshold = nextLevelInfo ? nextLevelInfo.threshold : (pet.level >= 5 ? 1000 : 700);
  const progressPercent = Math.min(100, (pet.intimacy / nextLevelThreshold) * 100);

  return (
    <div className="pet-house animate-fade-in">
      <Link href="/pet" className="pet-container">
        <div className="pet-header">
          <div className="pet-info">
            <h3>{pet.name}</h3>
            <span className="level-badge">{levelName} Lv.{pet.level}</span>
          </div>
          <ChevronRight size={20} className="arrow" />
        </div>

        <div className="pet-body">
          <div className="pet-visual-section">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                scale: levelInfo?.scale || 1
              }}
              transition={{ 
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.5 } 
              }}
              className="pet-display"
              style={{ filter: levelInfo?.effect || 'none' }}
            >
              <img 
                src={petImage} 
                alt={currentType.name} 
                className="pet-img-main" 
                onError={(e) => { 
                  if (e.target.src !== window.location.origin + '/pets/corgi.png') {
                    e.target.src = '/pets/corgi.png'; 
                  }
                }}
              />
            </motion.div>
          </div>

          <div className="pet-stats-section">
            <div className="stat-item">
              <div className="stat-top">
                <span className="label">饱腹度</span>
                <span className="value">{safeFullness}%</span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${safeFullness}%`, backgroundColor: '#F59E0B' }} />
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-top">
                <span className="label">心情值</span>
                <span className="value">{safeMood}%</span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${safeMood}%`, backgroundColor: '#EC4899' }} />
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-top">
                <span className="label">亲密度</span>
                <span className="value">{pet.intimacy}/{nextLevelThreshold}</span>
              </div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${progressPercent}%`, backgroundColor: '#10B981' }} />
              </div>
            </div>
          </div>
        </div>
      </Link>

      <style jsx>{`
        .pet-house {
          background: white;
          border-radius: 24px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          transition: 0.3s;
        }
        .pet-house:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.06);
        }
        .pet-container { display: block; text-decoration: none; color: inherit; }
        
        .pet-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .pet-info h3 { font-size: 1.1rem; font-weight: 900; color: #1e293b; margin: 0; }
        .level-badge { 
          font-size: 0.7rem; background: #eff6ff; color: #3b82f6; 
          padding: 0.2rem 0.6rem; border-radius: 6px; 
          display: inline-block; font-weight: 800; margin-top: 0.3rem;
        }
        .arrow { color: #cbd5e1; }

        .pet-body { 
          display: grid; 
          grid-template-columns: 160px 1fr; 
          gap: 1.5rem; 
          align-items: center; 
          padding: 0.5rem 0;
        }
        
        .pet-visual-section {
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .pet-display {
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .pet-img-main { 
          width: 100%; 
          height: 100%; 
          object-fit: contain; 
          pointer-events: none;
        }

        .pet-stats-section { 
          display: flex; 
          flex-direction: column; 
          gap: 0.8rem; 
          justify-content: center;
        }
        .stat-item { width: 100%; }
        .stat-top { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 0.3rem; 
          font-size: 0.75rem; 
          font-weight: 800;
        }
        .label { color: #64748b; }
        .value { color: #1e293b; }
        
        .bar-bg { height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 999px; transition: width 0.8s ease-out; }

        @media (max-width: 640px) {
          .pet-house { padding: 1rem; border-radius: 20px; }
          .pet-body { 
            grid-template-columns: 74px 1fr; 
            gap: 1rem; 
            padding: 0;
            text-align: left;
          }
          .pet-visual-section { height: 74px; width: 74px; }
          .pet-display { width: 64px; height: 64px; }
          .pet-info h3 { font-size: 1rem; }
          .level-badge { font-size: 0.65rem; }
          .stat-item { gap: 0.2rem; }
          .pet-stats-section { gap: 0.5rem; }
          .stat-top { font-size: 0.65rem; margin-bottom: 0.2rem; }
          .bar-bg { height: 8px; }
        }
      `}</style>
    </div>
  );
}
