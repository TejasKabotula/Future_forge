import React from 'react';
import Skeleton from './Skeleton';

const DashboardSkeleton = () => {
    return (
        <div className="max-w-[1600px] mx-auto pb-20 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
                <div className="space-y-3 w-full max-w-md">
                    <Skeleton className="h-10 w-2/3" /> {/* Title */}
                    <Skeleton className="h-6 w-full" /> {/* Subtitle */}
                </div>
            </header>

            <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1 space-y-10 min-w-0">

                    {/* Jump Back In Section */}
                    <section>
                        <Skeleton className="h-7 w-48 mb-6" /> {/* Section Title */}

                        {/* JumpBackIn Card Mock */}
                        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-surface/30 h-[280px] md:h-[320px] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                            <Skeleton className="w-full md:w-80 h-48 md:h-full rounded-xl shrink-0" /> {/* Thumbnail */}
                            <div className="flex-1 w-full space-y-4 py-2">
                                <Skeleton className="h-4 w-32 rounded-full" /> {/* Badge */}
                                <Skeleton className="h-8 w-full" /> {/* Title */}
                                <Skeleton className="h-8 w-3/4" /> {/* Title line 2 */}
                                <Skeleton className="h-4 w-1/2" /> {/* Subtitle */}
                                <div className="pt-4">
                                    <Skeleton className="h-12 w-48 rounded-xl" /> {/* Button */}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card 1 */}
                        <div className="bg-white/5 border border-white/5 p-6 rounded-3xl h-48 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Skeleton className="w-12 h-12 rounded-xl" />
                                <Skeleton className="w-6 h-6 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="bg-white/5 border border-white/5 p-6 rounded-3xl h-48 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Skeleton className="w-12 h-12 rounded-xl" />
                                <Skeleton className="w-6 h-6 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar: Heatmap */}
                <div className="xl:w-[350px] shrink-0 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Heatmap Mock */}
                        <div className="bg-surface/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 h-[350px]">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex gap-3">
                                    <Skeleton className="w-10 h-10 rounded-lg" />
                                    <div className="space-y-1">
                                        <Skeleton className="w-20 h-4" />
                                        <Skeleton className="w-12 h-3" />
                                    </div>
                                </div>
                                <Skeleton className="w-24 h-8 rounded-lg" />
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 28 }).map((_, i) => (
                                    <Skeleton key={i} className="w-8 h-8 rounded-lg bg-white/5" />
                                ))}
                            </div>
                        </div>

                        {/* Tip Card Mock */}
                        <div className="h-32 bg-primary/5 rounded-3xl border border-primary/10 p-5">
                            <div className="flex gap-4">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="w-24 h-5" />
                                    <Skeleton className="w-full h-3" />
                                    <Skeleton className="w-4/5 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
