# Personal Website V2

## Overview
A personal portfolio website for Brian Wendot, built with Next.js 14, React 18, TypeScript, and Tailwind CSS. Features animated background, navigation, hero section, about, skills, experience timeline, projects, and contact sections.

## Project Architecture
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Custom CSS variables in `src/styles/globals.css` + `src/styles/index.css`
- **Directory**: All source code lives in `personal-website-v2/`
- **Layout**: `src/app/layout.tsx` + `src/app/page.tsx`
- **Components**: `src/components/` (Navigation, Hero, About, Skills, Experience, Projects, Contact, Footer, AnimatedBackground, ProjectCard, ContactForm, SkillCategory)
- **Data**: `src/services/FetchData.ts` (skills, projects, social links, experience data)
- **Public Assets**: `public/` (images, resume PDF, favicons)
- **UI Components**: `src/components/ui/` (Badge, Button, Card, Input, Spinner, Textarea)

## Recent Changes
- 2026-02-19: Fixed bugs and improved presentation
  - Fixed cross-origin dev config (allowedDevOrigins with wildcard domains)
  - Cleaned up ~420 lines of dead commented-out code in Skills.tsx
  - Fixed wrong project image label and added generated project images
  - Added hamburger menu for mobile navigation
  - Made contact form functional with mailto handler
  - Added SVG icons to contact methods
  - Fixed footer year to be dynamic
  - Added Resume download button in hero section
  - Improved About section with stats and profile links
  - Added Experience timeline section with career data
  - Added skills legend with color-coded categories
- 2026-02-18: Imported from GitHub, configured for Replit

## Configuration
- Dev server runs on `0.0.0.0:5000`
- `next.config.mjs` configured for Replit (allowedDevOrigins, unoptimized images)
- Deployment: autoscale with `next build` + `next start`

## User Preferences
- Dark theme with cyan (#00f5ff), coral (#ff6b6b), and teal (#4ecdc4) accents
- Animated particle background with interactive canvas elements
- Single-page layout with smooth scroll navigation
