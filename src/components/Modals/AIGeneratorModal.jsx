"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, ArrowRightCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLearningPlan } from '@/hooks/useLearningPlan';

export default function AIGeneratorModal({ isOpen, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [streamedText, setStreamedText] = useState('');
  const [dots, setDots] = useState('');
  
  const { addPlan } = useLearningPlan();

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPrompt('');
      setGeneratedTasks([]);
      setStreamedText('');
      setIsGenerating(false);
      setDots('');
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setDots(d => d.length >= 3 ? '' : d + '.');
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedTasks([]);
    setStreamedText('正在接入大模型引擎...\n');
    
    setTimeout(() => {
      setStreamedText(prev => prev + `正在分析目标：${prompt.substring(0, 10)}...\n`);
      
      setTimeout(() => {
        setStreamedText(prev => prev + '正在为您拆解合理的学习步骤和阶段...\n');
        
        setTimeout(() => {
          const keyword = prompt.length > 5 ? prompt.substring(0, 10) : prompt;
          setGeneratedTasks([
            { title: `了解「${keyword}」的背景与核心理论`, category: '理论' },
            { title: '搜集与统筹必要的学习工具和资料', category: '准备' },
            { title: '开启高强度的刻意练习与实战演练', category: '执行' },
            { title: '完成阶段性小测试，查漏补缺', category: '自测' },
            { title: '输出总结报告，梳理专属的思维导图', category: '复盘' }
          ]);
          setIsGenerating(false);
        }, 1500);
      }, 1000);
    }, 1000);
  };

  const handleImport = async () => {
    // Import tasks sequentially
    for (const task of generatedTasks) {
      await addPlan({
        title: task.title,
        category: task.category,
        importance: 'medium',
        date: new Date().toISOString()
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="modal-content"
      >
        <button className="close-button" onClick={onClose}><X size={20} color="#64748b" /></button>
        
        <div className="modal-header">
          <div className="icon-wrapper">
            <Sparkles size={24} color="#8B5CF6" />
          </div>
          <h2>AI 智能计划师</h2>
          <p>告诉我您想达成的目标，AI 为您量身定制阶段计划。</p>
        </div>

        <div className="modal-body">
          {!generatedTasks.length && !isGenerating ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="input-section">
              <textarea 
                placeholder="💡 比如：我想在四周内掌握 Next.js 基础开发..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                autoFocus
              />
              <button 
                className={`btn-generate ${!prompt.trim() ? 'disabled' : ''}`}
                disabled={!prompt.trim()} 
                onClick={handleGenerate}
              >
                施放魔法运算 <Sparkles size={16} />
              </button>
            </motion.div>
          ) : isGenerating ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="generating-section">
              <div className="loader-box">
                <Loader2 className="spinner" size={40} color="#8B5CF6" strokeWidth={2.5}/>
              </div>
              <div className="streamed-log">
                {streamedText.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                <span className="cursor">{dots}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="result-section">
              <h3 className="success-title">🎉 已为您生成专属打卡挑战：</h3>
              <div className="result-list">
                {generatedTasks.map((t, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: idx * 0.15 }}
                    key={idx} 
                    className="result-item"
                  >
                    <span className="cat-badge">{t.category}</span>
                    <span className="t-title">{t.title}</span>
                  </motion.div>
                ))}
              </div>
              <button className="btn-import" onClick={handleImport}>
                ✨ 完美！一键导入到我的计划 <ArrowRightCircle size={18} style={{ marginLeft: '4px' }} />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center; z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          background: white; width: 100%; max-width: 500px;
          border-radius: 28px; padding: 2.5rem 2rem;
          position: relative; box-shadow: 0 25px 50px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .close-button {
          position: absolute; top: 1.25rem; right: 1.25rem;
          background: #f1f5f9; border: none; width: 36px; height: 36px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.2s;
        }
        .close-button:hover { background: #e2e8f0; transform: scale(1.05); }

        .modal-header { text-align: center; margin-bottom: 2rem; }
        .icon-wrapper { 
          width: 56px; height: 56px; border-radius: 20px; 
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); 
          margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; 
          box-shadow: 0 8px 16px rgba(139, 92, 246, 0.15);
        }
        .modal-header h2 { font-size: 1.4rem; font-weight: 900; color: #1e293b; margin-bottom: 0.5rem; }
        .modal-header p { font-size: 0.85rem; color: #64748b; font-weight: 500; }

        .input-section { display: flex; flex-direction: column; gap: 1rem; }
        textarea {
          width: 100%; height: 120px; border-radius: 20px; padding: 1rem 1.2rem;
          border: 2px solid #e2e8f0; background: #f8fafc; color: #0f172a;
          font-size: 0.95rem; font-weight: 500; outline: none; resize: none; transition: 0.2s;
        }
        textarea:focus { border-color: #8b5cf6; background: white; box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1); }
        .btn-generate {
          background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
          color: white; border: none; padding: 1rem; border-radius: 16px;
          font-size: 1rem; font-weight: 800; cursor: pointer; transition: 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          box-shadow: 0 10px 20px rgba(139, 92, 246, 0.2);
        }
        .btn-generate:hover { transform: translateY(-3px); box-shadow: 0 15px 25px rgba(139, 92, 246, 0.3); }
        .btn-generate.disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

        .generating-section {
          padding: 2rem 0; display: flex; flex-direction: column; align-items: center; gap: 2rem;
        }
        .loader-box { padding: 1rem; border-radius: 50%; background: #f5f3ff; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1.5s linear infinite; }
        
        .streamed-log { 
          background: #1e293b; width: 100%; border-radius: 16px; padding: 1.5rem;
          min-height: 140px; font-family: monospace; color: #10b981; font-size: 0.85rem;
          box-shadow: inset 0 4px 6px rgba(0,0,0,0.2);
          line-height: 1.8;
        }
        .streamed-log p { margin: 0; }
        .cursor { color: #8b5cf6; font-weight: bold; }

        .result-section { display: flex; flex-direction: column; gap: 1.5rem; }
        .success-title { font-size: 1.05rem; font-weight: 800; color: #1e293b; text-align: center; }
        .result-list { display: flex; flex-direction: column; gap: 0.8rem; }
        .result-item {
          display: flex; align-items: center; gap: 1rem; background: #f8fafc;
          padding: 1rem; border-radius: 16px; border: 1px solid #e2e8f0;
        }
        .cat-badge { background: #fee2e2; color: #ef4444; font-size: 0.7rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 8px; }
        .t-title { font-size: 0.9rem; font-weight: 700; color: #334155; }
        
        .btn-import {
          background: #10b981; color: white; border: none; padding: 1rem; border-radius: 16px;
          font-size: 1rem; font-weight: 800; cursor: pointer; transition: 0.2s;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); margin-top: 0.5rem;
        }
        .btn-import:hover { transform: translateY(-3px); box-shadow: 0 15px 25px rgba(16, 185, 129, 0.3); }
      `}</style>
    </div>
  );
}
