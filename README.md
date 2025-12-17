# Parking Reservation System

A Next.js application for reserving parking spaces.

## Features
- User Authentication (Signup/Login) using NextAuth.js
- 8 Parking Spaces available for reservation
- Calendar view to select dates
- Daily reservations (one user per space per day)

## Tech Stack
- **Framework**: Next.js (App Router)
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### 1. Prerequisites
- Node.js installed
- PostgreSQL database running

### 2. Setup Environment
Update the `.env` file with your database credentials:
```dotenv
DATABASE_URL="postgresql://user:password@localhost:5432/parking_db?schema=public"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Migration and Seeding
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment on Vercel

### 1. Database
You will need a hosted PostgreSQL database. You can use:
- **Vercel Postgres** (Recommended for Vercel)
- **Neon**
- **Supabase**

### 2. Environment Variables
In your Vercel project settings, add the following environment variables:
- `DATABASE_URL`: Your production database connection string.
- `NEXTAUTH_SECRET`: A random string for security (you can generate one with `openssl rand -base64 32`).
- `NEXTAUTH_URL`: Your production domain (e.g., `https://your-app.vercel.app`).

### 3. Build Command
Vercel will automatically detect Next.js. The `postinstall` script in `package.json` will ensure Prisma Client is generated during the build.

### 4. Database Migrations
After connecting your database, you may need to run migrations manually once or use a custom build command:
```bash
npx prisma migrate deploy
```
Alternatively, you can add this to your build script in `package.json`: `"build": "prisma generate && prisma migrate deploy && next build"`.
