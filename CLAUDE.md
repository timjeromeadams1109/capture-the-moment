# Capture the Moment — Claude Code Context

## What This Is
A photography/moment capture platform for preserving and sharing special moments, with SMS/email notifications via Twilio and Resend.

## Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Database**: Supabase (SSR + client)
- **Styling**: Tailwind CSS v4, Radix UI, CVA, Lucide icons
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Twilio (SMS), Resend (email)
- **Monitoring**: Sentry (client, server, edge)
- **Hosting**: Vercel

## Rules for This Repo
- Run `npm install` before making changes
- Zod validation on all API routes — no raw request body destructuring
- Secrets in env vars only (Twilio, Resend, Supabase keys)
- Supabase migrations in `supabase/` directory
- Never deploy without Tim's approval

## Maven Context
This is a Studio Tim product managed by the Maven agent system.
Operator: Tim Adams | Studio Tim
