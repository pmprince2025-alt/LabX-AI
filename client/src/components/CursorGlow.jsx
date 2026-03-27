import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CursorGlow = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-50 mix-blend-screen"
      animate={{
        x: mousePosition.x - 200, // offset by half the width to center
        y: mousePosition.y - 200,
      }}
      transition={{
        type: "spring",
        damping: 40,
        stiffness: 400,
        mass: 0.5
      }}
      style={{
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(224,224,255,0.08) 0%, rgba(224,224,255,0) 60%)',
        borderRadius: '50%'
      }}
    />
  );
};

export default CursorGlow;
