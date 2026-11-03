# Anargya ITS

Official website showcase for the Anargya ITS Formula EV research team. The site introduces the team and its GIIAS 2027 plans, presents the Mark 06 electric race car in an interactive 3D viewer, and shares team stories and merchandise.

**Live project repository:** [github.com/LitSamm/Mini-Project](https://github.com/LitSamm/Mini-Project)

## Features

- Responsive homepage with event highlights and team introduction.
- Interactive Mark 06 viewer with 360-degree rotation, zoom, auto-rotate, and reset controls.
- Team updates for upcoming, ongoing, and completed activities.
- Filterable merchandise catalogue, inventory-aware cart, and Midtrans Snap payments.
- Supabase-authenticated admin with Prisma-powered product and order management.
- Event and team-story pages.
- Scroll-based reveals and subtle motion that respect reduced-motion preferences.
- Mobile navigation and layouts.

## Pages

| Route | Description |
| --- | --- |
| `/` | Team introduction, GIIAS 2027, Mark 06, team updates, merchandise preview, and track record. |
| `/merchandise` | Live merchandise catalogue, stock and pricing, cart, and Midtrans Snap checkout. |
| `/merchandise/payment-result` | Customer return page after leaving Midtrans; it does not determine payment status. |
| `/api/webhooks/midtrans` | Signed Midtrans payment and expired-order notifications. |
| `/admin/login` | Protected admin sign-in for the merchandise store. |
| `/admin` | Admin dashboard for products, inventory, and order fulfillment. |
| `/journey/giias-2027` | Information about the team's upcoming GIIAS 2027 journey. |
| `/journey/inside-the-workshop` | A look at the people and work behind the car. |
| `/journey/electric-by-design` | The team's electric motorsport and engineering story. |

## Tech stack

- [Next.js](https://nextjs.org/) 16 with the App Router
- [React](https://react.dev/) 19 and TypeScript
- [Three.js](https://threejs.org/) for the Mark 06 3D viewer
- [Supabase](https://supabase.com/) for the store database and admin authentication
- [Prisma ORM](https://www.prisma.io/orm) for server-side PostgreSQL queries
- CSS and [Tailwind CSS](https://tailwindcss.com/)

## Requirements

- Node.js 20.9 or later
- npm

## Run locally

1. Clone the repository:

   ```bash
   git clone https://github.com/LitSamm/Mini-Project.git
   cd Mini-Project
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build locally. Run `npm run build` first. |

Journey content is maintained in `src/lib/journeys.ts`; the merchandise catalogue is seeded by `supabase/schema.sql` and managed in the admin dashboard. The merchandise stock and prices follow the latest RAB: Workshirt (40, Rp155.000), Blindpack keychain (100, Rp15.000), Carabiner car (10, Rp60.000), Sticker (110, Rp10.000), and Enamel pin (55, Rp25.000).

The Mark 06 viewer loads its FBX model and textures from `public/models/mark-6/`. It is loaded when the viewer approaches the viewport to reduce the initial page workload. Drag the model to rotate, scroll to zoom, or use the on-screen controls to auto-rotate and reset the view.

## Project structure

```text
src/
  app/                 App Router pages, Midtrans webhook, and global styles
  components/          Site sections, navigation, footer, and 3D viewer
  lib/                 Journey, product, and Supabase helpers
  proxy.ts             Refreshes sessions and protects admin routes
supabase/
  schema.sql           Store tables, order RPC, RLS, and initial products
public/
  images/              Site photography, logos, and merchandise images
  models/mark-6/       Mark 06 FBX model and textures
```

## Merchandise store and admin

Supabase provides PostgreSQL and admin authentication. Prisma runs trusted server-side catalogue and admin queries. The checkout and stock reservation remain in the Supabase `create_order` database function so order creation stays atomic. Customers pay through Midtrans Snap; verified Midtrans notifications update payment status, and expired orders release reserved stock. Merchandise checkout assumes free shipping or pickup.

1. For a new Supabase project only, run [`supabase/schema.sql`](./supabase/schema.sql) in **SQL Editor**. It creates the products/orders tables, RLS policies, checkout/status functions, and seeds the merchandise catalogue. Do not rerun it on a populated store: its seed updates product stock.
2. In Supabase **Project Settings → API**, copy the project URL and anon key. Keep the service-role key server-only.
3. In **Project Settings → Database → Connect**, copy the Transaction Pooler URI for `DATABASE_URL` (port `6543`, adding `?pgbouncer=true`) and the direct database URI for `DIRECT_URL`. If direct connections are unavailable on your network, use the Session Pooler URI on port `5432` for `DIRECT_URL`. Replace the placeholders in each URI and URL-encode special characters in the database password.
4. Copy `.env.example` to `.env` and fill in the Supabase URL, anon key, server-only service-role key, `SUPABASE_ADMIN_EMAILS`, `DATABASE_URL`, and `DIRECT_URL`. [Register a Midtrans account](https://dashboard.midtrans.com/register), switch MAP to **Sandbox**, and copy its sandbox Server Key from **Settings → Access Keys**. Set `MIDTRANS_ENVIRONMENT=sandbox`, copy that key to `MIDTRANS_SERVER_KEY`, set `NEXT_PUBLIC_SITE_URL` to your site, and configure `MIDTRANS_NOTIFICATION_URL` as a publicly reachable HTTPS `/api/webhooks/midtrans` URL. In MAP, set **Settings → Configuration → Payment Notification URL** to the same webhook URL. For local webhook testing, use an HTTPS tunnel and set the tunnel URL in MAP. Never expose any server credential with a `NEXT_PUBLIC_` prefix or commit `.env`.
5. Install dependencies and generate/check Prisma Client:

   ```bash
   npm install
   npm run db:generate
   npm run db:validate
   ```

6. Create the administrator account under Supabase **Authentication → Users**. Add the account email to `SUPABASE_ADMIN_EMAILS`, then start the app with `npm run dev` and sign in at `/admin/login`.
7. For an existing store, run the needed files from `supabase/migrations/` in Supabase SQL Editor. `20261103_midtrans_checkout.sql` adds payment references and the atomic payment-event handler. `20261103_update_merchandise_rab.sql` updates the five RAB products and intentionally resets available stock to the full RAB quantities; run it only after deploying the matching product images. Manage products, sizes, stock, and orders at `/admin`. Tee sizes are S, M, L, and XL. Orders start as `Awaiting Payment`; verified Midtrans notifications mark successful payments as `Paid`, and terminal unsuccessful payments restore reserved stock.

8. Complete a sandbox payment using the [Midtrans Sandbox Simulator](https://docs.midtrans.com/docs/testing-payment-on-sandbox) and verify both the customer return page and Midtrans notification. Switch `MIDTRANS_ENVIRONMENT` to `production` only after the merchant is approved and production credentials are configured. Never share or commit Midtrans credentials.

For Vercel, add the same environment variables under **Project Settings → Environment Variables** for each deployment target you use, then redeploy. Checkout requires `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_ENVIRONMENT`, `MIDTRANS_NOTIFICATION_URL`, and `NEXT_PUBLIC_SITE_URL`, and the SQL in `supabase/schema.sql` must have been run in that Supabase project. The merchandise catalogue and admin dashboard additionally require `DATABASE_URL`; Supabase authentication and admin sign-in also require `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Prisma models are in `prisma/schema.prisma`; `npm run db:studio` opens a local database browser. The SQL file remains the source of truth for schema setup, seed data, RLS, and database functions. Keep the Prisma schema in sync when changing tables, and do not run `prisma db push` or `prisma migrate` against this project: those commands do not manage the SQL functions and policies in `supabase/schema.sql`.

The protected `/admin` dashboard verifies the signed-in Supabase user against the admin email allowlist before running privileged Prisma queries or order actions. Database URLs, the service-role key, and customer/order data stay on the server. Prices must be between IDR 1 and IDR 1,000,000,000,000; stock must be between 0 and 1,000,000, or left blank for unlimited inventory.

The GIIAS 2027 page describes the event context and Anargya's planned showcase. Dates, venue, booth, and participation are explicitly marked as pending until confirmed; update `src/lib/journeys.ts` with verified details before publishing them.

## Author

**LitSamm**

GitHub: [@LitSamm](https://github.com/LitSamm)
