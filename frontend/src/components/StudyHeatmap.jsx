import React, { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  differenceInCalendarDays,
  parseISO,
  isFuture,
} from "date-fns";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import api from "../services/api";

const StudyHeatmap = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activity, setActivity] = useState([]);

  const fetchActivity = async () => {
    try {
      const { data } = await api.get("/api/progress/heatmap");
      setActivity(data);
    } catch (error) {
      console.error("Failed to fetch activity", error);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const calculateStreaks = (activity) => {
    if (activity.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const sortedActivity = activity
      .map((a) => ({ ...a, date: parseISO(a.date) }))
      .sort((a, b) => a.date - b.date);

    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedActivity.length; i++) {
      if (i > 0) {
        const diff = differenceInCalendarDays(
          sortedActivity[i].date,
          sortedActivity[i - 1].date
        );
        if (diff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const today = new Date();
    const lastActivityDate = sortedActivity[sortedActivity.length - 1].date;
    const diffFromToday = differenceInCalendarDays(today, lastActivityDate);

    if (diffFromToday <= 1) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    return { currentStreak, longestStreak };
  };

  const { currentStreak, longestStreak } = calculateStreaks(activity);

  return (
    <div className="bg-surface/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
      {/* Glow Effect behind */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg text-white shadow-lg shadow-orange-500/20">
            <Flame size={18} fill="currentColor" />
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">Activity</h3>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Heatmap</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold w-24 text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mb-4 flex flex-col items-center">
        <div className="grid grid-cols-7 gap-x-2 gap-y-2 mb-2 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest w-full max-w-[320px]">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {eachDayOfInterval({
            start: startOfWeek(startOfMonth(currentMonth)),
            end: endOfWeek(endOfMonth(currentMonth))
          }).map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const activityOnDay = activity.find(a => isSameDay(parseISO(a.date), day));
            const count = activityOnDay ? activityOnDay.count : 0;

            return (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-300 relative group/cell
                            ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                            ${count > 0
                    ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] text-black scale-100'
                    : 'bg-white/5 text-transparent hover:bg-white/10 scale-90 hover:scale-100'}
                        `}
              >
                {count > 0 && count}

                {/* Tooltip */}
                {isCurrentMonth && (
                  <div className="absolute bottom-full mb-2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/cell:opacity-100 pointer-events-none z-20 transition-opacity left-1/2 -translate-x-1/2 pointer-events-none">
                    {format(day, 'MMM d')} • {count} tasks
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <div className="flex-1 bg-white/5 rounded-xl p-3 text-center border border-white/5">
          <p className="text-2xl font-black text-white">{currentStreak}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Current Streak</p>
        </div>
        <div className="flex-1 bg-white/5 rounded-xl p-3 text-center border border-white/5">
          <p className="text-2xl font-black text-zinc-400">{longestStreak}</p>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Longest</p>
        </div>
      </div>
    </div>
  );
};

export default StudyHeatmap;
