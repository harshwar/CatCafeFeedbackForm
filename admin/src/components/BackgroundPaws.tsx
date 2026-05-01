import React, { useMemo } from 'react';

/**
 * BackgroundPaws Component
 * Renders high-quality, floating paw print UI elements.
 */
export const BackgroundPaws = () => {
  const paws = useMemo(() => {
    const items = [];
    const rows = 4;
    const cols = 4;
    
    // Grid-based placement to avoid overlap
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({
          id: `${r}-${c}`,
          left: `${(c / cols) * 100 + (Math.random() * (100 / cols) * 0.6)}%`,
          top: `${(r / rows) * 100 + (Math.random() * (100 / rows) * 0.6)}%`,
          delay: `${Math.random() * -30}s`,
          duration: `${40 + Math.random() * 40}s`,
          scale: 0.7 + Math.random() * 0.8,
          rotation: -20 + Math.random() * 40,
          opacity: 0.75
        });
      }
    }
    return items;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-transparent">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className="absolute animate-float text-[#FFB38E]"
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
          <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
            {/* High-fidelity chunky bottom pad */}
            <path d="M12 12.5c-3.3 0-6 2.2-6 5 0 2.2 2 4 4 4.5.5.1.7.5 1 .5s.5-.4 1-.5c2-.5 4-2.3 4-4.5 0-2.8-2.7-5-6-5z" />
            {/* 4 Anatomically shaped toes */}
            <ellipse cx="5.5" cy="11.5" rx="2.5" ry="3.8" transform="rotate(-30 5.5 11.5)" />
            <ellipse cx="9.8" cy="7.5" rx="2.5" ry="4.5" />
            <ellipse cx="14.2" cy="7.5" rx="2.5" ry="4.5" />
            <ellipse cx="18.5" cy="11.5" rx="2.5" ry="3.8" transform="rotate(30 18.5 11.5)" />
          </svg>
        </div>
      ))}
    </div>


  );
};
