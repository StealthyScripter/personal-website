# Personal Website V2

## Overview
A personal portfolio website for Brian Wendot, built with Next.js 14, React 18, TypeScript, and Tailwind CSS. Features animated background, navigation, hero section, about, skills, projects, and contact sections.

## Project Architecture
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom CSS variables in `src/styles/globals.css`
- **Directory**: All source code lives in `personal-website-v2/`
- **Layout**: `src/app/layout.tsx` + `src/app/page.tsx`
- **Components**: `src/components/` (Navigation, Hero, About, Skills, Projects, Contact, Footer, AnimatedBackground, etc.)
- **Services**: `src/services/FetchData.ts`
- **Public Assets**: `public/`

## Recent Changes
- 2026-02-18: Imported from GitHub, configured for Replit (removed static export, set port 5000, allowed dev origins)

## Configuration
- Dev server runs on `0.0.0.0:5000`
- `next.config.mjs` modified for Replit compatibility (removed `output: 'export'`, added `allowedDevOrigins`)
- Deployment: autoscale with `next build` + `next start`
