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
        <div key={i} className="action-btn-wrapper">
          <Link href={a.href} style={{ 
            textDecoration: 'none', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '6px',
            width: '100%'
          }}>
            <div className="icon-wrapper" style={{ 
              backgroundColor: a.bg,
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
            }}>
              <a.icon size={20} style={{ color: a.color }} />
            </div>
            <span style={{ 
              fontSize: '10.5px', 
              fontWeight: '700', 
              color: '#475569',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}>{a.label}</span>
          </Link>
        </div>
      ))}

      <style jsx>{`
        .quick-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0.5rem 0;
          gap: 0;
        }

        @media (min-width: 800px) {
          .quick-actions {
            padding: 1.5rem 0;
          }
        }

        .action-btn-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          min-width: 0;
        }

        .icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          transition: all 0.3s;
        }

        @media (min-width: 800px) {
          .icon-wrapper { width: 64px; height: 64px; border-radius: 20px; }
          .action-btn-wrapper { gap: 0.8rem; }
        }

        .action-btn-wrapper span {
          font-size: 10.5px;
          font-weight: 700;
          color: #475569;
          white-space: nowrap !important;
          text-align: center;
          width: 100%;
        }

        @media (min-width: 800px) {
          .action-btn span { font-size: 14px; color: #334155; }
        }
      `}</style>
    </div>
  );
}
