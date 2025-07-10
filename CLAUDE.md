# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo for the "Carlão" service platform, structured with:
- **API** (NestJS): Backend service at `apps/api/`
- **Web** (React + Vite): Frontend application at `apps/web/`
- **UI Package** (@satur/ui): Shared component library at `packages/ui/`

## Development Commands

### General Commands (run from root)
```bash
# Install dependencies
pnpm install

# Start all apps in development mode
pnpm dev

# Start specific apps
pnpm api:dev    # API only
pnpm web:dev    # Frontend only

# Build all apps
pnpm build

# Run linting on all apps
pnpm lint

# Run tests on all apps
pnpm test

# Type check all apps
pnpm type-check

# Format code
pnpm format
```

### Database Commands (run from apps/api)
```bash
cd apps/api

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# Deploy migrations (production)
pnpm prisma:deploy

# Open Prisma Studio
pnpm prisma:studio

# Seed the database
pnpm prisma:seed

# Reset database
pnpm db:reset
```

### API Development Commands
```bash
cd apps/api

# Development mode with watch
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start:prod

# Run tests
pnpm test
pnpm test:watch
pnpm test:e2e

# Docker commands
pnpm docker:up
pnpm docker:down
```

## Architecture Overview

### Database Schema (PostgreSQL + Prisma)
- **Users**: Multi-role system (AGENCY, SUPPLIER, ADMIN, CUSTOMER)
- **Services**: Location-based services with user assignments
- **Products**: Service-specific products with pricing
- **Orders**: Customer orders for products/services
- **Payments**: Payment tracking with status management
- **Locations**: City/state-based service areas

### API Architecture (NestJS)
- **Modular structure** with dedicated modules for each domain
- **JWT Authentication** with role-based access control
- **Zod validation** for request/response schemas
- **Swagger documentation** available at `/api` endpoint
- **Soft deletes** implemented across entities
- **API runs on port 3001** (configurable via PORT env var)

### Frontend Architecture (React + Vite)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for server state
- **React Hook Form** + Zod for form validation
- **React Router** for navigation
- **Shared UI components** from @satur/ui package

### Shared UI Package
- **Radix UI** primitives for accessibility
- **Tailwind CSS** styling with class-variance-authority
- **Component library** with Button, Input, Card, Dialog, etc.
- **TypeScript** with proper type definitions

## Key Technical Details

### Environment Setup
- **Node.js 18+** required
- **pnpm** as package manager
- **PostgreSQL** database
- **Environment variables** configured via .env files

### Development Workflow
1. Backend API serves at `http://localhost:3001`
2. Frontend serves at `http://localhost:5173`
3. Swagger docs available at `http://localhost:3001/api`
4. Database operations use Prisma ORM

### Authentication & Authorization
- JWT tokens stored in localStorage
- Role-based access control with guards
- Supplier approval workflow for onboarding
- Current user decorator for request context

### Business Logic
- Service platform connecting customers with service providers
- Location-based service availability
- Product/service ordering with payment tracking
- Commission and payment processing workflows