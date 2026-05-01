import React, { useMemo } from 'react';

/**
 * BackgroundPaws Component
 * Renders subtle, floating paw print UI elements that move smoothly in the background.
 * Uses CSS translate3d for hardware-accelerated, performant animations.
 */
export const BackgroundPaws = () => {
  const paws = useMemo(() => {
    console.log('BackgroundPaws: Generating 12 paws...');
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * -20}s`,
      duration: `${25 + Math.random() * 25}s`,
      scale: 0.8 + Math.random() * 1.5,
      rotation: Math.random() * 360,
      opacity: 1.0 // 100% opacity as requested
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-transparent">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute animate-float text-orange-900" 
          style={{
            left: paw.left,
            top: paw.top,
            animationDelay: paw.delay,
            animationDuration: paw.duration,
            opacity: paw.opacity,
            '--initial-scale': paw.scale,
            '--initial-rotation': `${paw.rotation}deg`
          } as React.CSSProperties}
        >
          <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor">
            {/* Main large pad with the 'heart' dip at the top */}
            <path d="M12 12.5c-2.8 0-5 2-5 5s2.2 4.5 5 4.5 5-1.5 5-4.5-2.2-5-5-5z" />
            {/* 4 Large toes arched above */}
            <circle cx="7" cy="9" r="2.5" />
            <circle cx="10.5" cy="5.5" r="2.5" />
            <circle cx="14.5" cy="5.5" r="2.5" />
            <circle cx="18" cy="9" r="2.5" />
          </svg>
        </div>
      ))}
    </div>


  );
};
