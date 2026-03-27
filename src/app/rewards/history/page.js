"use client";

import { useRewards } from '@/hooks/useRewards';
import { ChevronLeft, TrendingUp, TrendingDown, Star, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { history } = useRewards();

  const totalGained = history.filter(h => h.type === 'GAIN').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSpent = history.filter(h => h.type === 'LOSS').reduce((acc, curr) => acc + curr.amount, 0);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="history-container">
      <header className="page-header">
        <Link href="/rewards" className="back-btn"><ChevronLeft size={24} /></Link>
        <h1>收支明细</h1>
        <div className="placeholder" />
      </header>

      <div className="stats-cards content-width">
        <div className="stat-box gain card">
          <TrendingUp size={20} className="icon" />
          <div className="info">
            <p>累计获得</p>
            <h3>{totalGained}</h3>
          </div>
        </div>
        <div className="stat-box loss card">
          <TrendingDown size={20} className="icon" />
          <div className="info">
            <p>累计消耗</p>
            <h3>{totalSpent}</h3>
          </div>
        </div>
      </div>

      <main className="history-list content-width">
        {history.length === 0 ? (
          <div className="empty-state">
            <Star size={48} />
            <p>暂无收支记录，快去完成任务吧！</p>
          </div>
        ) : (
          history.map(item => (
            <div key={item.id} className="history-item card">
              <div className="item-main">
                <div className="item-title">
                  <h4>{item.reason}</h4>
                  <span className="item-date"><Calendar size={12} /> {formatDate(item.date)}</span>
                </div>
                <div className={`item-amount ${item.type}`}>
                  {item.type === 'GAIN' ? '+' : '-'}{item.amount}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      <style jsx>{`
        .history-container { min-height: 100vh; background: #F8FAFC; padding-bottom: 2rem; }
        .page-header { background: white; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #f1f5f9; }
        .page-header h1 { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
        .back-btn { color: #64748b; }
        .placeholder { width: 24px; }

        .content-width { max-width: 500px; margin: 0 auto; padding: 0 1.25rem; }

        .stats-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; margin-bottom: 2rem; }
        .stat-box { padding: 1.25rem; display: flex; align-items: center; gap: 0.75rem; border: none; }
        .stat-box.gain { background: #ECFDF5; }
        .stat-box.gain .icon { color: #10B981; }
        .stat-box.gain h3 { color: #065F46; }
        .stat-box.loss { background: #FEF2F2; }
        .stat-box.loss .icon { color: #EF4444; }
        .stat-box.loss h3 { color: #991B1B; }
        
        .info p { font-size: 0.7rem; color: #64748b; font-weight: 700; }
        .info h3 { font-size: 1.5rem; font-weight: 900; }

        .history-item { margin-bottom: 0.75rem; border: none; padding: 1rem 1.25rem; }
        .item-main { display: flex; justify-content: space-between; align-items: center; }
        .item-title h4 { font-size: 0.95rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; }
        .item-date { font-size: 0.7rem; color: #94a3b8; display: flex; align-items: center; gap: 0.3rem; font-weight: 600; }
        .item-amount { font-size: 1.1rem; font-weight: 900; }
        .item-amount.GAIN { color: #10B981; }
        .item-amount.LOSS { color: #EF4444; }

        .empty-state { text-align: center; color: #cbd5e1; padding: 4rem 1rem; }
        .empty-state p { margin-top: 1rem; font-size: 0.9rem; font-weight: 600; }
        @media (max-width: 640px) {
          .stats-cards { margin-top: 1rem; margin-bottom: 1.5rem; gap: 0.75rem; }
          .stat-box { padding: 1rem; border-radius: 16px; }
          .info h3 { font-size: 1.25rem; }
          .history-item { padding: 0.75rem 1rem; border-radius: 12px; }
          .item-title h4 { font-size: 0.85rem; }
          .item-amount { font-size: 1rem; }
          .content-width { padding: 0 0.75rem; }
        }
      `}</style>
    </div>
  );
}
