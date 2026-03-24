"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Calendar, Clock, Paperclip, Zap, Repeat, Info } from 'lucide-react';
import { EBBINGHAUS_MODES, getEbbinghausDates } from '@/utils/ebbinghaus';

export default function TaskDetailModal({ isOpen, onClose, onAdd }) {
  const [activeTab, setActiveTab] = useState('basic'); // basic, advanced, attachments
  const [formData, setFormData] = useState({
    title: '',
    category: '学习',
    reward: 10,
    date: new Date().toISOString().split('T')[0],
    timeType: 'range', // range or duration
    startTime: '09:00',
    endTime: '10:00',
    duration: 30,
    repeatType: 'NONE', // NONE, DAILY, WEEKLY, EBBINGHAUS
    ebbinghausMode: 'STANDARD',
    attachments: []
  });
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAdd(formData);
      onClose();
      // Reset
      setFormData({
        title: '', category: '学习', reward: 10, date: new Date().toISOString().split('T')[0],
        timeType: 'range', startTime: '09:00', endTime: '10:00', duration: 30,
        repeatType: 'NONE', ebbinghausMode: 'STANDARD', attachments: []
      });
    } catch (error) {
      console.error(error);
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSimulate = () => {
    const mockFile = { name: `附件_${Date.now()}.png`, size: '1.2MB' };
    if (formData.attachments.length >= 3) {
      alert('最多上传3个附件');
      return;
    }
    setFormData({ ...formData, attachments: [...formData.attachments, mockFile] });
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="title-area">
            <h3>任务详情编辑器</h3>
            <span className="badge">高级设置</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-tabs">
          <button className={`tab ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>基础信息</button>
          <button className={`tab ${activeTab === 'advanced' ? 'active' : ''}`} onClick={() => setActiveTab('advanced')}>高级/循环</button>
          <button className={`tab ${activeTab === 'attachments' ? 'active' : ''}`} onClick={() => setActiveTab('attachments')}>附件 ({formData.attachments.length})</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-body scrollbar-hide">
            {activeTab === 'basic' && (
              <div className="tab-pane animate-in">
                <div className="form-group">
                  <label>计划名称</label>
                  <input 
                    type="text" placeholder="你想坚持做什么？" value={formData.title} required
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>分类</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      <option>学习</option><option>阅读</option><option>运动</option><option>生活</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label><Zap size={14} className="inline-icon" /> 奖励星星</label>
                    <input type="number" value={formData.reward} onChange={e => setFormData({ ...formData, reward: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="time-config">
                  <div className="mode-toggle">
                    <button type="button" className={formData.timeType === 'range' ? 'active' : ''} onClick={() => setFormData({...formData, timeType: 'range'})}>时间段</button>
                    <button type="button" className={formData.timeType === 'duration' ? 'active' : ''} onClick={() => setFormData({...formData, timeType: 'duration'})}>持续时长</button>
                  </div>
                  
                  {formData.timeType === 'range' ? (
                    <div className="form-row">
                      <div className="form-group">
                        <label>开始</label>
                        <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>结束</label>
                        <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                      </div>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>持续分钟</label>
                      <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value) || 0})} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="tab-pane animate-in">
                <div className="form-group">
                  <label><Repeat size={14} className="inline-icon" /> 重复模式</label>
                  <select value={formData.repeatType} onChange={e => setFormData({...formData, repeatType: e.target.value})}>
                    <option value="NONE">不重复</option>
                    <option value="EBBINGHAUS">艾宾浩斯记忆曲线 (推荐)</option>
                    <option value="DAILY">每天</option>
                  </select>
                </div>

                {formData.repeatType === 'EBBINGHAUS' && (
                  <div className="ebbinghaus-config card-sub">
                    <label className="sub-label">选择记忆节奏</label>
                    <div className="mode-grid">
                      {Object.keys(EBBINGHAUS_MODES).map(m => (
                        <button 
                          key={m} type="button" 
                          className={`mode-btn ${formData.ebbinghausMode === m ? 'active' : ''}`}
                          onClick={() => setFormData({...formData, ebbinghausMode: m})}
                        >
                          {EBBINGHAUS_MODES[m].name}
                        </button>
                      ))}
                    </div>
                    <div className="preview-dates">
                      <p><Info size={12} /> 系统将自动在以下日期为您生成任务：</p>
                      <div className="date-chips">
                        {getEbbinghausDates(formData.date, formData.ebbinghausMode).map(d => (
                          <span key={d} className="chip">{d.split('-').slice(1).join('/')}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className="tab-pane animate-in">
                <div className="attachment-upload" onClick={handleFileSimulate}>
                  <Paperclip size={24} />
                  <p>点击或拖拽上传附件</p>
                  <span>支持图片/音视频/PDF (最大 50MB)</span>
                </div>
                <div className="file-list">
                  {formData.attachments.map((file, i) => (
                    <div key={i} className="file-item">
                      <div className="file-icon"><Clock size={14} /></div>
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{file.size}</span>
                      </div>
                      <button type="button" className="del-file-btn" onClick={() => setFormData({...formData, attachments: formData.attachments.filter((_, idx) => idx !== i)})}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" disabled={isSubmitting} onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存计划'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1rem; backdrop-filter: blur(4px); }
        .modal-content { width: 100%; max-width: 480px; background: white; border-radius: 24px; display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        
        .modal-header { padding: 1.5rem 1.5rem 1rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .title-area h3 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 0.25rem; }
        .badge { background: #eff6ff; color: #3b82f6; font-size: 0.65rem; font-weight: 800; padding: 0.1rem 0.5rem; border-radius: 4px; text-transform: uppercase; }
        .close-btn { background: #f1f5f9; border: none; padding: 0.5rem; border-radius: 50%; cursor: pointer; color: #64748b; transition: 0.2s; }
        .close-btn:hover { background: #e2e8f0; color: #1e293b; }

        .modal-tabs { display: flex; border-bottom: 1px solid #f1f5f9; padding: 0 1.5rem; }
        .tab { padding: 1rem 0.75rem; font-size: 0.85rem; font-weight: 700; color: #64748b; border: none; background: none; cursor: pointer; position: relative; transition: 0.2s; }
        .tab.active { color: #3b82f6; }
        .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 3px; background: #3b82f6; border-radius: 3px 3px 0 0; }

        .modal-form { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .form-body { flex: 1; padding: 1.5rem; overflow-y: auto; }
        .tab-pane { display: flex; flex-direction: column; gap: 1.25rem; }
        
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        label { font-size: 0.85rem; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 0.4rem; }
        .inline-icon { color: #3b82f6; }

        input, select { padding: 0.8rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; outline: none; transition: all 0.2s; background: #f8fafc; }
        input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

        .time-config { background: #f8fafc; padding: 1rem; border-radius: 16px; border: 1px solid #e2e8f0; }
        .mode-toggle { display: flex; background: #e2e8f0; padding: 0.2rem; border-radius: 8px; margin-bottom: 1rem; }
        .mode-toggle button { flex: 1; border: none; padding: 0.4rem; font-size: 0.75rem; font-weight: 700; border-radius: 6px; cursor: pointer; transition: 0.2s; color: #64748b; background: none; }
        .mode-toggle button.active { background: white; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .card-sub { background: #f0f9ff; border: 1px solid #bae6fd; padding: 1rem; border-radius: 16px; margin-top: -0.5rem; }
        .sub-label { font-size: 0.75rem; margin-bottom: 0.5rem; color: #0369a1; }
        .mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; }
        .mode-btn { background: white; border: 1.5px solid #e0f2fe; padding: 0.6rem; border-radius: 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: 0.2s; color: #0c4a6e; }
        .mode-btn.active { border-color: #0ea5e9; background: #0ea5e9; color: white; }

        .preview-dates { background: rgba(255,255,255,0.6); padding: 0.75rem; border-radius: 10px; }
        .preview-dates p { font-size: 0.7rem; color: #0369a1; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.3rem; }
        .date-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .chip { background: #bae6fd; color: #0c4a6e; font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 6px; }

        .attachment-upload { border: 2px dashed #cbd5e1; border-radius: 16px; padding: 2rem; text-align: center; cursor: pointer; transition: 0.2s; color: #64748b; }
        .attachment-upload:hover { border-color: #3b82f6; background: #f0f9ff; color: #3b82f6; }
        .attachment-upload p { font-size: 0.9rem; font-weight: 700; margin-top: 0.5rem; }
        .attachment-upload span { font-size: 0.7rem; opacity: 0.8; }

        .file-list { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .file-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
        .file-icon { color: #3b82f6; }
        .file-info { flex: 1; display: flex; flex-direction: column; }
        .file-name { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
        .file-size { font-size: 0.7rem; color: #94a3b8; }
        .del-file-btn { background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s; }
        .del-file-btn:hover { color: #ef4444; }

        .modal-footer { padding: 1rem 1.5rem 1.5rem; display: flex; gap: 1rem; border-top: 1px solid #f1f5f9; }
        .btn { flex: 1; padding: 0.8rem; border-radius: 14px; font-size: 0.9rem; font-weight: 800; border: none; cursor: pointer; transition: 0.2s; }
        .btn-secondary { background: #f1f5f9; color: #475569; }
        .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary:not(:disabled):hover { background: #e2e8f0; }
        .btn-primary { background: #3b82f6; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }
        .btn-primary:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4); }

        .animate-in { animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
