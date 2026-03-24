"use client";

import { Trophy, Star, Dog, HelpCircle, Users } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  const actions = [
    { label: "积分成就", icon: Trophy, color: "#F59E0B", bg: "#FEF3C7", href: "/rewards" },
    { label: "行为习惯", icon: Star, color: "#EC4899", bg: "#FCE7F3", href: "/habits" },
    { label: "电子宠物", icon: Dog, color: "#EF4444", bg: "#FEE2E2", href: "/pet" },
    { label: "档案管理", icon: Users, color: "#8B5CF6", bg: "#EDE9FE", href: "/users" },
    { label: "使用帮助", icon: HelpCircle, color: "#3B82F6", bg: "#DBEAFE", href: "/help" },
  ];

  return (
    <div className="quick-actions">
      {actions.map((a, i) => (
        <Link key={i} href={a.href} className="action-btn">
          <div className="icon-wrapper" style={{ backgroundColor: a.bg }}>
            <a.icon size={20} style={{ color: a.color }} />
          </div>
          <span>{a.label}</span>
        </Link>
      ))}

      <style jsx>{`
        .quick-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0.5rem 0;
        }
        .action-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
        }
        .action-btn:hover {
          transform: translateY(-4px);
        }
        .icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          transition: all 0.3s;
        }
        .action-btn:hover .icon-wrapper {
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .action-btn span {
          font-size: 0.8rem;
          font-weight: 700;
          color: #334155;
          letter-spacing: -0.01em;
        }
      `}</style>
    </div>
  );
}
