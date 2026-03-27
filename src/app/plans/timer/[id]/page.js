"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Lightbulb, Timer as TimerIcon, Hourglass, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLearningPlan } from '@/hooks/useLearningPlan';

export default function TimerPage() {
  const router = useRouter();
  const { id } = useParams();
  const { plans } = useLearningPlan();

  const plan = plans?.find(p => p.id === id) || { title: '正在学习', category: '学习' };

  const [mode, setMode] = useState('countUp'); // countUp, countDown, pomodoro
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (mode === 'countDown' || mode === 'pomodoro') {
          setSeconds(prev => (prev > 0 ? prev - 1 : 0));
          if (seconds === 0) setIsActive(false);
        } else {
          setSeconds(prev => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, mode, seconds]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return {
      hrs: String(hrs).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
    };
  };

  const time = formatTime(seconds);

  const handleStart = () => setIsActive(!isActive);
  const handleReset = () => {
    setIsActive(false);
    if (mode === 'countUp') setSeconds(0);
    if (mode === 'pomodoro') setSeconds(1500);
    if (mode === 'countDown') setSeconds(3600);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'countUp') setSeconds(0);
    if (newMode === 'pomodoro') setSeconds(1500);
    if (newMode === 'countDown') setSeconds(3600);
  };

  return (
    <div className="timer-container">
      {/* Blue Header Section */}
      <header className="timer-header">
        <button className="back-btn" onClick={() => router.back()}>
          <ArrowLeft size={18} />
          <span>返回</span>
        </button>

        <div className="header-info">
          <span className="category-badge">{plan.category}</span>
          <h1 className="plan-title">{plan.title}</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="timer-content">
        <motion.div
          className="timer-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Controls Row */}
          <div className="card-top-row">
            <div className="mode-tabs">
              <button
                className={`mode-btn ${mode === 'countUp' ? 'active' : ''}`}
                onClick={() => changeMode('countUp')}
              >
                <Flame size={14} /> <span>正计</span>
              </button>
              <button
                className={`mode-btn ${mode === 'countDown' ? 'active' : ''}`}
                onClick={() => changeMode('countDown')}
              >
                <Hourglass size={14} /> <span>倒计</span>
              </button>
              <button
                className={`mode-btn ${mode === 'pomodoro' ? 'active' : ''}`}
                onClick={() => changeMode('pomodoro')}
              >
                <TimerIcon size={14} /> <span>番茄</span>
              </button>
            </div>
          </div>

          <div className="timer-body">
            {/* Mode Name */}
            <div className="current-mode-label">
              <TimerIcon size={24} className="text-blue-500" />
              <h2>{mode === 'countUp' ? '正计时' : mode === 'countDown' ? '倒计时' : '番茄钟'}</h2>
            </div>

            {/* Time Display */}
            <div className="time-row">
              <div className="digit-group">
                <div className="digit-box bg-blue">
                  <span className="number">{time.hrs}</span>
                </div>
                <span className="label">小时</span>
              </div>

              <div className="time-sep">:</div>

              <div className="digit-group">
                <div className="digit-box bg-purple">
                  <span className="number">{time.mins}</span>
                </div>
                <span className="label">分钟</span>
              </div>

              <div className="time-sep">:</div>

              <div className="digit-group">
                <div className="digit-box bg-orange">
                  <span className="number">{time.secs}</span>
                </div>
                <span className="label">秒</span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="status-indicator">
              <div className={`status-dot ${isActive ? 'pulse' : ''}`} />
              <span>{isActive ? '正在进行中' : '等待开始'}</span>
            </div>

            {/* Primary Action */}
            <div className="btn-stack">
              <button
                className={`start-btn ${isActive ? 'stop' : 'work'}`}
                onClick={handleStart}
              >
                {isActive ? <Pause size={24} /> : <Play size={24} fill="white" />}
                <span>{isActive ? '停止学习' : '开始学习'}</span>
              </button>

              <button 
                className="reset-link" 
                onClick={handleReset}
                style={{ visibility: (!isActive && seconds > 0) ? 'visible' : 'hidden' }}
              >
                <RotateCcw size={14} /> 重置计时
              </button>
            </div>
          </div>

          {/* Tips Footer */}
          <footer className="footer-tips">
            <div className="tip-box">
              <Lightbulb size={18} className="text-amber-500" />
              <span>{mode === 'pomodoro' ? '番茄模式：专注25分钟，提高效率' : '学习建议：保持专注，每一秒都有意义'}</span>
            </div>
          </footer>
        </motion.div>
      </main>

      <style jsx>{`
        .timer-container {
          height: 100vh;
          background-color: #F8FAFC;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .timer-header {
          height: 220px;
          background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          padding: 2rem;
          position: relative;
          flex-shrink: 0;
        }

        .back-btn {
          position: absolute;
          left: 2rem;
          top: 2rem;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s;
          font-size: 0.85rem;
        }
        .back-btn:hover { background: rgba(255, 255, 255, 0.25); transform: translateX(-4px); }

        .header-info {
          text-align: center;
          margin-top: 0.5rem;
        }
        .category-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.3rem 1.4rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 800;
        }
        .plan-title {
          font-size: 3rem;
          font-weight: 900;
          margin-top: 0.8rem;
          letter-spacing: -1.5px;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .timer-content {
          margin-top: -60px;
          padding: 0 1.5rem 1.5rem;
          max-width: 820px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .timer-card {
          background: white;
          border-radius: 40px;
          padding: 2.5rem 3rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .card-top-row {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          margin-bottom: 2.5rem;
        }

        .mode-tabs {
          background: #F1F5F9;
          padding: 0.4rem;
          border-radius: 20px;
          display: flex;
          gap: 0.4rem;
        }
        .mode-btn {
          border: none;
          padding: 0.6rem 1.6rem;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 700;
          color: #94A3B8;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .mode-btn.active {
          background: white;
          color: #2563EB;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }

        .sound-btn {
          position: absolute;
          right: 0;
          background: #F0FDF4;
          border: 1px solid #DCFCE7;
          color: #16A34A;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 14px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }

        .timer-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .current-mode-label {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 2rem;
        }
        .current-mode-label h2 {
          font-size: 1.6rem;
          font-weight: 900;
          color: #1E293B;
        }
        .text-blue-500 { color: #3B82F6; }

        .time-row {
          display: flex;
          align-items: center;
          gap: 1.8rem;
          margin-bottom: 2.5rem;
        }
        .digit-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
        }
        .digit-box {
          width: 120px;
          height: 140px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        .bg-blue { background: linear-gradient(135deg, #4F6EF7 0%, #3B82F6 100%); }
        .bg-purple { background: linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%); }
        .bg-orange { background: linear-gradient(135deg, #FB923C 0%, #F97316 100%); }
        
        .number {
          font-size: 4.5rem;
          font-weight: 900;
          color: white;
          letter-spacing: -2px;
        }
        .label {
          font-size: 0.9rem;
          font-weight: 800;
          color: #94A3B8;
        }
        .time-sep {
          font-size: 3rem;
          font-weight: 900;
          color: #E2E8F0;
          margin-top: -20px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 2.5rem;
          color: #94A3B8;
          font-weight: 700;
          font-size: 1rem;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          background: #E2E8F0;
          border-radius: 50%;
        }
        .status-dot.pulse {
          background: #10B981;
          box-shadow: 0 0 10px #10B981;
          animation: pulse 2s infinite;
        }

        .btn-stack {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2rem;
        }
        .start-btn {
          width: 280px;
          height: 68px;
          border-radius: 22px;
          border: none;
          color: white;
          font-size: 1.4rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .start-btn.work {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          box-shadow: 0 12px 25px rgba(16, 185, 129, 0.25);
        }
        .start-btn.stop {
          background: linear-gradient(135deg, #F43F5E 0%, #E11D48 100%);
          box-shadow: 0 12px 25px rgba(244, 63, 94, 0.25);
        }
        .start-btn:hover {
          transform: translateY(-4px) scale(1.02);
        }
        .reset-link {
          background: none;
          border: none;
          color: #94A3B8;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
        }

        .footer-tips {
          width: 100%;
          margin-top: 3.5rem;
        }
        .tip-box {
          background: #F0F9FF;
          border: 1px solid #E0F2FE;
          padding: 1rem 2rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          color: #0369A1;
          font-size: 0.95rem;
          font-weight: 700;
          min-height: 3.5rem;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (max-height: 800px) {
          .timer-header { height: 180px; }
          .plan-title { font-size: 2.222rem; }
          .timer-content { margin-top: -40px; }
          .timer-card { padding: 2rem 1.5rem; }
          .digit-box { width: 100px; height: 120px; }
          .number { font-size: 3.5rem; }
          .status-indicator, .actions-group, .btn-stack, .time-row, .card-top-row { margin-bottom: 1.5rem; }
          .footer-tips { margin-top: 2rem; }
        }

        @media (max-width: 768px) {
          .timer-header { height: 180px; padding: 1.5rem; }
          .back-btn { left: 1rem; top: 1rem; padding: 0.4rem 0.8rem; font-size: 0.75rem; }
          .plan-title { font-size: 2rem; margin-top: 2rem; }
          .time-row { gap: 0.5rem; margin-bottom: 1.5rem; }
          .digit-box { width: 70px; height: 90px; border-radius: 16px; }
          .number { font-size: 2.2rem; }
          .time-sep { font-size: 1.2rem; }
          .timer-card { padding: 1.5rem 0.75rem; border-radius: 28px; }
          .start-btn { width: 100%; max-width: 260px; height: 56px; font-size: 1.1rem; }
          .card-top-row { margin-bottom: 1.5rem; }
          .mode-btn { padding: 0.5rem 0.6rem; font-size: 0.75rem; gap: 0.3rem; white-space: nowrap; }
          .mode-tabs { gap: 0.2rem; padding: 0.25rem; border-radius: 14px; }
          .current-mode-label { margin-bottom: 1rem; }
          .current-mode-label h2 { font-size: 1.2rem; }
          .footer-tips { margin-top: 1.5rem; }
          .tip-box { padding: 0.75rem 1rem; font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
}
