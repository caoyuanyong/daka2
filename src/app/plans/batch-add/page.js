"use client";

import { useApp } from "@/hooks/useAppContext";
import { useLearningPlan } from "@/hooks/useLearningPlan";
import {
  ChevronLeft,
  Trash2,
  Plus,
  Sparkles,
  Clock,
  Calendar,
  Repeat,
  Star,
  Info,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BatchAddPlansPage() {
  const router = useRouter();
  const { selectedDate } = useApp();
  const { addPlans } = useLearningPlan();

  const [inputText, setInputText] = useState("");
  const [startDate, setStartDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [repeatType, setRepeatType] = useState("NONE");
  const [ebbinghausMode, setEbbinghausMode] = useState("STANDARD");
  const [duration, setDuration] = useState(25);
  const [reward, setReward] = useState(10);
  const [isCustomReward, setIsCustomReward] = useState(false);

  // Parsing logic
  const parsedTasks = useMemo(() => {
    if (!inputText.trim()) return [];

    const lines = inputText.split('\n').filter(line => line.trim() !== "");
    const tasks = [];
    let currentCategory = "默认";

    lines.forEach((line, index) => {
      // Check for task pattern: number + separator + content
      const taskMatch = line.match(/^(\d+)[.、,，\s]+(.*)/);
      if (taskMatch) {
        tasks.push({
          id: `raw-${index}`,
          title: taskMatch[2].trim(),
          category: currentCategory,
          duration: duration,
          reward: reward,
          lineNum: index + 1
        });
      } else {
        // If not a task, it's a category
        currentCategory = line.trim();
      }
    });

    return tasks;
  }, [inputText, duration, reward]);

  const handleSave = () => {
    if (parsedTasks.length === 0) return;

    const plansToSave = parsedTasks.map(task => ({
      title: task.title,
      category: task.category,
      date: startDate,
      repeatType: repeatType,
      ebbinghausMode: repeatType === 'EBBINGHAUS' ? ebbinghausMode : null,
      timeType: 'duration',
      duration: task.duration,
      reward: isCustomReward ? task.reward : reward,
      completed: false
    }));

    addPlans(plansToSave);
    router.push('/');
  };

  const removeTask = (id) => {
    // This is tricky because parsedTasks is derived from inputText
    // To support removing, we'd need to modify inputText or have a local "hidden" list
    // For now, let's just implement it by filtering if possible, but real replication
    // might require a more complex state.
    // Simpler approach for "batch add": the textarea is the source of truth.
  };

  return (
    <div className="batch-add-container">
      <header className="page-header">
        <div className="header-inner">
          <Link href="/" className="back-btn"><ChevronLeft size={24} /></Link>
          <h1>批量增加计划</h1>
          <div className="spacer"></div>
        </div>
      </header>

      <main className="batch-add-content">
        <div className="layout-grid">
          {/* Left Column: Input and Settings */}
          <div className="input-section">
            <div className="section-card">
              <div className="card-header">
                <span className="title">任务列表</span>
                <button className="ai-btn">
                  <Sparkles size={16} />
                  {/*<span>AI 智能解析</span>*/}
                </button>
              </div>
              <textarea
                placeholder="请输入任务列表，例如：&#10;语文&#10;1. 背单词&#10;2. 读课文&#10;数学&#10;1. 做练习题"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="task-textarea"
              />
              <div className="format-hint">
                <Info size={14} />
                <span>支持格式：类别名称 或 1. 任务内容</span>
              </div>
            </div>

            <div className="section-card settings-card">
              <h3 className="section-title">统一设置</h3>
              <div className="settings-grid">
                <div className="setting-item">
                  <label><Calendar size={16} /> 起始日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label><Repeat size={16} /> 重复类型</label>
                  <select value={repeatType} onChange={(e) => setRepeatType(e.target.value)}>
                    <option value="NONE">仅当天</option>
                    <option value="DAILY">每天</option>
                    <option value="WEEKLY">每周</option>
                    <option value="BIWEEKLY">每双周</option>
                    <option value="EBBINGHAUS">艾宾浩斯</option>
                  </select>
                </div>
                {repeatType === "EBBINGHAUS" && (
                  <div className="setting-item animate-fade-in">
                    <label><Sparkles size={16} /> 艾宾浩斯模式</label>
                    <select value={ebbinghausMode} onChange={(e) => setEbbinghausMode(e.target.value)}>
                      <option value="STANDARD">标准模式 (30天/6次)</option>
                      <option value="GENTLE">温和模式 (30天/5次)</option>
                      <option value="EXAM">考前冲刺 (15天/7次)</option>
                      <option value="INTENSE">强化训练 (60天/7次)</option>
                    </select>
                  </div>
                )}
                <div className="setting-item">
                  <label><Clock size={16} /> 默认时长 (分钟)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </div>
                <div className="setting-item">
                  <label><Star size={16} /> 完成奖励 (积分)</label>
                  <div className="reward-input-wrap">
                    <input
                      type="number"
                      value={reward}
                      onChange={(e) => setReward(Number(e.target.value))}
                    />
                    <label className="switch-label">
                      <input
                        type="checkbox"
                        checked={isCustomReward}
                        onChange={(e) => setIsCustomReward(e.target.checked)}
                      />
                      <span>自定义</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="preview-section">
            <div className="preview-header">
              <span>预览计划 ({parsedTasks.length})</span>
            </div>
            <div className="preview-list">
              <AnimatePresence initial={false}>
                {parsedTasks.length === 0 ? (
                  <div className="empty-preview">
                    <p>在左侧输入任务即可实时预览</p>
                  </div>
                ) : (
                  parsedTasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="preview-card"
                    >
                      <div className="card-tag">{task.category}</div>
                      <div className="card-main">
                        <div className="card-info">
                          <span className="line-num">行 {task.lineNum}</span>
                          <span className="task-title">{task.title}</span>
                        </div>
                        <button className="delete-task-btn" onClick={() => removeTask(task.id)}>
                          <X size={14} />
                        </button>
                      </div>
                      <div className="card-footer">
                        <div className="footer-item">
                          <Clock size={12} />
                          <span>{task.duration} 分钟</span>
                        </div>
                        <div className="footer-item">
                          <Star size={12} />
                          <span>{task.reward} 积分</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="action-bar">
        <div className="action-inner">
          <div className="summary-info">
            共计 <span className="highlight">{parsedTasks.length}</span> 个计划
          </div>
          <div className="btn-group">
            <button className="btn-cancel" onClick={() => router.back()}>取消</button>
            <button
              className="btn-save"
              disabled={parsedTasks.length === 0}
              onClick={handleSave}
            >
              保存计划
            </button>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .batch-add-container {
          min-height: 100vh;
          background: #f1f5f9;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .page-header {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .header-inner h1 {
          font-size: 1.2rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.025em;
        }

        .back-btn {
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .batch-add-content {
          flex: 1;
          padding: 2rem;
          max-width: 1300px;
          margin: 0 auto;
          width: 100%;
          padding-bottom: 100px;
        }

        .layout-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
          height: 100%;
        }

        .section-card {
          background: white;
          border-radius: 20px;
          padding: 1.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
          border: 1px solid rgba(241, 245, 249, 0.8);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .card-header .title {
          font-weight: 800;
          color: #1e293b;
          font-size: 1.05rem;
        }

        .ai-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
          transition: all 0.2s;
        }

        .ai-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(59, 130, 246, 0.35);
        }

        .task-textarea {
          width: 100%;
          min-height: 350px;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          padding: 1.25rem;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
          outline: none;
          transition: all 0.2s;
          background: #f8fafc;
          color: #334155;
          line-height: 1.6;
        }

        .task-textarea:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .format-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          color: #64748b;
          font-size: 0.8rem;
          background: #f8fafc;
          padding: 0.6rem 1rem;
          border-radius: 8px;
        }

        .section-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .setting-item label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .setting-item input, .setting-item select {
          padding: 0.75rem;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
        }

        .setting-item input:focus, .setting-item select:focus {
          border-color: #3b82f6;
          background: white;
        }

        .reward-input-wrap {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .reward-input-wrap input {
          width: 90px;
        }

        .switch-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          user-select: none;
        }

        .preview-section {
          background: #f8fafc;
          border-radius: 24px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-height: calc(100vh - 180px);
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .preview-header {
          font-weight: 800;
          color: #0f172a;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preview-header span {
          background: #e2e8f0;
          color: #475569;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
        }

        .preview-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preview-card {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          position: relative;
          border: 1px solid rgba(241, 245, 249, 0.8);
          transition: transform 0.2s;
        }

        .preview-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
        }

        .card-tag {
          font-size: 0.65rem;
          font-weight: 800;
          color: #3b82f6;
          background: #eff6ff;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          width: fit-content;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .card-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .line-num {
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
        }

        .task-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.4;
        }

        .delete-task-btn {
          color: #94a3b8;
          background: #f8fafc;
          border: none;
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .delete-task-btn:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        .card-footer {
          display: flex;
          gap: 1.25rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .footer-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
        }

        .footer-item :global(svg) {
          color: #94a3b8;
        }

        .empty-preview {
          text-align: center;
          padding: 5rem 1rem;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .action-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          padding: 1.25rem;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          z-index: 100;
        }

        .action-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-info {
          font-size: 1rem;
          color: #475569;
          font-weight: 700;
        }

        .highlight {
          color: #3b82f6;
          font-size: 1.5rem;
          font-weight: 900;
          padding: 0 0.5rem;
        }

        .btn-group {
          display: flex;
          gap: 1rem;
        }

        .btn-cancel {
          padding: 0.75rem 2rem;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 14px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #334155;
        }

        .btn-save {
          padding: 0.75rem 3rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
          transition: all 0.2s;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 20px -5px rgba(37, 99, 235, 0.4);
        }

        .btn-save:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          box-shadow: none;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .layout-grid {
            grid-template-columns: 1fr;
          }
          .preview-section {
            max-height: none;
          }
        }

        @media (max-width: 640px) {
          .batch-add-content { padding: 1rem var(--content-padding); }
          .settings-grid { grid-template-columns: 1fr; }
          .action-bar { padding: 0.75rem 1rem; }
          .action-inner { flex-direction: row; justify-content: space-between; align-items: center; gap: 0.5rem; }
          .summary-info { font-size: 0.8rem; }
          .highlight { font-size: 1.2rem; }
          .btn-group { gap: 0.5rem; }
          .btn-group button { padding: 0.6rem 1rem; font-size: 0.85rem; }
          .btn-save { padding: 0.6rem 1.5rem; }
        }
      `}</style>
    </div>
  );
}
