"use client";

import { useLearning } from "@/hooks/useLearningPlan";
import { useHabits } from "@/hooks/useHabits";
import { Clock, Sun, CheckCircle, Percent } from "lucide-react";
import { useMemo } from "react";

export default function StatsGrid() {
  const { plans } = useLearning();
  const { habits, records } = useHabits();
  
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    // 1. 计算今日学习任务统计
    const totalTasks = plans.length;
    const completedTasks = plans.filter(p => p.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. 计算今日学习时长
    const learningTime = plans
      .filter(p => p.completed && p.timeType === 'duration')
      .reduce((acc, curr) => {
        const val = parseFloat(curr.timeValue);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);

    // 3. 计算今日运动时长
    const outdoorTime = habits
      .filter(h => h.category === '运动' || (h.title && h.title.includes('运动')))
      .reduce((acc, h) => {
        const todayRecords = records.filter(r => r.habitId === h.id && r.date === today);
        return acc + (todayRecords.length * (h.duration || 30)); 
      }, 0);

    return [
      { label: "今日学习时间", value: `${learningTime}m`, icon: Clock },
      { label: "运动户外时间", value: `${outdoorTime}m`, icon: Sun },
      { label: "今日任务数量", value: `${completedTasks}/${totalTasks}`, icon: CheckCircle },
      { label: "今日完成率", value: `${completionRate}%`, icon: Percent },
    ];
  }, [plans, habits, records]);

  return (
    <div className="stats-grid">
      {metrics.map((m, i) => (
        <div key={i} className="stat-card">
          <p className="label">{m.label}</p>
          <p className="value">{m.value}</p>
        </div>
      ))}
      
      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-top: -3rem;
          z-index: 10;
        }
        .stat-card {
          background: white;
          padding: 1.25rem 0.5rem;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          flex: 1;
          min-width: 0;
          border: 1px solid rgba(255,255,255,0.8);
          backdrop-filter: blur(10px);
        }
        .label {
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 700;
          white-space: nowrap;
        }
        .value {
          font-size: 1.25rem;
          font-weight: 900;
          color: #3b82f6;
        }

        @media (max-width: 640px) {
          .stats-grid { gap: 0.4rem; padding: 0 0.5rem; }
          .value { font-size: 1rem; }
          .label { font-size: 0.6rem; }
        }
      `}</style>
    </div>
  );
}
