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
      opacity: 0.5 + Math.random() * 0.25 // 50% to 75% opacity
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-transparent">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute animate-float text-[#FFF1E7]" // Soft peach/orange
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
          <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
            {/* Main large pad */}
            <path d="M12 13.5c-2.5 0-4.5 1.5-4.5 4s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4-4.5-4z" />
            {/* 4 Toes arched above */}
            <circle cx="7" cy="10" r="2.2" />
            <circle cx="10.5" cy="7" r="2.2" />
            <circle cx="14.5" cy="7" r="2.2" />
            <circle cx="18" cy="10" r="2.2" />
          </svg>
        </div>
      ))}
    </div>

  );
};
