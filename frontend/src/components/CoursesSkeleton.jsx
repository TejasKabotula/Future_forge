import React from 'react';
import Skeleton from './Skeleton';

const CoursesSkeleton = () => {
    return (
        <div className="max-w-[1600px] mx-auto pb-20 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                <div className="space-y-3">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-14 w-full md:w-[600px] rounded-2xl" /> {/* Search bar */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-[320px] rounded-3xl border border-white/5 bg-surface/30 p-5 flex flex-col gap-4">
                        <Skeleton className="w-full aspect-video rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="space-y-3 mt-auto">
                            <Skeleton className="h-2 w-full rounded-full" />
                            <div className="flex justify-between">
                                <Skeleton className="h-3 w-10" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CoursesSkeleton;
