"use client";

import React, { useState } from 'react';
import { useApp } from '@/hooks/useAppContext';
import { Ticket, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function RedeemPage() {
  const { redeemCoupon, family } = useApp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setResult(null);
    
    const res = await redeemCoupon(code);
    setResult(res);
    setLoading(false);
    if (res.success) setCode('');
  };

  return (
    <div className="redeem-container">
      <div className="header-nav">
        <Link href="/" className="back-btn">
          <ArrowLeft size={20} /> 返回首页
        </Link>
      </div>

      <div className="redeem-card card animate-slide-up">
        <div className="icon-box">
          <Ticket size={48} color="#f59e0b" />
        </div>
        <h1>会员卡密兑换</h1>
        <p>输入您的 12 位或 16 位卡密，开启 Premium 权益</p>

        <form onSubmit={handleRedeem} className="redeem-form">
          <input 
            type="text" 
            placeholder="请输入卡密 (例如: VIP-XXXX-XXXX)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            className={result?.success === false ? 'error' : ''}
          />
          
          <button type="submit" className="submit-btn" disabled={loading || !code}>
            {loading ? '正在验证...' : <><Zap size={18} fill="currentColor" /> 立即兑换</>}
          </button>
        </form>

        {result && (
          <div className={`result-box ${result.success ? 'success' : 'error'}`}>
            {result.success ? <Sparkles size={16} /> : null}
            {result.message}
          </div>
        )}

        <div className="info-section">
          <h3>会员权益</h3>
          <ul>
            <li>✨ 完整解锁学习计划（艾宾浩斯记忆法）</li>
            <li>🐾 解锁所有稀有宠物与进化形态</li>
            <li>🏆 尊贵会员标识与专属成就奖章</li>
            <li>☁️ 多设备数据云端实时同步</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .redeem-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .header-nav {
          width: 100%;
          max-width: 500px;
          margin-bottom: 2rem;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.2s;
        }
        .back-btn:hover { color: var(--primary); }
        
        .redeem-card {
          width: 100%;
          max-width: 500px;
          background: white;
          padding: 3rem 2rem;
          text-align: center;
          border-radius: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }
        .icon-box {
          width: 100px;
          height: 100px;
          background: #fffbeb;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        h1 { font-size: 1.75rem; color: #1e293b; margin-bottom: 0.75rem; font-weight: 800; }
        p { color: #64748b; margin-bottom: 2.5rem; font-size: 0.95rem; }

        .redeem-form { display: flex; flex-direction: column; gap: 1rem; }
        input {
          padding: 1.25rem;
          border-radius: 16px;
          border: 2px solid #e2e8f0;
          font-size: 1.1rem;
          text-align: center;
          font-family: monospace;
          letter-spacing: 0.1em;
          transition: all 0.2s;
        }
        input:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); }
        input.error { border-color: #ef4444; }

        .submit-btn {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 1.25rem;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) { background: #d97706; transform: translateY(-2px); }
        .submit-btn:disabled { background: #cbd5e1; cursor: not-allowed; }

        .result-box {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .result-box.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .result-box.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

        .info-section {
          margin-top: 3rem;
          border-top: 1px solid #f1f5f9;
          padding-top: 2rem;
          text-align: left;
        }
        .info-section h3 { font-size: 1rem; color: #1e293b; margin-bottom: 1rem; font-weight: 700; }
        ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
        li { font-size: 0.9rem; color: #475569; display: flex; align-items: center; gap: 0.5rem; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
          .redeem-container { padding: 1rem; }
          .redeem-card { padding: 2rem 1.25rem; border-radius: 24px; }
          .icon-box { width: 70px; height: 70px; border-radius: 20px; margin-bottom: 1rem; }
          .icon-box :global(svg) { width: 32px; height: 32px; }
          h1 { font-size: 1.4rem; }
          p { margin-bottom: 1.5rem; font-size: 0.85rem; }
          input { padding: 1rem; font-size: 0.95rem; border-radius: 12px; }
          .submit-btn { padding: 1rem; font-size: 1rem; border-radius: 12px; }
          .info-section { margin-top: 2rem; padding-top: 1.5rem; }
          .info-section h3 { font-size: 0.9rem; }
          li { font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
}
