import React, { useEffect, useState } from 'react';

const HexBackground = () => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-black overflow-hidden">
      {/* 
        SVG Filter for glowing hexagon outlines
      */}
      <svg className="absolute w-0 h-0">
        <defs>
          <radialGradient id="hexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Hexagon Pattern Grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.92' viewBox='0 0 60 103.92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23ffffff' stroke-opacity='0.15' stroke-width='1'/%3E%3Cpath d='M60 51.96l25.98 15v30L60 103.92 34.02 88.92v-30z' fill='none' stroke='%23ffffff' stroke-opacity='0.15' stroke-width='1'/%3E%3Cpath d='M0 51.96l25.98 15v30L0 103.92-25.98 88.92v-30z' fill='none' stroke='%23ffffff' stroke-opacity='0.15' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 103.92px',
        }}
      />

      {/* Cursor interaction layer - reveals stronger outlines */}
      <div 
        className="absolute inset-0 opacity-100 mix-blend-screen transition-opacity duration-300"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.92' viewBox='0 0 60 103.92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23ffffff' stroke-opacity='1' stroke-width='1.5'/%3E%3Cpath d='M60 51.96l25.98 15v30L60 103.92 34.02 88.92v-30z' fill='none' stroke='%23ffffff' stroke-opacity='1' stroke-width='1.5'/%3E%3Cpath d='M0 51.96l25.98 15v30L0 103.92-25.98 88.92v-30z' fill='none' stroke='%23ffffff' stroke-opacity='1' stroke-width='1.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 103.92px',
          maskImage: `radial-gradient(150px circle at ${mousePos.x}px ${mousePos.y}px, black 10%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(150px circle at ${mousePos.x}px ${mousePos.y}px, black 10%, transparent 100%)`,
        }}
      />

      {/* Vignette effect (darker edges) */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,1)] z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] z-10" />
    </div>
  );
};

export default HexBackground;
