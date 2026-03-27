"use client";

import Header from "@/components/Dashboard/Header";
import StatsGrid from "@/components/Dashboard/StatsGrid";
import QuickActions from "@/components/Dashboard/QuickActions";
import MainTabs from "@/components/Dashboard/MainTabs";
import PetHouse from "@/components/Dashboard/PetHouse";
import InstallPrompt from "@/components/Dashboard/InstallPrompt";
import CheckInHeatmap from "@/components/Dashboard/CheckInHeatmap";

export default function DashboardPage() {
  return (
    <div className="dashboard-container animate-fade-in">
      <Header />
      
      <div className="dashboard-content">
        <StatsGrid />
        
        <div className="main-info-card card">
          <QuickActions />
          <div className="divider" />
          <PetHouse />
        </div>

        <CheckInHeatmap />

        <MainTabs />
      </div>

      <InstallPrompt />

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          padding-bottom: 5rem;
          background-color: var(--bg-main);
        }
        @media (max-width: 768px) {
          .container { padding: 4rem 10px 4rem 10px; }
          .main-content { padding: 0.5rem 0; }
        }
        .dashboard-content {
          padding: 0 var(--content-padding);
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 641px) {
          .dashboard-content { gap: 1.5rem; }
        }

        .main-info-card {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
        }

        @media (min-width: 641px) {
          .main-info-card { padding: 1.5rem; gap: 1.5rem; border-radius: 24px; }
        }

        .divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  );
}
