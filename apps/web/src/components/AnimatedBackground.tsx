import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  shape: 'circle' | 'hex' | 'cross';
  rotation: number;
  vRot: number;
}

interface DataPulse {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  color: string;
  alpha: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const palette = ['#478cbf', '#69a7d0', '#38bdf8', '#a855f7', '#10b981', '#f5792a'];
    const shapes: ('circle' | 'hex' | 'cross')[] = ['circle', 'circle', 'hex', 'cross'];

    const particleCount = Math.min(70, Math.floor((width * height) / 22000));
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2.4 + 1.2,
      color: palette[Math.floor(Math.random() * palette.length)],
      alpha: Math.random() * 0.55 + 0.2,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.015
    }));

    // Shooting data pulses along grid lines
    const pulses: DataPulse[] = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2.5 + 1.5),
      vy: 0,
      length: Math.random() * 80 + 50,
      color: '#478cbf',
      alpha: Math.random() * 0.45 + 0.15
    }));

    let gridOffset = 0;

    const drawHexagon = (x: number, y: number, r: number, rot: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = rot + (i * Math.PI) / 3;
        const hx = x + r * Math.cos(angle);
        const hy = y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const drawCross = (x: number, y: number, r: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.moveTo(0, -r);
      ctx.lineTo(0, r);
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      gridOffset = (gridOffset + 0.25) % 64;

      // 1. Subtle Animated Blueprint Grid
      ctx.strokeStyle = 'rgba(71, 140, 191, 0.045)';
      ctx.lineWidth = 1;
      const cellSize = 64;

      for (let x = gridOffset; x < width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = gridOffset; y < height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Mouse Spotlight Glow on Background
      if (mouse.x > 0 && mouse.y > 0) {
        const mouseGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          10,
          mouse.x,
          mouse.y,
          280
        );
        mouseGrad.addColorStop(0, 'rgba(71, 140, 191, 0.11)');
        mouseGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.04)');
        mouseGrad.addColorStop(1, 'rgba(13, 20, 27, 0)');
        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 280, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Shooting Data Pulses
      for (const pulse of pulses) {
        pulse.x += pulse.vx;
        if (pulse.vx > 0 && pulse.x - pulse.length > width) {
          pulse.x = -pulse.length;
          pulse.y = Math.floor(Math.random() * (height / cellSize)) * cellSize + gridOffset;
        } else if (pulse.vx < 0 && pulse.x + pulse.length < 0) {
          pulse.x = width + pulse.length;
          pulse.y = Math.floor(Math.random() * (height / cellSize)) * cellSize + gridOffset;
        }

        const grad = ctx.createLinearGradient(
          pulse.x,
          pulse.y,
          pulse.x - Math.sign(pulse.vx) * pulse.length,
          pulse.y
        );
        grad.addColorStop(0, `rgba(105, 167, 208, ${pulse.alpha})`);
        grad.addColorStop(1, 'rgba(71, 140, 191, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(pulse.x, pulse.y);
        ctx.lineTo(pulse.x - Math.sign(pulse.vx) * pulse.length, pulse.y);
        ctx.stroke();
      }

      // 4. Update & Draw Constellation Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Connect to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 145) {
            const lineAlpha = (1 - dist / 145) * 0.16;
            ctx.strokeStyle = `rgba(105, 167, 208, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connect to mouse cursor if nearby
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 190) {
          const mAlpha = (1 - mDist / 190) * 0.35;
          ctx.strokeStyle = `rgba(56, 189, 248, ${mAlpha.toFixed(3)})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Draw particle shape
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'hex') {
          drawHexagon(p.x, p.y, p.radius * 2.2, p.rotation);
        } else {
          drawCross(p.x, p.y, p.radius * 2, p.rotation);
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className="pointer-events-none select-none fixed inset-0 z-0 overflow-hidden"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* Drifting Ambient Nebula Orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-godot-500/15 blur-[130px] animate-blob-slow" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[460px] h-[460px] rounded-full bg-purple-500/10 blur-[130px] animate-blob-reverse" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[140px] animate-blob-slow" />

      {/* Interactive Constellation & Grid Canvas */}
      <canvas ref={canvasRef} className="pointer-events-none w-full h-full opacity-90" style={{ pointerEvents: 'none' }} />
    </div>
  );
}
