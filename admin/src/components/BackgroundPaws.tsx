import React, { useMemo } from 'react';

/**
 * BackgroundPaws Component
 * Renders subtle, floating paw print UI elements that move smoothly in the background.
 * Uses CSS translate3d for hardware-accelerated, performant animations.
 */
export const BackgroundPaws = () => {
  const paws = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * -20}s`,
      duration: `${25 + Math.random() * 25}s`,
      scale: 0.5 + Math.random() * 1.2,
      rotation: Math.random() * 360,
      opacity: 0.02 + Math.random() * 0.04
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute animate-float text-orange-500"
          style={{
            left: paw.left,
            top: paw.top,
            animationDelay: paw.delay,
            animationDuration: paw.duration,
            opacity: paw.opacity,
            // Initial transform combined with scale/rotate
            '--initial-scale': paw.scale,
            '--initial-rotation': `${paw.rotation}deg`
          } as React.CSSProperties}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="16" r="4" />
            <circle cx="8" cy="10" r="2.5" />
            <circle cx="12" cy="7" r="2.5" />
            <circle cx="16" cy="10" r="2.5" />
          </svg>
        </div>
      ))}
    </div>
  );
};
