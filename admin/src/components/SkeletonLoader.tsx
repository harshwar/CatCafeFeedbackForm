import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-stone-200 rounded-lg ${className}`} />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-50 h-32 flex flex-col justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50 h-[400px]">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-full w-full" />
        </div>
        <div className="xl:col-span-4 bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50 h-[400px]">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="flex justify-center mb-6">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* Bottom Row Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-5 bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50 h-[400px]">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="xl:col-span-7 bg-white p-6 rounded-[1.5rem] shadow-sm border border-orange-50 h-[400px]">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 bg-stone-50 rounded-2xl">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
