# Dealeeoo Admin & Developer Manual

## Overview
Dealeeoo is a peer-to-peer escrow platform built with Next.js, Tailwind CSS, Supabase, and a modern React UI. This manual covers the codebase structure, all features, and how to use/administer the platform.

---

## Tech Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Shadcn UI
- **Backend/DB:** Supabase (PostgreSQL, Realtime, Auth)
- **State Management:** React hooks, localStorage
- **Other:** React Hook Form, Zod, Lucide Icons

---

## Directory Structure
- `/src/pages/` — Main pages (Index, CreateDeal, DealDetail, Admin, etc.)
- `/src/components/` — UI components (Header, Footer, Modals, Forms, etc.)
- `/src/components/admin/` — Admin dashboard components (DealsSection, PaymentProvidersSettings, etc.)
- `/src/lib/` — API and utility functions
- `/src/integrations/supabase/` — Supabase client and types

---

## Core Features & How to Use

### 1. Deal Creation
- **Page:** `/create-deal`
- **How it works:** Fill out the form (title, description, amount, buyer/seller email). On submit, deal is saved to Supabase. Success modal shows a shareable link.
- **Manual step:** Copy the link and send to buyer/seller.

### 2. Deal Status & Real-time Dashboard
- **Page:** `/deal/[id]`
- **How it works:** Shows deal info and status. Buyer can mark as paid, seller can mark as complete. Status updates in real time.

### 3. Admin Dashboard
- **Page:** `/admin`
- **How it works:** Password-protected. Sidebar navigation for all admin features. See below for each section.

#### a. Deals
- View/search/filter/sort all deals. Update status. View details in modal.

#### b. Users
- Directory of users (search, filter by role/status). Actions: View, Ban, Delete.

#### c. Disputes
- Table of disputes (search, filter by status). Actions: View, Resolve, Escalate.

#### d. Analytics
- Summary cards (total volume, active/completed deals, revenue). Chart placeholder.

#### e. Messaging & Support
- Support tickets table (search, filter by status). Actions: View, Reply, Close.

#### f. Audit Logs
- Table of admin/user actions (search, filter by action). For compliance and security.

#### g. Platform Settings
- Platform fee, payout schedule, maintenance mode (read-only for now). Payment provider management (add API keys, activate providers).

#### h. Payment Providers
- Enter API keys for Stripe, Paystack, Flutterwave, etc. Activate one or more providers. Used for future payment integration.

#### i. AI Settings/Insights
- Placeholders for future AI-powered features (fraud detection, dispute resolution, analytics, etc.).

---

## How to Add Features
- Add new pages/components in `/src/pages/` or `/src/components/`.
- For admin features, add to `/src/components/admin/` and update the sidebar in `admin.tsx`.
- Use Supabase for real-time data and authentication.
- For new payment providers, add to the provider config in `PaymentProvidersSettings.tsx`.

---

## Best Practices
- Keep UI/UX consistent (dark mode, gradients, friendly copy).
- Use Supabase for all data and real-time features.
- Store sensitive settings (API keys, fees) securely.
- Use localStorage for MVP, migrate to Supabase for production.
- Document all new features in this manual.

---

## Contact & Support
For questions or contributions, contact the Dealeeoo team. 