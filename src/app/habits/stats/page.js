"use client";

import { useHabits } from "@/hooks/useHabits";
import { ChevronLeft, TrendingUp, Calendar, Target, Award } from "lucide-react";
import Link from "next/link";

export default function HabitsStatsPage() {
  const { getStats, records } = useHabits();
  const stats = getStats();

  const today = new Date();
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  const heatmapData = last14Days.map(date => {
    const count = records.filter(r => r.date === date).length;
    return { date, count };
  });

  const maxCount = Math.max(...heatmapData.map(d => d.count), 1);

  return (
    <div className="stats-container animate-fade-in">
      <header className="page-header header-sticky">
        <div className="header-inner">
          <Link href="/habits" className="back-btn"><ChevronLeft size={24} /></Link>
          <h1>坚持统计</h1>
          <div className="placeholder"></div>
        </div>
      </header>

      <main className="stats-content">
        {/* Overview Row */}
        <section className="overview-grid">
          <div className="stat-card card">
            <div className="icon-bg" style={{ backgroundColor: '#EEF2FF' }}><Calendar size={20} color="#4F46E5" /></div>
            <div className="info">
              <span className="label">累计打卡</span>
              <span className="val">{stats.totalCheckIns}次</span>
            </div>
          </div>
          <div className="stat-card card">
            <div className="icon-bg" style={{ backgroundColor: '#ECFDF5' }}><TrendingUp size={20} color="#10B981" /></div>
            <div className="info">
              <span className="label">累计积分</span>
              <span className="val">+{stats.totalPointsFromHabits}</span>
            </div>
          </div>
          <div className="stat-card card">
            <div className="icon-bg" style={{ backgroundColor: '#FEF3C7' }}><Target size={20} color="#F59E0B" /></div>
            <div className="info">
              <span className="label">活跃习惯</span>
              <span className="val">{stats.habitCount}个</span>
            </div>
          </div>
          <div className="stat-card card">
            <div className="icon-bg" style={{ backgroundColor: '#FFF1F2' }}><Award size={20} color="#E11D48" /></div>
            <div className="info">
              <span className="label">正向点击</span>
              <span className="val">{stats.positiveCheckIns}次</span>
            </div>
          </div>
        </section>

        {/* Heatmap Section */}
        <section className="chart-section card">
          <h3>最近 14 天打卡趋势</h3>
          <div className="heatmap-container">
            {heatmapData.map((d, i) => (
              <div key={d.date} className="heatmap-day-column">
                <div 
                  className="bar" 
                  style={{ 
                    height: `${(d.count / maxCount) * 100}%`,
                    backgroundColor: d.count > 0 ? 'var(--primary)' : '#F1F5F9',
                    opacity: d.count > 0 ? 0.3 + (d.count / maxCount) * 0.7 : 1
                  }}
                >
                  {d.count > 0 && <span className="tooltip">{d.count}次</span>}
                </div>
                <span className="date-label">{d.date.split('-')[2]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Breakdown Card */}
        <section className="breakdown-section card">
          <h3>行为分布</h3>
          <div className="progress-stack">
            <div className="progress-item gain" style={{ width: `${(stats.positiveCheckIns / stats.totalCheckIns) * 100 || 0}%` }}></div>
            <div className="progress-item loss" style={{ width: `${(stats.negativeCheckIns / stats.totalCheckIns) * 100 || 0}%` }}></div>
          </div>
          <div className="legend">
            <div className="legend-item"><span className="dot gain"></span> 奖励行为 ({stats.positiveCheckIns})</div>
            <div className="legend-item"><span className="dot loss"></span> 异常反馈 ({stats.negativeCheckIns})</div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .stats-container { min-height: 100vh; background: var(--bg-main); padding-bottom: 2rem; }
        .header-sticky { background: white; box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 100; }
        .header-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 1rem; }
        .page-header h1 { font-size: 1.1rem; font-weight: 700; }
        .back-btn { color: var(--text-main); }
        .placeholder { width: 24px; }

        .stats-content { padding: 1rem; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
        
        .overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
        .stat-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; }
        .icon-bg { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .info .label { font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.1rem; }
        .info .val { font-size: 1.1rem; font-weight: 800; color: var(--text-main); }

        .chart-section { padding: 1.5rem; }
        .chart-section h3 { font-size: 1rem; font-weight: 700; margin-bottom: 2rem; }
        
        .heatmap-container { 
          display: flex; justify-content: space-between; align-items: flex-end; 
          height: 150px; gap: 0.5rem; padding-bottom: 1.5rem; border-bottom: 1px dashed var(--border);
        }
        .heatmap-day-column { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; position: relative; }
        .bar { 
          width: 100%; min-height: 4px; border-radius: 4px 4px 0 0; transition: all 0.3s;
          position: relative;
        }
        .bar .tooltip { 
          position: absolute; top: -25px; left: 50%; transform: translateX(-50%);
          background: #1E293B; color: white; padding: 0.2rem 0.4rem; border-radius: 4px;
          font-size: 0.6rem; white-space: nowrap; visibility: hidden; opacity: 0; transition: 0.2s;
        }
        .bar:hover .tooltip { visibility: visible; opacity: 1; }
        .date-label { font-size: 0.65rem; color: var(--text-muted); margin-top: 0.75rem; }

        .breakdown-section { padding: 1.5rem; }
        .breakdown-section h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1.5rem; }
        .progress-stack { 
          height: 12px; background: #F1F5F9; border-radius: 999px; overflow: hidden; 
          display: flex; margin-bottom: 1rem;
        }
        .progress-item.gain { background: var(--success); }
        .progress-item.loss { background: var(--danger); }
        
        .legend { display: flex; gap: 2rem; }
        .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-muted); }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot.gain { background: var(--success); }
        .dot.loss { background: var(--danger); }

        @media (max-width: 640px) {
          .overview-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
          .stat-card { padding: 1rem; border-radius: 16px; gap: 0.75rem; }
          .icon-bg { width: 36px; height: 36px; border-radius: 10px; }
          .icon-bg :global(svg) { width: 16px; height: 16px; }
          .info .val { font-size: 1rem; }
          .info .label { font-size: 0.65rem; }
          .heatmap-container { height: 120px; gap: 2px; padding-bottom: 1rem; }
          .date-label { font-size: 0.5rem; margin-top: 0.5rem; }
          .chart-section, .breakdown-section { padding: 1rem; border-radius: 16px; }
          .stats-content { padding: 0.75rem; gap: 1rem; }
          .legend { gap: 1rem; }
        }
      `}</style>
    </div>
  );
}
