import React, { useMemo } from 'react';
import { PawPrint } from 'lucide-react';

/**
 * BackgroundPaws Component
 * Renders high-quality, floating paw print UI elements.
 */
export const BackgroundPaws = () => {
  const paws = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * -20}s`,
      duration: `${30 + Math.random() * 30}s`,
      scale: 0.8 + Math.random() * 1.2,
      rotation: Math.random() * 360,
      opacity: 1.0 // 100% opacity as requested
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-transparent">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute animate-float text-[#5a2e17]" // Deep espresso brown
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
          <PawPrint 
            size={100} 
            strokeWidth={0} 
            fill="currentColor" 
          />
        </div>
      ))}
    </div>
  );
};
