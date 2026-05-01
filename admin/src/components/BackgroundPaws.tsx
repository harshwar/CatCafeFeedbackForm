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
      scale: 0.8 + Math.random() * 1.5,
      rotation: Math.random() * 360,
      opacity: 0.75 // 75% opacity for a softer look
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-transparent">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute animate-float text-[#FFB38E]" // Warm peach/orange
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
            {/* Main large pad - softer rounded bean shape */}
            <path d="M12 13.5c-2.5 0-4.5 1.5-4.5 4s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4-4.5-4z" />
            {/* 4 Larger, oval-shaped toes */}
            <ellipse cx="7" cy="10" rx="2.5" ry="3.2" />
            <ellipse cx="10.5" cy="7" rx="2.5" ry="3.2" />
            <ellipse cx="14.5" cy="7" rx="2.5" ry="3.2" />
            <ellipse cx="18" cy="10" rx="2.5" ry="3.2" />
          </svg>
        </div>
      ))}
    </div>

  );
};
