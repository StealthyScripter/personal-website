'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react';

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

interface SkillsProps {
  className?: string;
}

const skillsData = [
  // Frontend Skills
  { name: "React", category: "frontend" as const },
  { name: "Vue.js", category: "frontend" as const },
  { name: "TypeScript", category: "frontend" as const },
  { name: "Next.js", category: "frontend" as const },
  { name: "Tailwind CSS", category: "frontend" as const },
  { name: "Three.js", category: "frontend" as const },
  
  // Backend Skills
  { name: "Node.js", category: "backend" as const },
  { name: "Python", category: "backend" as const },
  { name: "Express", category: "backend" as const },
  { name: "Django", category: "backend" as const },
  { name: "PostgreSQL", category: "backend" as const },
  { name: "MongoDB", category: "backend" as const },
  
  // DevOps Skills
  { name: "Docker", category: "devops" as const },
  { name: "AWS", category: "devops" as const },
  { name: "Git", category: "devops" as const },
  { name: "CI/CD", category: "devops" as const },
  { name: "Kubernetes", category: "devops" as const },
  { name: "Vercel", category: "devops" as const },
];

const categoryColors = {
  frontend: { 
    primary: '#00f5ff', // Your website's cyan
    secondary: '#00d4ff',
    accent: '#00b8e6'
  },
  backend: { 
    primary: '#4ecdc4', // Your website's teal
    secondary: '#3fb8b1',
    accent: '#36a8a1'
  },
  devops: { 
    primary: '#6366f1', // Professional purple
    secondary: '#5855e6',
    accent: '#4f46e5'
  }
};

