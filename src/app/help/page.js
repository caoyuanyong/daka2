"use client";

import { ChevronLeft, Rocket, Target, Heart, Zap, ShieldCheck, HelpCircle, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HelpPage() {
  const helpCards = [
    {
      icon: <Rocket color="#3b82f6" />,
      title: "快速上手路线",
      steps: [
        "第一步：点击首页“添加计划”，开启你的学习之旅。",
        "第二步：完成任务后，点击左侧圆圈进行“打卡”记录。",
        "第三步：在“二级页面”查看详细的周/月复盘报表。"
      ],
      suggestion: "建议开启桌面 PWA 安装，像原生 APP 一样快捷访问。"
    },
    {
      icon: <Target color="#f97316" />,
      title: "艾宾浩斯记忆配置",
      steps: [
        "标准模式：适合大多数学习场景 (1, 3, 6, 14, 29天复习)。",
        "强化模式：针对难点攻克，复习频率更高，周期更长。",
        "系统将自动在选定日期生成复习任务，您只需按时打卡。"
      ],
      suggestion: "在任务编辑器中切换至“高级设置”即可开启该功能。"
    },
    {
      icon: <Heart color="#ef4444" />,
      title: "电子宠物养成手册",
      steps: [
        "饱食度：每次投喂增加 20 饱食度。当数值过低时，宠物会感到饥饿。",
        "心情值：经常互动可以提升心情，宠物心情好时会变换表情。",
        "成长：持续健康的养育会让宠物等级提升，解锁更多互动。"
      ],
      suggestion: "记得每天来看看你的小家伙，它也有情感哦！"
    },
    {
      icon: <Zap color="#eab308" />,
      title: "星星奖励规则",
      steps: [
        "完成计划：根据任务难度获得不同数量的星星奖励。",
        "行为习惯：正面行为加分，负面行为减分（全量支持正负分系统）。",
        "额外奖励：早起打卡、连续坚持都会获得额外的惊喜倍率。"
      ],
      suggestion: "星星可以在“愿望商城”中兑换真实的实体奖励或心愿。"
    },
    {
      icon: <ShieldCheck color="#10b981" />,
      title: "会员特权说明",
      steps: [
        "全站去广告：享受纯净的学习与管理体验。",
        "数据云同步：多设备登录，记录永不丢失。",
        "专属福利：解锁更多高难度任务模板与高级宠物皮肤。"
      ],
      suggestion: "在“兑换中心”输入 12 位激活码即可瞬间升级。会员权益全家共享。"
    }
  ];

  return (
    <div className="help-container">
      <header className="help-header">
        <Link href="/">
          <div className="back-btn">
            <ChevronLeft size={24} />
          </div>
        </Link>
        <div className="header-content">
          <h1>使用帮助</h1>
          <p>功能怎么用，一次讲清。您的全方位成长手册。</p>
        </div>
      </header>

      <main className="help-content">
        {helpCards.map((card, index) => (
          <motion.section 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="help-card card"
          >
            <div className="card-top">
              <div className="card-icon">{card.icon}</div>
              <h2>{card.title}</h2>
            </div>
            
            <div className="card-body">
              <div className="how-to">
                <p className="section-label">怎么操作</p>
                <ul>
                  {card.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
              
              <div className="suggestions">
                <div className="suggestion-pill">
                  <Info size={14} />
                  <span>{card.suggestion}</span>
                </div>
              </div>

              <div className="card-footer">
                <Link href="/" className="btn-go">
                  前往体验 <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.section>
        ))}

        <section className="faq-section">
          <h3><HelpCircle size={20} /> 常见问题 FAQ</h3>
          <div className="faq-list">
            <div className="faq-item">
              <h4>Q: 切换成员后我的数据会丢失吗？</h4>
              <p>不会。我们采用了严格的档案隔离机制，每个成员的积分、计划和宠物数据都是独立加密存储的。</p>
            </div>
            <div className="faq-item">
              <h4>Q: 为什么我无法点击“确认创建”计划？</h4>
              <p>请确保已填写任务标题。如果仍有问题，请尝试刷新页面重置本地状态。</p>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .help-container {
          min-height: 100vh;
          background: #F1F4F9;
          padding-bottom: 4rem;
        }
        .help-header {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          padding: 3.5rem 1.5rem 3rem;
          position: relative;
          text-align: center;
          border-radius: 0 0 40px 40px;
        }
        .back-btn {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          color: white;
          background: rgba(255,255,255,0.2);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        .header-content h1 {
          font-size: 1.75rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
        }
        .header-content p {
          font-size: 0.85rem;
          opacity: 0.8;
          white-space: nowrap;
          margin: 0 auto;
        }

        .help-content {
          margin-top: -2rem;
          padding: 0 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .help-card {
          padding: 1.5rem;
          border: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .card-top {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .card-icon {
          width: 48px;
          height: 48px;
          background: #F8FAFC;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        .card-top h2 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1e293b;
        }

        .section-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .how-to ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .how-to li {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
          padding-left: 1.5rem;
          position: relative;
        }
        .how-to li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.6rem;
          width: 6px;
          height: 6px;
          background: #3b82f6;
          border-radius: 50%;
        }

        .suggestion-pill {
          background: #F0F9FF;
          color: #0369a1;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          margin-bottom: 1.5rem;
        }

        .btn-go {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #F8FAFC;
          border-radius: 10px;
          color: #3b82f6;
          font-size: 0.85rem;
          font-weight: 800;
          text-decoration: none;
          transition: 0.2s;
        }
        .btn-go:hover {
          background: #EFF6FF;
          transform: translateY(-2px);
        }

        .faq-section {
          padding: 2rem 0;
        }
        .faq-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .faq-item h4 {
          font-size: 0.9rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.4rem;
        }
        .faq-item p {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.6;
        }
        @media (max-width: 640px) {
          .help-header { padding: 2rem 1rem 1.5rem; border-radius: 0 0 24px 24px; }
          .header-content h1 { font-size: 1.4rem; }
          .header-content p { font-size: 0.75rem; white-space: normal; }
          .help-content { margin-top: -1rem; gap: 1rem; padding: 0 0.75rem; }
          .help-card { padding: 1.25rem; border-radius: 16px; }
          .card-icon { width: 40px; height: 40px; font-size: 1.25rem; }
          .how-to li { font-size: 0.85rem; padding-left: 1.25rem; }
          .suggestion-pill { padding: 0.6rem 0.8rem; font-size: 0.75rem; margin-bottom: 1rem; }
          .faq-section h3 { font-size: 1rem; }
          .faq-item h4 { font-size: 0.85rem; }
          .faq-item p { font-size: 0.8rem; }
          .back-btn { top: 1rem; left: 1rem; width: 32px; height: 32px; }
        }
      `}</style>
    </div>
  );
}
