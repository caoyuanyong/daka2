"use client";

import { useRewards } from "@/hooks/useRewards";
import { ChevronLeft, Award } from "lucide-react";
import Link from "next/link";

export default function AchievementsPage() {
  const { medals = [] } = useRewards();

  const unlockedCount = medals.filter(a => a.unlocked).length;

  return (
    <div className="achievements-container animate-fade-in">
      <header className="page-header">
        <div className="header-inner">
          <Link href="/rewards" className="back-btn"><ChevronLeft size={24} /></Link>
          <h1>成就系统</h1>
          <div className="placeholder"></div>
        </div>
      </header>

      <main className="achievements-content">
        <section className="stat-summary card">
          <div className="stat-item">
            <span className="val">{unlockedCount}</span>
            <span className="lbl">已解锁</span>
          </div>
          <div className="divider"></div>
          <div className="stat-item">
            <span className="val">{medals.length}</span>
            <span className="lbl">总勋章</span>
          </div>
        </section>

        <div className="medal-grid">
          {medals.map(a => (
            <div key={a.id} className={`medal-card card ${a.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="medal-icon">
                {a.unlocked ? a.icon : <Award size={32} color="#CBD5E1" />}
              </div>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
              {a.unlocked ? (
                <div className="status-tag">已达成</div>
              ) : (
                <div className="reward-tag">奖励 {a.reward} ⭐</div>
              )}
            </div>
          ))}
        </div>
      </main>

      <style jsx>{`
        .achievements-container { min-height: 100vh; background: var(--bg-main); padding-bottom: 2rem; }
        .page-header { background: white; box-shadow: var(--shadow-sm); z-index: 100; position: sticky; top: 0; }
        .header-inner {
          max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 1rem;
        }
        .page-header h1 { font-size: 1.1rem; font-weight: 700; }
        .back-btn { color: var(--text-main); }
        .placeholder { width: 24px; }

        .achievements-content { padding: 1rem; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
        
        .stat-summary { display: flex; align-items: center; padding: 2rem; justify-content: center; gap: 4rem; }
        .stat-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .val { font-size: 2rem; font-weight: 800; color: var(--primary); }
        .lbl { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        .divider { width: 1px; height: 40px; background: var(--border); }

        .medal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        .medal-card {
          padding: 2rem 1rem; display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 0.75rem; transition: transform 0.2s, box-shadow 0.2s;
        }
        .medal-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .medal-icon {
          width: 80px; height: 80px; border-radius: 50%; background: #F8FAFC;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; margin-bottom: 0.5rem;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }
        .locked .medal-icon { background: #F1F5F9; }
        
        .medal-card h3 { font-size: 1rem; font-weight: 700; }
        .medal-card p { font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; }
        
        .status-tag { font-size: 0.7rem; background: #DCFCE7; color: var(--success); padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 700; }
        .reward-tag { font-size: 0.7rem; background: #FEF3C7; color: #D97706; padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 700; }
        
        .locked { filter: grayscale(0.8); opacity: 0.7; }
        .locked h3, .locked p { color: #94A3B8; }

        @media (max-width: 640px) {
          .medal-grid { grid-template-columns: 1fr 1fr; gap: 0.5rem; }
          .stat-summary { gap: 1.5rem; padding: 1.25rem; }
          .val { font-size: 1.5rem; }
          .medal-icon { width: 60px; height: 60px; font-size: 1.75rem; }
          .medal-card { padding: 1.25rem 0.5rem; border-radius: 16px; }
          .medal-card h3 { font-size: 0.85rem; }
          .medal-card p { font-size: 0.7rem; }
          .achievements-content { padding: 0.75rem; }
        }
      `}</style>
    </div>
  );
}
