import React, { useState, useEffect } from 'react';
import {
    format,
    subDays,
    eachDayOfInterval,
    isSameDay,
    startOfWeek,
    endOfWeek,
    addDays,
    parseISO,
    startOfYear,
    endOfYear
} from 'date-fns';
import api from '../services/api';

const DetailedHeatmap = () => {
    const [activity, setActivity] = useState([]);

    // We want to show the last 365 days (approx 52 weeks) 
    // ending today
    const today = new Date();
    const startDate = subDays(today, 365);

    // Generate all dates in range
    const days = eachDayOfInterval({
        start: startDate,
        end: today
    });

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

    // Create a color scale function
    const getColor = (count) => {
        if (count === 0) return 'bg-zinc-800/50';
        if (count === 1) return 'bg-green-900';
        if (count <= 3) return 'bg-green-700';
        if (count <= 5) return 'bg-green-500';
        return 'bg-green-400';
    };

    // Group days by week for the grid layout
    // The grid should flow column by column (weeks)
    // We need to pad the beginning to align with Sunday/Monday start
    const weeks = [];
    let currentWeek = [];

    days.forEach((day, index) => {
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        currentWeek.push(day);
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return (
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-fit">
                <div className="flex gap-1">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1">
                            {week.map((day, dIndex) => {
                                const activityOnDay = activity.find(a => isSameDay(parseISO(a.date), day));
                                const count = activityOnDay ? activityOnDay.count : 0;

                                return (
                                    <div
                                        key={day.toString()}
                                        className={`w-3 h-3 rounded-sm ${getColor(count)} hover:ring-1 hover:ring-white/50 transition-all cursor-default title-tooltip`}
                                        title={`${format(day, 'MMM d, yyyy')}: ${count} completed videos`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-4 justify-end">
                    <span>Less</span>
                    <div className="w-3 h-3 bg-zinc-800/50 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default DetailedHeatmap;
