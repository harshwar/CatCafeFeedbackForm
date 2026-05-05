import React from 'react';
import { motion } from 'framer-motion';

const Shimmer = () => (
  <motion.div
    initial={{ x: '-100%' }}
    animate={{ x: '100%' }}
    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
  />
);

const SkeletonItem = ({ className }: { className: string }) => (
  <div className={`relative overflow-hidden bg-stone-200 rounded-2xl ${className}`}>
    <Shimmer />
  </div>
);

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Metric Banner Skeleton */}
      <div className="flex flex-wrap gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 min-w-[240px] bg-white p-6 rounded-[2rem] border border-stone-100 flex items-center gap-5">
            <SkeletonItem className="w-14 h-14 rounded-2xl" />
            <div className="space-y-2">
              <SkeletonItem className="w-20 h-3" />
              <SkeletonItem className="w-12 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[minmax(200px,_auto)]">
        {/* Main Banner Skeleton */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-stone-100 h-full">
          <div className="flex items-center gap-3 mb-8">
            <SkeletonItem className="w-12 h-12" />
            <SkeletonItem className="w-48 h-8" />
          </div>
          <SkeletonItem className="w-full h-12 mb-10" />
          <div className="grid grid-cols-4 gap-6 pt-10 border-t border-stone-100">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <SkeletonItem className="w-16 h-3" />
                <SkeletonItem className="w-10 h-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Skeleton */}
        <div className="lg:col-span-4 bg-stone-900 p-8 rounded-[2.5rem] h-full flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <SkeletonItem className="w-24 h-6" />
              <div className="flex gap-2">
                <SkeletonItem className="w-8 h-8" />
                <SkeletonItem className="w-8 h-8" />
              </div>
            </div>
            <SkeletonItem className="w-full h-24" />
          </div>
          <SkeletonItem className="w-full h-12 mt-8" />
        </div>

        {/* Chart Skeletons */}
        <div className="lg:col-span-6 bg-white p-8 rounded-[2.5rem] border border-stone-100 h-[400px]">
          <SkeletonItem className="w-48 h-6 mb-8" />
          <SkeletonItem className="w-full h-[280px]" />
        </div>
        <div className="lg:col-span-6 bg-white p-8 rounded-[2.5rem] border border-stone-100 h-[400px]">
          <SkeletonItem className="w-48 h-6 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => <SkeletonItem key={i} className="w-full h-4" />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeedbackSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-stone-100 space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <SkeletonItem className="w-14 h-14 rounded-full" />
            <div className="space-y-2">
              <SkeletonItem className="w-32 h-4" />
              <SkeletonItem className="w-20 h-3" />
            </div>
          </div>
          <SkeletonItem className="w-24 h-10" />
        </div>
        <SkeletonItem className="w-full h-16" />
      </div>
    ))}
  </div>
);
