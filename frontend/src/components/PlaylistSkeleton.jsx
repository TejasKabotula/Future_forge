import React from 'react';
import Skeleton from './Skeleton';

const PlaylistSkeleton = () => {
    return (
        <div className="max-w-[1600px] mx-auto pb-20 animate-fade-in">
            <div className="flex justify-between mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-10 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Video Player */}
                    <Skeleton className="w-full aspect-video rounded-2xl" />

                    {/* Video Info */}
                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <div className="flex gap-4">
                            <Skeleton className="h-6 w-20 rounded-md" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="space-y-2 pt-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 h-[600px] flex flex-col gap-4">
                    {/* Stats */}
                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>

                    {/* List */}
                    <div className="flex-1 space-y-3 overflow-hidden">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex gap-3 p-3">
                                <Skeleton className="w-24 h-16 rounded-lg shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaylistSkeleton;