export default function Skills({ className = '' }: SkillsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(null);
  const mouseRef = useRef({ x: 0, y: 0, isActive: false });
  const skillsRef = useRef<Skill[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Initialize skills with better distribution
  const initializeSkills = useCallback(() => {
    const { width, height } = dimensions;
    
    skillsRef.current = skillsData.map((skillData, index) => {
      const textLength = skillData.name.length;
      const baseRadius = Math.max(18, Math.min(32, textLength * 2.5 + 12));
      
      // Better distribution to prevent initial overlaps
      const cols = Math.ceil(Math.sqrt(skillsData.length));
      const rows = Math.ceil(skillsData.length / cols);
      const cellWidth = (width - 100) / cols;
      const cellHeight = (height - 100) / rows;
      
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const cellCenterX = 50 + cellWidth * col + cellWidth / 2;
      const cellCenterY = 50 + cellHeight * row + cellHeight / 2;
      
      // Add some randomness within the cell
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

  // Physics simulation with proximity expansion and gentle oscillations
  const updatePhysics = useCallback(() => {
    const { width, height } = dimensions;
    const skills = skillsRef.current;
    const mouse = mouseRef.current;
    const currentTime = Date.now();

    skills.forEach((skill, i) => {
      // Very slow constant oscillations
      const time = currentTime * 0.0005; // Very slow time scale
      const oscillationX = Math.sin(time + i * 0.3) * 0.15; // Very small amplitude
      const oscillationY = Math.cos(time + i * 0.4) * 0.12;
      
      skill.vx += oscillationX * 0.001;
      skill.vy += oscillationY * 0.001;

      // Mouse proximity detection for expansion (no movement)
      if (mouse.isActive) {
        const dx = mouse.x - skill.x;
        const dy = mouse.y - skill.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const proximityRadius = 120; // Radius for expansion effect
        
        if (distance < proximityRadius) {
          // Expansion based on proximity (closer = bigger)
          const proximityFactor = (proximityRadius - distance) / proximityRadius;
          skill.energy = Math.max(skill.energy, proximityFactor * 1.5);
        } else {
          // Gradual shrinking when not in proximity
          skill.energy *= 0.95;
        }
      } else {
        // Shrink when mouse not active
        skill.energy *= 0.95;
      }

      // Gentle return force to original position
      const returnDx = skill.originalX - skill.x;
      const returnDy = skill.originalY - skill.y;
      const returnDistance = Math.sqrt(returnDx * returnDx + returnDy * returnDy);
      
      if (returnDistance > 2) {
        skill.vx += returnDx * 0.0005; // Very gentle return
        skill.vy += returnDy * 0.0005;
      }

      // Collision avoidance with other skills
      for (let j = 0; j < skills.length; j++) {
        if (i === j) continue;
        
        const other = skills[j];
        const dx = skill.x - other.x;
        const dy = skill.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = skill.radius + other.radius + 25; // Increased padding

        if (distance < minDistance && distance > 0) {
          // Stronger separation force to prevent overlap
          const overlap = minDistance - distance;
          const force = overlap / minDistance;
          const angle = Math.atan2(dy, dx);
          
          const separationForce = force * 0.15;
          skill.vx += Math.cos(angle) * separationForce;
          skill.vy += Math.sin(angle) * separationForce;
          
          // Immediate position correction for severe overlaps
          if (overlap > 10) {
            const pushDistance = overlap * 0.3;
            skill.x += Math.cos(angle) * pushDistance;
            skill.y += Math.sin(angle) * pushDistance;
          }
        }
      }

      // Strong velocity damping for gentle oscillations
      skill.vx *= 0.98; // Strong damping for slow movement
      skill.vy *= 0.98;

      // Very low speed limit for gentle oscillations
      const maxVelocity = 0.3; // Much slower
      const speed = Math.sqrt(skill.vx * skill.vx + skill.vy * skill.vy);
      if (speed > maxVelocity) {
        skill.vx = (skill.vx / speed) * maxVelocity;
        skill.vy = (skill.vy / speed) * maxVelocity;
      }

      // Update position
      skill.x += skill.vx;
      skill.y += skill.vy;

      // Soft boundary repulsion
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

      // Update trail for very slow movement
      if (speed > 0.05) { // Lower threshold
        skill.trail.unshift({ x: skill.x, y: skill.y, alpha: 1 });
      }
      if (skill.trail.length > 8) { // Even shorter trails
        skill.trail.pop();
      }
      
      // Fade trail
      skill.trail.forEach((point, index) => {
        point.alpha = 1 - (index / skill.trail.length);
      });

      // Dynamic radius based on proximity energy
      skill.radius = skill.baseRadius + skill.energy * 8; // Expansion effect

      // Keep original color (no dynamic color changes)
      skill.color = skill.originalColor;
    });
  }, [dimensions]);

  // Render professional visualization
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas (transparent background to show page behind)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw proximity indicator
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

    // Draw professional skill balloons
    skillsRef.current.forEach((skill) => {
      ctx.save();
      
      // Get category colors
      const colors = categoryColors[skill.category];
      
      // Professional shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10 + skill.energy * 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      
      // Main balloon circle
      ctx.beginPath();
      ctx.arc(skill.x, skill.y, skill.radius, 0, Math.PI * 2);
      
      // Professional gradient
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
      
      // Subtle border
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Inner highlight for depth
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

      // Professional text rendering
      ctx.save();
      
      const fontSize = Math.max(11, skill.radius * 0.35);
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Text with subtle shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(skill.name, skill.x, skill.y);
      
      ctx.restore();
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updatePhysics();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updatePhysics, render]);

  // Handle mouse movement
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

  // Handle window resize
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

  // Initialize and start animation
  useEffect(() => {
    initializeSkills();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeSkills, animate]);

  // Reset positions when double-clicking
  const handleDoubleClick = useCallback(() => {
    initializeSkills();
  }, [initializeSkills]);

  return (
    <section id="skills" className={`py-20 px-6 max-w-7xl mx-auto ${className}`}>
      <h2 className="text-5xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Technical Expertise
      </h2>      

      {/* Interactive Canvas */}
      <div 
        ref={containerRef}
        className="relative rounded-2xl border border-primary/10 overflow-hidden"
        style={{ height: dimensions.height, backgroundColor: 'transparent' }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={handleDoubleClick}
          style={{ backgroundColor: 'transparent' }}
        />
        
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .relative.rounded-2xl {
            display: none;
          }
        }
        @media (min-width: 769px) {
          .md\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
