import React from 'react';
import Skeleton from './Skeleton';

const AiSkeleton = () => {
    return (
        <div className="space-y-6 animate-fade-in w-full max-w-4xl mx-auto">
            {/* Tabs Placeholder */}
            <div className="flex justify-center gap-3 mb-8">
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>

            {/* Content Area */}
            <div className="space-y-6 bg-surface/30 p-6 rounded-3xl border border-white/5">
                {/* Summary Header */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>

                {/* Paragraphs */}
                <div className="space-y-4 pt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>

                {/* Bullet Points */}
                <div className="space-y-3 pt-4 pl-4 border-l-2 border-white/5">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        </div>
    );
};

export default AiSkeleton;
