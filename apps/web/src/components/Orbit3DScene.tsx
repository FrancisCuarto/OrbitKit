import { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Satellite {
  label: string;
  sub: string;
  orbitRadius: number;
  angle: number;
  speed: number;
  tiltX: number;
  tiltZ: number;
  color: string;
  pulsePhase: number;
}

export function Orbit3DScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 620);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 620;
    };
    window.addEventListener('resize', handleResize);

    // Mouse interaction state for 3D camera parallax
    let targetRotX = 0.28;
    let targetRotY = 0.0;
    let currentRotX = 0.28;
    let currentRotY = 0.0;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      targetRotY = normX * 0.9;
      targetRotX = 0.25 + normY * 0.6;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Generate 3D Icosahedron core geometry
    const t = (1 + Math.sqrt(5)) / 2;
    const coreRadius = 68;
    const rawVertices: [number, number, number][] = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];

    const coreVertices: Point3D[] = rawVertices.map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return {
        x: (x / len) * coreRadius,
        y: (y / len) * coreRadius,
        z: (z / len) * coreRadius
      };
    });

    // Connect edges that are close to each other
    const edges: [number, number][] = [];
    for (let i = 0; i < coreVertices.length; i++) {
      for (let j = i + 1; j < coreVertices.length; j++) {
        const dx = coreVertices[i].x - coreVertices[j].x;
        const dy = coreVertices[i].y - coreVertices[j].y;
        const dz = coreVertices[i].z - coreVertices[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < coreRadius * 1.25) {
          edges.push([i, j]);
        }
      }
    }

    // 3D Orbiting Ecosystem Satellites
    const satellites: Satellite[] = [
      {
        label: 'Godot 4.x',
        sub: 'Engine Bridge MCP',
        orbitRadius: 195,
        angle: 0.4,
        speed: 0.006,
        tiltX: 0.45,
        tiltZ: 0.15,
        color: '#478cbf',
        pulsePhase: 0
      },
      {
        label: 'Blender 3D',
        sub: '.blend & glTF 2.0',
        orbitRadius: 245,
        angle: 2.1,
        speed: -0.0045,
        tiltX: -0.35,
        tiltZ: 0.3,
        color: '#f5792a',
        pulsePhase: 1.5
      },
      {
        label: 'ctx7 MCP',
        sub: 'Live Docs Injection',
        orbitRadius: 215,
        angle: 3.8,
        speed: 0.0055,
        tiltX: 0.55,
        tiltZ: -0.25,
        color: '#10b981',
        pulsePhase: 3.0
      },
      {
        label: 'GDScript LSP',
        sub: 'Port :6005 Live',
        orbitRadius: 170,
        angle: 5.1,
        speed: 0.007,
        tiltX: -0.5,
        tiltZ: -0.2,
        color: '#38bdf8',
        pulsePhase: 4.2
      },
      {
        label: 'GDShader VFX',
        sub: '2D/3D Shader Skill',
        orbitRadius: 270,
        angle: 1.2,
        speed: 0.004,
        tiltX: 0.25,
        tiltZ: -0.45,
        color: '#a855f7',
        pulsePhase: 2.4
      },
      {
        label: 'GUT Runner',
        sub: 'Unit Testing MCP',
        orbitRadius: 230,
        angle: 4.5,
        speed: -0.005,
        tiltX: 0.38,
        tiltZ: 0.4,
        color: '#f43f5e',
        pulsePhase: 5.1
      }
    ];

    // 3D Starfield particles
    const stars = Array.from({ length: 75 }, () => ({
      x: (Math.random() - 0.5) * 1100,
      y: (Math.random() - 0.5) * 650,
      z: (Math.random() - 0.5) * 700,
      size: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.55 + 0.15
    }));

    // 3D Math Helpers
    const rotate3D = (p: Point3D, rx: number, ry: number, rz: number): Point3D => {
      // Rotate Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.z * cosY + p.x * sinY;

      // Rotate X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = z1 * cosX + p.y * sinX;

      // Rotate Z
      const cosZ = Math.cos(rz);
      const sinZ = Math.sin(rz);
      const x3 = x1 * cosZ - y2 * sinZ;
      const y3 = y2 * cosZ + x1 * sinZ;

      return { x: x3, y: y3, z: z2 };
    };

    const project = (p: Point3D, cx: number, cy: number, fov = 560) => {
      const distance = 680;
      const scale = fov / Math.max(120, distance + p.z);
      return {
        x: cx + p.x * scale,
        y: cy + p.y * scale,
        scale,
        z: p.z
      };
    };

    let spinAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      spinAngle += 0.006;

      // Smooth lerp camera towards mouse target
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      const cx = width / 2;
      const cy = Math.min(height * 0.42, 260);

      // 1. Render 3D Starfield
      for (const s of stars) {
        const rotated = rotate3D(s, currentRotX * 0.5, currentRotY * 0.5 + spinAngle * 0.15, 0);
        const proj = project(rotated, cx, cy);
        ctx.fillStyle = `rgba(145, 196, 229, ${s.alpha * Math.min(1, proj.scale)})`;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, s.size * proj.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Central Ambient Core Halo
      const halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220);
      halo.addColorStop(0, 'rgba(71, 140, 191, 0.22)');
      halo.addColorStop(0.45, 'rgba(71, 140, 191, 0.06)');
      halo.addColorStop(1, 'rgba(13, 20, 27, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, 220, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw 3D Orbital Rings & Satellites
      for (const sat of satellites) {
        sat.angle += sat.speed;
        sat.pulsePhase += 0.035;

        // Draw orbit path segments in 3D
        ctx.beginPath();
        const steps = 64;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const localPt: Point3D = {
            x: Math.cos(theta) * sat.orbitRadius,
            y: 0,
            z: Math.sin(theta) * sat.orbitRadius
          };
          const tilted = rotate3D(localPt, sat.tiltX, 0, sat.tiltZ);
          const camPt = rotate3D(tilted, currentRotX, currentRotY, 0);
          const proj = project(camPt, cx, cy);
          if (i === 0) ctx.moveTo(proj.x, proj.y);
          else ctx.lineTo(proj.x, proj.y);
        }
        ctx.strokeStyle = 'rgba(71, 140, 191, 0.13)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Compute current satellite 3D position
        const satLocal: Point3D = {
          x: Math.cos(sat.angle) * sat.orbitRadius,
          y: 0,
          z: Math.sin(sat.angle) * sat.orbitRadius
        };
        const satTilted = rotate3D(satLocal, sat.tiltX, 0, sat.tiltZ);
        const satCam = rotate3D(satTilted, currentRotX, currentRotY, 0);
        const satProj = project(satCam, cx, cy);

        // Draw 3D neural beam connecting satellite to central Godot core
        const beamGrad = ctx.createLinearGradient(cx, cy, satProj.x, satProj.y);
        beamGrad.addColorStop(0, 'rgba(71, 140, 191, 0.35)');
        beamGrad.addColorStop(1, `${sat.color}66`);
        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 1.2 * satProj.scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(satProj.x, satProj.y);
        ctx.stroke();

        // Draw traveling MCP data packet along the beam
        const tPacket = (Math.sin(sat.pulsePhase) + 1) / 2;
        const px = cx + (satProj.x - cx) * tPacket;
        const py = cy + (satProj.y - cy) * tPacket;
        ctx.fillStyle = sat.color;
        ctx.beginPath();
        ctx.arc(px, py, 2.6 * satProj.scale, 0, Math.PI * 2);
        ctx.fill();

        // Draw Satellite Node Glow & Core
        const nodeRadius = 6.5 * satProj.scale;
        const nodeGlow = ctx.createRadialGradient(
          satProj.x,
          satProj.y,
          1,
          satProj.x,
          satProj.y,
          nodeRadius * 3.2
        );
        nodeGlow.addColorStop(0, sat.color);
        nodeGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nodeGlow;
        ctx.beginPath();
        ctx.arc(satProj.x, satProj.y, nodeRadius * 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(satProj.x, satProj.y, nodeRadius * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // 3D Floating Label Tag next to Satellite
        if (satProj.scale > 0.68) {
          const alpha = Math.min(1, (satProj.scale - 0.5) * 1.8);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = `700 ${Math.round(11 * satProj.scale)}px "Plus Jakarta Sans", sans-serif`;
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(sat.label, satProj.x + 12 * satProj.scale, satProj.y - 2 * satProj.scale);

          ctx.font = `500 ${Math.round(9.5 * satProj.scale)}px "JetBrains Mono", monospace`;
          ctx.fillStyle = sat.color;
          ctx.fillText(sat.sub, satProj.x + 12 * satProj.scale, satProj.y + 10 * satProj.scale);
          ctx.restore();
        }
      }

      // 4. Render 3D Geodesic Core (Rotating Godot Wireframe Polyhedron)
      const transformedCore = coreVertices.map((v) => {
        const spun = rotate3D(v, spinAngle * 0.7, spinAngle * 1.1, spinAngle * 0.4);
        const cam = rotate3D(spun, currentRotX, currentRotY, 0);
        return project(cam, cx, cy);
      });

      for (const [i, j] of edges) {
        const p1 = transformedCore[i];
        const p2 = transformedCore[j];
        const avgZ = (p1.z + p2.z) / 2;
        const depthAlpha = Math.max(0.12, Math.min(0.75, 1 - avgZ / (coreRadius * 1.8)));

        ctx.strokeStyle = `rgba(105, 167, 208, ${depthAlpha.toFixed(2)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      for (const pt of transformedCore) {
        const depthAlpha = Math.max(0.25, Math.min(0.95, 1 - pt.z / (coreRadius * 1.6)));
        ctx.fillStyle = `rgba(145, 196, 229, ${depthAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5 * pt.scale, 0, Math.PI * 2);
        ctx.fill();
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
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-90"
      />
      {/* Bottom vignette blend into page background */}
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-godot-950 via-godot-950/80 to-transparent" />
    </div>
  );
}
