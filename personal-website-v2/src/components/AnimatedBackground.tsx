'use client'

import React, { useRef, useEffect, useCallback } from 'react';

interface Color { r: number; g: number; b: number; }
interface MouseState { x: number; y: number; isMoving: boolean; }

class Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; life: number; decay: number;
  color: Color; canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0;
    this.size = 0; this.life = 0; this.decay = 0;
    this.color = { r: 0, g: 0, b: 0 };
    this.reset();
  }

  reset(): void {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.size = Math.random() * 2 + 0.5;
    this.life = 1;
    this.decay = Math.random() * 0.003 + 0.001;
    const colors: Color[] = [
      { r: 0, g: 245, b: 255 },
      { r: 255, g: 107, b: 107 },
      { r: 78, g: 205, b: 196 },
      { r: 99, g: 102, b: 241 }
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update(mouseX: number, mouseY: number, isMouseMoving: boolean): void {
    if (isMouseMoving) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) {
        const force = (150 - distance) / 150;
        this.vx += (dx / distance) * force * 0.008;
        this.vy += (dy / distance) * force * 0.008;
      }
    }
    this.x += this.vx;
    this.y += this.vy;
    this.vx += (Math.random() - 0.5) * 0.005;
    this.vy += (Math.random() - 0.5) * 0.005;
    this.vx *= 0.998;
    this.vy *= 0.998;
    this.life -= this.decay;
    if (this.x < 0) this.x = this.canvas.width;
    if (this.x > this.canvas.width) this.x = 0;
    if (this.y < 0) this.y = this.canvas.height;
    if (this.y > this.canvas.height) this.y = 0;
    if (this.life <= 0) this.reset();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life * 0.25;
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
    gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.4})`);
    gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<MouseState>({ x: 0, y: 0, isMoving: false });

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const count = Math.min(40, Math.floor((canvas.width * canvas.height) / 20000));
    particlesRef.current = [];
    for (let i = 0; i < count; i++) particlesRef.current.push(new Particle(canvas));
  }, []);

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          const opacity = (150 - distance) / 150 * 0.06 * particles[i].life * particles[j].life;
          ctx.strokeStyle = `rgba(0, 245, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'rgba(5, 5, 8, 0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particlesRef.current.forEach((p) => {
      p.update(mouseRef.current.x, mouseRef.current.y, mouseRef.current.isMoving);
      p.draw(ctx);
    });
    drawConnections(ctx, particlesRef.current);
    mouseRef.current.isMoving = false;
    animationRef.current = requestAnimationFrame(animate);
  }, [drawConnections]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, isMoving: true };
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.fillStyle = 'rgba(5, 5, 8, 1)'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      initParticles();
    }
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resizeCanvas();
    animationRef.current = requestAnimationFrame(animate);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [animate, handleMouseMove, resizeCanvas]);

  return (
    <div className="bg-animation">
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: -1,
          background: 'transparent'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
