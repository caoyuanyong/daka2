"use client";

import { useRef } from 'react';
import { useLearningPlan } from '@/hooks/useLearningPlan';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarStrip() {
  const { weeklyStats, selectedDate, setSelectedDate } = useLearningPlan();
  const today = new Date().toISOString().split('T')[0];
  const dateInputRef = useRef(null);

  const handleDateClick = (fullDate) => {
    setSelectedDate(fullDate);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if (dateInputRef.current.showPicker) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const currentWeekMonth = () => {
    if (!weeklyStats || weeklyStats.length === 0) return "";
    // Base calculation on the Monday of the week to keep it stable
    const [year, month, day] = weeklyStats[0].fullDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const weekNo = Math.ceil((date.getDate() + (firstDay === 0 ? 6 : firstDay - 1)) / 7);
    return `${year}年${month}月第${weekNo}周`;
  };

  return (
    <div className="calendar-strip">
      <div className="strip-header">
        <div className="week-info">
          <CalendarIcon size={16} className="text-blue-500" />
          <span className="current-month">{currentWeekMonth()}</span>
        </div>
        <div className="strip-nav">
          {/*<button className="nav-btn sub-btn"><span className="dot">◎</span> 可补打卡</button>*/}
          <button className="nav-btn today" onClick={() => setSelectedDate(today)}>今天</button>
          <div className="nav-group">
            <button className="nav-btn icon-only" onClick={handlePrevDay} title="前一天"><ChevronLeft size={16} /></button>
            <button className="nav-btn icon-only" onClick={handleNextDay} title="后一天"><ChevronRight size={16} /></button>
          </div>
          <button className="nav-btn icon-only" onClick={handleCalendarClick} title="选择日期">
            <CalendarIcon size={16} />
          </button>
          {/* Hidden date input for native picker */}
          <input
            type="date"
            ref={dateInputRef}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="days-list">
        {weeklyStats?.map((day, i) => {
          const isSelected = selectedDate === day.fullDate;
          const isToday = today === day.fullDate;

          return (
            <button
              key={i}
              className={`day-item ${isSelected ? 'active' : ''} ${isToday ? 'is-today' : ''}`}
              onClick={() => handleDateClick(day.fullDate)}
            >
              <span className="label">{day.label}</span>
              <span className="date">{day.date}</span>
              {day.completion > 0 && <div className="dot-indicator"></div>}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .calendar-strip { margin-bottom: 2rem; background: #F8FAFC; padding: 1rem; border-radius: 20px; border: 1px solid rgba(0,0,0,0.02); }
        .strip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .week-info { display: flex; align-items: center; gap: 0.5rem; }
        .current-month { font-size: 0.9rem; font-weight: 700; color: #3b82f6; }
        .strip-nav { display: flex; gap: 0.5rem; align-items: center; position: relative; }
        
        .nav-btn { border: 1px solid #e2e8f0; background: white; padding: 0.4rem 0.75rem; display: flex; align-items: center; justify-content: center; border-radius: 99px; cursor: pointer; color: #64748b; font-size: 0.75rem; font-weight: 700; transition: 0.2s; }
        .nav-btn:hover { border-color: #3b82f6; color: #3b82f6; transform: translateY(-1px); }
        .nav-btn.sub-btn { color: #3b82f6; border-color: #dbeafe; background: #eff6ff; }
        .nav-btn.today { background: #f97316; color: white; border: none; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2); }
        .nav-btn.icon-only { width: 32px; height: 32px; padding: 0; border: 1.5px solid #3b82f6; background: white; color: #3b82f6; border-radius: 10px; }
        .nav-btn.icon-only:hover { background: #3b82f6; color: white; }
        .nav-group { display: flex; gap: 2px; }
        .nav-group .nav-btn { border-radius: 0; }
        .nav-group .nav-btn:first-child { border-radius: 10px 0 0 10px; }
        .nav-group .nav-btn:last-child { border-radius: 0 10px 10px 0; }

        .days-list { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.75rem; }
        @media (max-width: 640px) {
          .calendar-strip { padding: 0.75rem; border-radius: 16px; margin-bottom: 1rem; }
          .days-list { 
            display: flex; overflow-x: auto; gap: 0.5rem; 
            padding: 0.25rem 0;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .days-list::-webkit-scrollbar { display: none; }
          .day-item { 
            flex-shrink: 0; width: 48px; padding: 0.75rem 0.25rem; 
            border-radius: 12px; scroll-snap-align: start;
          }
          .day-item .date { font-size: 1rem; }
          .day-item .label { font-size: 0.55rem; }
          .strip-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
          .strip-nav { width: 100%; justify-content: space-between; }
        }
        .day-item { border: none; background: white; padding: 1.1rem 0.5rem; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
        .day-item:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.06); }
        .day-item.active { background: #3b82f6; color: white; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3); transform: scale(1.05); z-index: 2; }
        .day-item .label { font-size: 0.7rem; font-weight: 700; opacity: 0.8; }
        .day-item .date { font-size: 1.15rem; font-weight: 900; }
        .day-item.active .label { opacity: 1; }
        
        .dot-indicator { position: absolute; bottom: 10px; width: 6px; height: 6px; background: #10B981; border-radius: 50%; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
        .day-item.active .dot-indicator { background: white; }
        
        .dot { margin-right: 4px; font-weight: bold; }
      `}</style>
    </div>
  );
}
