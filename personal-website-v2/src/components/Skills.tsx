'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { skillsData } from '@/services/FetchData';

interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'devops';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  mass: number;
  color: string;
  originalColor: string;
  trail: Array<{ x: number; y: number; alpha: number }>;
  energy: number;
  originalX: number;
  originalY: number;
}

const categoryColors = {
  frontend: { 
    primary: '#00f5ff',
    secondary: '#00d4ff',
    accent: '#00b8e6'
  },
  backend: { 
    primary: '#4ecdc4',
    secondary: '#3fb8b1',
    accent: '#36a8a1'
  },
  devops: { 
    primary: '#6366f1',
    secondary: '#5855e6',
    accent: '#4f46e5'
  }
};

export default function Skills() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null); 
  const mouseRef = useRef({ x: 0, y: 0, isActive: false });
  const skillsRef = useRef<Skill[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const initializeSkills = useCallback(() => {
    const { width, height } = dimensions;
    
    skillsRef.current = skillsData.map((skillData, index) => {
      const textLength = skillData.name.length;
      const baseRadius = Math.max(18, Math.min(32, textLength * 2.5 + 12));
      
      const cols = Math.ceil(Math.sqrt(skillsData.length));
      const rows = Math.ceil(skillsData.length / cols);
      const cellWidth = (width - 100) / cols;
      const cellHeight = (height - 100) / rows;
      
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const cellCenterX = 50 + cellWidth * col + cellWidth / 2;
      const cellCenterY = 50 + cellHeight * row + cellHeight / 2;
      
      const x = cellCenterX + (Math.random() - 0.5) * Math.min(cellWidth * 0.6, 80);
      const y = cellCenterY + (Math.random() - 0.5) * Math.min(cellHeight * 0.6, 80);
      
      return {
        name: skillData.name,
        category: skillData.category,
        x,
        y,
        originalX: x,
        originalY: y,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        radius: baseRadius,
        baseRadius,
        mass: baseRadius / 15,
        color: categoryColors[skillData.category].primary,
        originalColor: categoryColors[skillData.category].primary,
        trail: [],
        energy: 0,
      };
    });
  }, [dimensions]);

  const updatePhysics = useCallback(() => {
    const { width, height } = dimensions;
    const skills = skillsRef.current;
    const mouse = mouseRef.current;
    const currentTime = Date.now();

    skills.forEach((skill, i) => {
      const time = currentTime * 0.0005;
      const oscillationX = Math.sin(time + i * 0.3) * 0.15;
      const oscillationY = Math.cos(time + i * 0.4) * 0.12;
      
      skill.vx += oscillationX * 0.001;
      skill.vy += oscillationY * 0.001;

      if (mouse.isActive) {
        const dx = mouse.x - skill.x;
        const dy = mouse.y - skill.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const proximityRadius = 120;
        
        if (distance < proximityRadius) {
          const proximityFactor = (proximityRadius - distance) / proximityRadius;
          skill.energy = Math.max(skill.energy, proximityFactor * 1.5);
        } else {
          skill.energy *= 0.95;
        }
      } else {
        skill.energy *= 0.95;
      }

      const returnDx = skill.originalX - skill.x;
      const returnDy = skill.originalY - skill.y;
      const returnDistance = Math.sqrt(returnDx * returnDx + returnDy * returnDy);
      
      if (returnDistance > 2) {
        skill.vx += returnDx * 0.0005;
        skill.vy += returnDy * 0.0005;
      }

      for (let j = 0; j < skills.length; j++) {
        if (i === j) continue;
        
        const other = skills[j];
        const dx = skill.x - other.x;
        const dy = skill.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = skill.radius + other.radius + 25;

        if (distance < minDistance && distance > 0) {
          const overlap = minDistance - distance;
          const force = overlap / minDistance;
          const angle = Math.atan2(dy, dx);
          
          const separationForce = force * 0.15;
          skill.vx += Math.cos(angle) * separationForce;
          skill.vy += Math.sin(angle) * separationForce;
          
          if (overlap > 10) {
            const pushDistance = overlap * 0.3;
            skill.x += Math.cos(angle) * pushDistance;
            skill.y += Math.sin(angle) * pushDistance;
          }
        }
      }

      skill.vx *= 0.98;
      skill.vy *= 0.98;

      const maxVelocity = 0.3;
      const speed = Math.sqrt(skill.vx * skill.vx + skill.vy * skill.vy);
      if (speed > maxVelocity) {
        skill.vx = (skill.vx / speed) * maxVelocity;
        skill.vy = (skill.vy / speed) * maxVelocity;
      }

      skill.x += skill.vx;
      skill.y += skill.vy;

      const margin = skill.radius * 2;
      if (skill.x < margin) {
        skill.vx += (margin - skill.x) * 0.008;
      }
      if (skill.x > width - margin) {
        skill.vx -= (skill.x - (width - margin)) * 0.008;
      }
      if (skill.y < margin) {
        skill.vy += (margin - skill.y) * 0.008;
      }
      if (skill.y > height - margin) {
        skill.vy -= (skill.y - (height - margin)) * 0.008;
      }

      if (speed > 0.05) {
        skill.trail.unshift({ x: skill.x, y: skill.y, alpha: 1 });
      }
      if (skill.trail.length > 8) {
        skill.trail.pop();
      }
      
      skill.trail.forEach((point, index) => {
        point.alpha = 1 - (index / skill.trail.length);
      });

      skill.radius = skill.baseRadius + skill.energy * 8;
      skill.color = skill.originalColor;
    });
  }, [dimensions]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mouseRef.current.isActive) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 120, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    skillsRef.current.forEach((skill) => {
      ctx.save();
      
      const colors = categoryColors[skill.category];
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10 + skill.energy * 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      
      ctx.beginPath();
      ctx.arc(skill.x, skill.y, skill.radius, 0, Math.PI * 2);
      
      const gradient = ctx.createRadialGradient(
        skill.x - skill.radius * 0.3,
        skill.y - skill.radius * 0.3,
        0,
        skill.x,
        skill.y,
        skill.radius
      );
      
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(0.6, colors.secondary);
      gradient.addColorStop(1, colors.accent);
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(
        skill.x - skill.radius * 0.3, 
        skill.y - skill.radius * 0.3, 
        skill.radius * 0.3, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      
      ctx.restore();

      ctx.save();
      
      const fontSize = Math.max(11, skill.radius * 0.35);
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(skill.name, skill.x, skill.y);
      
      ctx.restore();
    });
  }, []);

  const animate = useCallback(() => {
    updatePhysics();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updatePhysics, render]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    mouseRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      isActive: true
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.isActive = false;
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(600, rect.width),
          height: Math.max(400, Math.min(600, rect.width * 0.6))
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    initializeSkills();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeSkills, animate]);

  const handleDoubleClick = useCallback(() => {
    initializeSkills();
  }, [initializeSkills]);

  return (
    <section id="skills">
      <h2 className="section-title">Technical Expertise</h2>
      <p className="section-subtitle">Hover over the bubbles to interact with my skill set</p>

      <div 
        ref={containerRef}
        className="skills-canvas-container"
        style={{ height: dimensions.height }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={handleDoubleClick}
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        />
      </div>

      <div className="skills-legend">
        <span className="legend-item"><span className="legend-dot" style={{ background: '#00f5ff' }}></span> Frontend</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#4ecdc4' }}></span> Backend</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#6366f1' }}></span> DevOps</span>
      </div>
    </section>
  );
}
