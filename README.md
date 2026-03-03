# Capture the Moment

Event photography platform connecting guests with professional photographers. Real-time photo sharing, curated galleries, and instant delivery via SMS/email.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 + Radix UI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Communications | Twilio SMS + Resend Email |
| Validation | Zod + React Hook Form |


## Features

- **Event Creation** — Create photography events with custom settings and guest lists
- **Real-Time Gallery** — Live photo feed with instant uploads from photographers
- **Guest Notifications** — SMS and email notifications via Twilio and Resend
- **Photo Curation** — Select, organize, and deliver final photo collections
- **Responsive Design** — Mobile-first UI for guests and photographers alike


## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

```bash
git clone https://github.com/timjeromeadams1109/capture-the-moment.git
cd capture-the-moment
npm install
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio sender phone number |
| `RESEND_API_KEY` | Resend email API key |

### Run

```bash
npm run dev
```


## Project Structure

```
capture-the-moment/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   │   └── ui/        # Radix-based UI primitives
│   └── lib/           # Utilities, Supabase client, helpers
├── supabase/          # Database migrations
├── public/            # Static assets
└── scripts/           # Build & generation scripts
```


## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | next dev |
| `npm run build` | next build |
| `npm run start` | next start |
| `npm run lint` | eslint |


## Deployment

Deployed on **Vercel** with automatic deploys from the `main` branch.

1. Push to `main` triggers Vercel build
2. Environment variables configured in Vercel dashboard
3. Supabase handles database and auth


## Links

- [GitHub](https://github.com/timjeromeadams1109/capture-the-moment)
- [Vercel Dashboard](https://vercel.com/tim-adams-projects-6c46d12d/capture-the-moment)
- [Supabase Dashboard](https://supabase.com/dashboard/project/ifwnsvbocyvxjlyplyan)


## License

MIT

---
*Auto-generated from project.meta.json — do not edit manually.*
