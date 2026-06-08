import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  trigger: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const PARTICLE_COLORS = [
  '#4f46e5', // Indigo
  '#ec4899', // Pink
  '#eab308', // Yellow
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#a855f7', // Purple
];

export const Confetti: React.FC<ConfettiProps> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (trigger === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate particles from multiple points (usually middle bottom or scattered)
    const newParticles: Particle[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      // Spawn points: left and right edges at 60% height shooting inwards
      const fromLeft = Math.random() > 0.5;
      const x = fromLeft ? 0 : canvas.width;
      const y = canvas.height * 0.65 + (Math.random() - 0.5) * 100;

      // Speed configuration: shoot upwards and inwards
      const angle = fromLeft
        ? (Math.random() * 45 - 60) * (Math.PI / 180) // -60 to -15 degrees
        : (Math.random() * 45 - 165) * (Math.PI / 180); // -165 to -120 degrees
      const force = 12 + Math.random() * 10;

      newParticles.push({
        x,
        y,
        size: 5 + Math.random() * 8,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        speedX: Math.cos(angle) * force,
        speedY: Math.sin(angle) * force,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    // Animation Loop
    const gravity = 0.35;
    const drag = 0.985;

    const animate = () => {
      const activeParticles = particlesRef.current;
      if (activeParticles.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = activeParticles
        .map((p) => {
          // Update physics
          p.x += p.speedX;
          p.y += p.speedY;
          p.speedX *= drag;
          p.speedY = p.speedY * drag + gravity;
          p.rotation += p.rotationSpeed;
          
          // Fade out as they fall below 70% of screen or age
          if (p.speedY > 2) {
            p.opacity -= 0.012;
          }

          // Render particle
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);

          // Draw a diamond/rectangle shape
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();

          return p;
        })
        .filter((p) => p.opacity > 0 && p.y < canvas.height && p.x >= -50 && p.x <= canvas.width + 50);

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    // Start loop if not already running
    if (animationFrameIdRef.current === null) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
    />
  );
};
