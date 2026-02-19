# Personal Website V3

## Overview
A personal portfolio website for Brian Wendot, built with Next.js 14, React 18, TypeScript, and plain CSS. Features a distinctive "developer console meets modern design" aesthetic with typewriter code hero, floating pill navigation, code editor About section, interactive physics-based skills canvas, terminal-styled contact form, and particle background.

## Project Architecture
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Custom CSS variables in `src/styles/globals.css` + `src/styles/index.css` (no Tailwind)
- **Active Directory**: `personal-website-v3/` (redesigned version)
- **Previous Version**: `personal-website-v2/` (original design, preserved)
- **Layout**: `src/app/layout.tsx` + `src/app/page.tsx`
- **Components**: `src/components/` (Navigation, Hero, About, Skills, Experience, Projects, Contact, Footer, AnimatedBackground, ProjectCard, ContactForm)
- **Hooks**: `src/hooks/useReveal.ts` (IntersectionObserver-based scroll reveal)
- **Data**: `src/services/FetchData.ts` (skills, projects, social links, experience data)
- **Public Assets**: `public/` (images, resume PDF, favicons)

## Recent Changes
- 2026-02-19: Moved redesigned code to `personal-website-v3/`, restored `personal-website-v2/` to its original state
- 2026-02-19: Complete visual redesign — "Developer Console" theme (in v3)
  - Hero: Typewriter code effect that types a developer profile object, then reveals tagline
  - Navigation: Floating pill nav with active section tracking via IntersectionObserver
  - About: Code editor window with tab bar, line numbers, and syntax-highlighted TypeScript
  - Projects: Bento grid layout with featured first project spanning full width
  - Contact: Terminal-styled form with `$ ` prompt labels and monospace inputs
  - Experience: Enhanced timeline with glowing nodes and `>` list markers
  - Global: Scroll-reveal animations (useReveal hook), noise texture overlay, animated gradient borders, glassmorphism cards
  - Accessibility: prefers-reduced-motion support
  - Color palette: cyan (#00f5ff), coral (#ff6b6b), teal (#4ecdc4), indigo (#6366f1)
- 2026-02-18: Imported from GitHub, configured for Replit

## Configuration
- Dev server runs on `0.0.0.0:5000` from `personal-website-v3/`
- `next.config.mjs` configured for Replit (allowedDevOrigins, unoptimized images)
- Deployment: autoscale with `next build` + `next start`

## User Preferences
- Dark theme with developer-focused aesthetic
- Animated particle background with interactive canvas elements
- Single-page layout with smooth scroll navigation
- Prefers unique, attention-grabbing design over generic templates
