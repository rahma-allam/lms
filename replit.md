# Workspace

## Overview

Full-stack LMS (Learning Management System) Platform — a bilingual (Arabic/English) educational management SaaS for academies and teachers.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Wouter routing, TanStack Query, Tailwind CSS v4, next-themes)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Charts**: Recharts

## Artifacts

- `artifacts/lms-platform` — Main LMS frontend app at `/`
- `artifacts/api-server` — Express REST API at `/api`

## Key Features

- **Multi-tenant dashboard** with real-time stats, revenue chart, activity feed
- **Course management** with module/lesson tree (video, PDF, text lessons)
- **Student management** with enrollment tracking, progress bars, payment status
- **Financial ledger** with payment recording, summary stats
- **Marketing Pixel integration** (Meta, Google Tag, TikTok) — fires Purchase and ViewContent events
- **Bilingual** (Arabic/English) with RTL support, localStorage persistence
- **Dark/Light mode** via next-themes

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Database Schema

- `courses` — course catalog with bilingual titles, price, status
- `modules` — course modules with ordering
- `lessons` — lessons (video/pdf/text) with video URL, PDF URL
- `students` — student enrollments with progress and payment status
- `payments` — payment ledger (cash, card, bank_transfer, online)
- `settings` — academy settings including pixel IDs
- `activity` — audit log of enrollments, payments, course creation

## API Routes

- `GET/POST /api/courses` — list and create courses
- `GET/PUT/DELETE /api/courses/:id` — course CRUD
- `GET/POST /api/courses/:courseId/modules` — module management
- `GET/POST /api/modules/:moduleId/lessons` — lesson management
- `PUT/DELETE /api/lessons/:id` — lesson update/delete
- `GET/POST /api/students` — student list and enrollment
- `GET/PUT/DELETE /api/students/:id` — student CRUD
- `GET/POST /api/payments` — payment list and create
- `PUT /api/payments/:id` — update payment
- `GET /api/payments/summary` — financial summary
- `GET/PUT /api/settings` — academy settings
- `GET /api/dashboard/summary` — dashboard stats
- `GET /api/dashboard/recent-activity` — activity feed

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
