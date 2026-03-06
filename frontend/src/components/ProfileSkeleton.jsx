import React from 'react';
import Skeleton from './Skeleton';

const ProfileSkeleton = () => {
    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Header Card */}
            <div className="bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-xl">
                <Skeleton className="w-32 h-32 rounded-full shrink-0" variant="circle" />
                <div className="flex-1 w-full flex flex-col items-center md:items-start space-y-4">
                    <Skeleton className="h-10 w-64" /> {/* Name */}
                    <div className="flex gap-6">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            </div>

            {/* Heatmap Placeholder */}
            <div className="bg-surface p-6 rounded-3xl border border-white/5">
                <Skeleton className="h-8 w-48 mb-6" />
                <Skeleton className="h-[140px] w-full rounded-2xl" />
            </div>

            {/* Achievements */}
            <div className="bg-surface p-6 rounded-3xl border border-white/5">
                <Skeleton className="h-8 w-64 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4 flex gap-4">
                            <Skeleton className="w-16 h-16 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
