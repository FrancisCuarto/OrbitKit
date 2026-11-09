import React, { useRef, useState } from 'react';

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glareColor?: string;
}

export function Tilt3DCard({
  children,
  className = '',
  intensity = 10,
  glareColor = 'rgba(71, 140, 191, 0.18)'
}: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateY = ((mouseX / width) - 0.5) * intensity * 2;
    const rotateX = ((mouseY / height) - 0.5) * -intensity * 2;

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
    );
    setGlarePosition({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: glarePosition.opacity === 0 ? 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 0.08s ease-out',
        transformStyle: 'preserve-3d'
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Dynamic 3D Specular Glare Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: glarePosition.opacity,
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${glareColor}, transparent 65%)`
        }}
      />
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }} className="relative z-20 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
