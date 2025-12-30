# Meddot | Medical Education Platform

**Meddot** is a focused medical education platform designed to help students share notes, study smarter with focus tools, and access curated medical content.

## Project Overview

This codebase represents the **MVP (Minimum Viable Product)** of the Meddot platform. It includes:
- **Student Dashboard**: 3D interactive cards and smooth navigation.
- **Notes Viewer**: Professional reading interface with zoom/bookmark capabilities.
- **Focus Mode**: A built-in Pomodoro timer (25/5 cycle) for deep work.
- **Admin Dashboard**: Strictly private interface for managing content (upload/delete).
- **Authentication**: Role-based access control (Student vs. Admin).

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: CSS Modules, Custom Variables (Medical/Pastel Theme)
- **State**: React Context + Hooks
- **Icons**: Inline SVGs (No external icon libraries)

## Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone <repository_url>
cd meddot
npm install
```

### 2. Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow (Mock)
The app uses a mock authentication system for demonstration purposes.

| Role    | Email                | Password | Permissions |
|---------|----------------------|----------|-------------|
| Student | student@meddot.com   | password | Access /dashboard, /notes, /focus |
| Admin   | admin@meddot.com     | admin    | Access /admin (Strictly Private) |

*Note: Auth state is persisted in `localStorage`.*

## Directory Structure
- `/app`: Next.js App Router pages and layouts.
  - `/admin`: Admin dashboard routes.
  - `/dashboard`: Student dashboard routes.
  - `/focus`: Focus mode route.
  - `/notes`: Dynamic notes routes.
  - `/components`: Reusable UI components.
  - `/context`: Global state providers (AuthContext).
