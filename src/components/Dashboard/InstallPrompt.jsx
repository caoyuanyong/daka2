"use client";
 
import { Smartphone, X, Monitor, Share } from 'lucide-react';
import { useState, useEffect } from 'react';
 
export default function InstallPrompt() {
  const [visible, setVisible] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [platform, setPlatform] = useState('desktop');

  useEffect(() => {
    // Detect if already in standalone/native app mode
    const isCapacitor = !!window.Capacitor;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    
    if (isCapacitor || isStandalone) {
      setVisible(false);
      return;
    }

    // Detect platform
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
      setPlatform('ios');
    } else if (/Android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);
 
  const handleInstallClick = async () => {
    if (platform === 'android') {
      window.location.href = 'https://genuine-muffin-9941bc.netlify.app/app-release.apk';
      setVisible(false);
      return;
    }

    if (!deferredPrompt) {
      const msg = platform === 'ios' 
        ? '请点击浏览器下方的“分享”按钮，然后选择“添加到主屏幕”来安装哦！'
        : '请点击浏览器右上角的“更多”菜单，选择“安装应用”或“添加到主屏幕”来安装哦！';
      alert(msg);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };
 
  if (!visible) return null;

  const getInstructions = () => {
    if (platform === 'ios') return { title: '添加到主屏幕', desc: '点击分享按钮并选择“添加到主屏幕”' };
    if (platform === 'android') return { title: '下载安卓应用', desc: '点击下载官方正式版 APK 安装包' };
    return { title: '安装小打卡到桌面', desc: '点击地址栏右侧的安装图标' };
  };

  const { title, desc } = getInstructions();
 
  return (
    <div className="install-prompt">
      <div className="content">
        <div className="icon-box">
          {platform === 'desktop' ? <Monitor size={18} /> : (platform === 'ios' ? <Share size={18} /> : <Smartphone size={18} />)}
        </div>
        <div className="text">
          <p className="title">{title}</p>
          <p className="desc">{desc}</p>
        </div>
      </div>
      <div className="actions">
        <button className="btn btn-primary btn-sm" onClick={handleInstallClick}>
          {platform === 'android' ? '立即下载' : (platform === 'desktop' ? '立即安装' : '查看方法')}
        </button>
        <button className="close-btn" onClick={() => setVisible(false)} title="关闭"><X size={16} /></button>
      </div>
 
      <style jsx>{`
        .install-prompt {
          position: fixed;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background: #e11d48;
          color: white;
          padding: 1rem;
          border-radius: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 10px 25px rgba(225, 29, 72, 0.3);
          z-index: 10000;
          max-width: 500px;
          margin: 0 auto;
        }
        .content { display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 0; }
        .icon-box { background: rgba(255, 255, 255, 0.2); padding: 0.5rem; border-radius: 12px; flex-shrink: 0; }
        .text { min-width: 0; flex: 1; }
        .text .title { font-size: 0.9rem; font-weight: 800; margin-bottom: 2px; }
        .text .desc { font-size: 0.65rem; opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .actions { display: flex; align-items: center; gap: 0.5rem; margin-left: 0.5rem; }
        .btn-sm { 
          padding: 0.5rem 0.75rem; font-size: 0.75rem; font-weight: 800;
          background: white; color: #e11d48; border-radius: 10px; border: none; cursor: pointer;
          white-space: nowrap;
        }
        .close-btn { background: rgba(0,0,0,0.1); border: none; color: white; cursor: pointer; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
 
        @media (max-width: 480px) {
          .install-prompt { padding: 0.75rem; gap: 0.5rem; bottom: 0.5rem; left: 0.5rem; right: 0.5rem; }
          .icon-box { display: none; }
          .text .title { font-size: 0.8rem; }
          .btn-sm { padding: 0.4rem 0.6rem; font-size: 0.7rem; }
        }
      `}</style>
    </div>
  );
}
