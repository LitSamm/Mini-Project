# Anargya ITS

The official website of the Anargya ITS Formula EV Team. This project introduces the team and its GIIAS 2027 plans, showcases the Mark 06 electric race car in an interactive 3D viewer, and provides a merchandise catalogue and online ordering flow.

**Repository:** [github.com/LitSamm/Mini-Project](https://github.com/LitSamm/Mini-Project)

## Features

- Responsive homepage featuring the team, event highlights, merchandise, and track record.
- Interactive Mark 06 3D viewer with rotation, zoom, auto-rotate, and reset controls.
- Team stories and the journey toward GIIAS 2027.
- Merchandise catalogue with availability filters, product variants, cart, and Midtrans Snap checkout.
- Atomic order creation and stock reservation through a Supabase PostgreSQL function.
- Admin dashboard for managing products, inventory, and order status.
- Midtrans webhook that verifies notification signatures before updating order status.
- Responsive navigation and motion effects that respect reduced-motion preferences.

## Pages and endpoints

| Route | Purpose |
| --- | --- |
| `/` | Team introduction, GIIAS 2027, Mark 06 viewer, team updates, merchandise, and track record. |
| `/merchandise` | Catalogue, cart, and checkout. |
| `/merchandise/payment-result` | Customer return page from Midtrans. This page does not prove that a payment succeeded. |
| `/api/webhooks/midtrans` | Verified Midtrans payment notification endpoint. |
| `/admin/login` | Supabase admin sign-in. |
| `/admin` | Product, inventory, and order management. |
| `/journey/giias-2027` | Information about the team's plans for GIIAS 2027. |
| `/journey/inside-the-workshop` | Stories about the team and workshop activities. |
| `/journey/electric-by-design` | The team's electric motorsport and engineering story. |

## Technology

- Next.js 16 App Router, React 19, and TypeScript.
- Three.js for the 3D car viewer.
- Supabase PostgreSQL and Supabase Auth.
- Prisma for trusted server-side database queries.
- Midtrans Snap for checkout.
- CSS and Tailwind CSS.

## Requirements

- Node.js 20.9 or later.
- npm.
- A Supabase project and Midtrans account are only required for the store, admin dashboard, and payments.

## Run the website

```bash
git clone https://github.com/LitSamm/Mini-Project.git
cd Mini-Project
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The homepage and catalogue can run without a store connection; when `DATABASE_URL` is not configured, the catalogue uses local initial product data. Checkout and the admin dashboard require the services described below.

### npm scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create a production build. |
| `npm run start` | Run the production build. Run `npm run build` first. |
| `npm run db:generate` | Generate Prisma Client. |
| `npm run db:validate` | Validate the Prisma schema and its configured datasource. |
| `npm run db:studio` | Open Prisma Studio. |

## Environment configuration

Copy `.env.example` to `.env` and fill in values for your own project. Never commit `.env`, share screenshots that expose its values, or disclose secrets to others.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase key used for browser/server authentication. Continue to enforce access policies and RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Administrative key for server-side store operations. **Secret; never use the `NEXT_PUBLIC_` prefix.** |
| `SUPABASE_ADMIN_EMAILS` | Comma-separated allowlist of admin email addresses. |
| `DATABASE_URL` | PostgreSQL URL for Prisma queries, usually the Supabase Transaction Pooler. |
| `DIRECT_URL` | Direct database URL for Prisma operations that require a non-pooled connection. |
| `NEXT_PUBLIC_SITE_URL` | Base website URL, such as `http://localhost:3000` during development. Used to build Midtrans callback URLs. |
| `MIDTRANS_ENVIRONMENT` | `sandbox` for testing or `production` for real transactions. |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key for the matching environment. **Secret.** |
| `MIDTRANS_NOTIFICATION_URL` | Public HTTPS URL pointing exactly to `/api/webhooks/midtrans`. |

To obtain `DATABASE_URL` and `DIRECT_URL`, open **Supabase → Project Settings → Database → Connect**. The Transaction Pooler generally uses port `6543` with the `?pgbouncer=true` parameter; a direct connection or Session Pooler on port `5432` can be used as `DIRECT_URL`. URL-encode special characters in the database password.

Do not mix Sandbox and Production credentials. `MIDTRANS_ENVIRONMENT` must match the Server Key in use.

## Set up the database and store

### New Supabase project

1. Create a Supabase project and fill in the Supabase and database connection variables in `.env`.
2. Run `supabase/schema.sql` once through **Supabase → SQL Editor**. It creates the tables, RLS policies, database functions, and initial catalogue data.
3. Generate and validate Prisma Client:

   ```bash
   npm install
   npm run db:generate
   npm run db:validate
   ```

4. Create an admin account through **Supabase → Authentication → Users**.
5. Add that account's email to `SUPABASE_ADMIN_EMAILS`, then sign in at `/admin/login`.

> **Important:** Do not rerun `supabase/schema.sql` on a store that already contains data. Its seed section can update product data and inventory. For an existing store, run only the migrations that are required.

### Existing store project

Run the relevant migrations from `supabase/migrations/` through the SQL Editor:

- `20261103_midtrans_checkout.sql` adds payment references, order validation/creation, and the payment-event handler for the Midtrans checkout flow.
- `20261103_update_merchandise_rab.sql` updates the catalogue to match the RAB list and resets inventory to the RAB quantities. Run it only if the catalogue update and stock reset are intended.

SQL is the source of truth for database functions and policies. `prisma/schema.prisma` is used for application queries; do not run `prisma db push` or `prisma migrate` against this project, because those commands do not manage the functions and policies created through SQL.

## Set up Midtrans

1. Create or use a Midtrans account and select the **Sandbox** environment for testing.
2. Get the Sandbox Server Key from **Settings → Access Keys** and store it in `MIDTRANS_SERVER_KEY`.
3. Set `MIDTRANS_ENVIRONMENT=sandbox`.
4. Set `NEXT_PUBLIC_SITE_URL` to the URL of the website that will create the checkout.
5. Set `MIDTRANS_NOTIFICATION_URL` to a public HTTPS URL ending exactly in `/api/webhooks/midtrans`.
6. In Midtrans, set **Settings → Configuration → Payment Notification URL** to the same webhook URL.
7. For local testing, use an HTTPS tunnel that Midtrans can reach for webhooks. Midtrans cannot send notifications to `localhost` directly.
8. Run the website, create an order, and complete the transaction with a Sandbox simulation method supported by Midtrans.
9. After the merchant is approved for real transactions, configure matching Production credentials and set `MIDTRANS_ENVIRONMENT=production`.

### Checkout flow

1. The browser sends the contact details and cart to a Server Action.
2. The application validates the data. Supabase's `create_order` function checks prices, variants, availability, and inventory, then atomically creates the order and reserves stock.
3. The server creates a Midtrans Snap session using the order's payment reference.
4. The browser is redirected to Snap's `redirect_url`. Available payment methods depend on the Midtrans account configuration and availability; QRIS can be selected if it is available for that session.
5. Midtrans sends a notification to the webhook. The application verifies the signature and transaction amount before updating the order.
6. A successful payment updates the order to `Paid`. Terminal unsuccessful statuses, such as `expire` or `cancel`, cancel the order and restore the reserved stock.
7. `/merchandise/payment-result` is only a customer return page. The final status must be verified through a Midtrans notification or dashboard, not from the browser redirect.

## Products and inventory

The initial catalogue contains:

| Product | Initial stock | Price |
| --- | ---: | ---: |
| Workshirt | 40 | Rp155,000 |
| Blindpack keychain | 100 | Rp15,000 |
| Carabiner car | 10 | Rp60,000 |
| Sticker | 110 | Rp10,000 |
| Enamel pin | 55 | Rp25,000 |

When `DATABASE_URL` is configured, product data from the Supabase database is the source of truth for the displayed catalogue. Admins can manage prices, status, inventory, and variants through `/admin`. An empty stock value means unlimited inventory; a stock value of `0` means sold out. Each checkout is limited to 20 units per product. Manual data changes must follow the database constraints and reflect the actual inventory.

Shipping costs are not calculated automatically at checkout. Delivery or pickup arrangements and any related fees are confirmed with the customer separately.

## Admin and security

- Access to `/admin` is restricted to Supabase Auth users whose email is listed in `SUPABASE_ADMIN_EMAILS`.
- Admin accounts are created by an operator through Supabase Authentication; the application does not provide public admin registration.
- Privileged operations use the Supabase service role on the server. Never send this key to the browser.
- Store tables use Row Level Security. Checkout and payment-event functions are granted only to `service_role`.
- The webhook verifies the Midtrans signature, order-reference format, and amount match before changing an order status.
- Use synthetic customer data for testing. Do not store secrets or unnecessary customer information in logs or debug files.

## Troubleshooting

### Checkout or catalogue buttons are disabled

- The add-to-cart button is enabled only for available products and when any required variant has been selected.
- Checkout requires Supabase service configuration and valid Midtrans configuration.
- Make sure environment variables are set for the correct environment, then restart the local server or redeploy.

### Snap displays “Your transaction has expired”

- Make sure you are opening a new transaction, not an old Snap URL.
- Check the transaction status and expiration in Midtrans immediately after creating checkout.
- Compare the expiration requested by the application with the actual expiration returned by Midtrans. If they differ, record the transaction time and reference, then ask Midtrans to investigate the Sandbox/account configuration.
- A successful Snap creation response is not the same as a successful payment.

### QRIS does not appear

- Make sure the transaction has not expired and open a new Snap session.
- Check whether QRIS is listed as active for that session/environment in Midtrans.
- Confirm that the payment method is available for the account and environment in use. Sandbox and Production may have different availability/configuration.
- If the method is available but the QR code is not generated, use the transaction details from the Midtrans dashboard when requesting provider support.

### Order status does not change after payment

- Make sure the Midtrans **Payment Notification URL** matches `MIDTRANS_NOTIFICATION_URL` and is publicly reachable over HTTPS.
- Check deployment logs for webhook requests and processing errors.
- Confirm that the order uses the same Server Key and environment as the notification.
- The customer redirect does not update the order; only a verified webhook does.

### Admin cannot sign in or data is missing

- Make sure the account exists in Supabase Auth and its email is listed exactly in `SUPABASE_ADMIN_EMAILS`.
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, and whether the correct schema/migrations have been applied.
- The admin dashboard requires a Prisma database connection; checkout also requires the Supabase service role and database functions.

## Deployment

For Vercel, configure environment variables in **Project Settings → Environment Variables** for each deployment target, then redeploy.

- Checkout requires `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_ENVIRONMENT`, `MIDTRANS_NOTIFICATION_URL`, and `NEXT_PUBLIC_SITE_URL`.
- The dynamic catalogue and admin dashboard require `DATABASE_URL`.
- Admin sign-in also requires `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_ADMIN_EMAILS`.
- Apply the SQL schema or migrations to the same Supabase project used by the deployment's URL and keys.
- For a Production webhook, use the public HTTPS website URL. Do not point Production notifications at localhost or a temporary development tunnel.

## Project structure

```text
src/
  app/                 App Router pages, Server Actions, webhook, and global CSS
  components/          UI components, navigation, and 3D viewer
  lib/                 Journey data, products, Midtrans, Prisma, and Supabase
  proxy.ts             Admin route protection and Supabase session refresh
prisma/
  schema.prisma        Prisma models mapped to Supabase tables
supabase/
  schema.sql           New-project schema, database functions, RLS, and catalogue seed
  migrations/          Incremental changes for existing Supabase projects
public/
  images/              Photography, logos, and merchandise artwork
  models/mark-6/       Mark 06 FBX model and textures
```

The Mark 06 viewer loads its FBX file and textures from `public/models/mark-6/` when it approaches the viewport to reduce initial page workload. Drag to rotate, scroll to zoom, or use the on-screen controls to auto-rotate and reset the view.

Team journey content is maintained in `src/lib/journeys.ts`. Keep unconfirmed GIIAS 2027 information clearly identified as a plan; publish dates, venue, booth, and participation only after they have been verified.

## Author

**LitSamm** · [@LitSamm](https://github.com/LitSamm)
