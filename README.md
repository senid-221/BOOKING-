# BOOKING

Service booking platform with customer booking, provider subscriptions, MTN MoMo payments, donations, admin dashboard, provider portal and support tools.

## Production setup

Required environment variables:

```env
DATABASE_URL=
APP_URL=
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
PROVIDER_SESSION_SECRET=
MOMO_BASE_URL=
MOMO_COLLECTION_PRIMARY_KEY=
MOMO_API_USER=
MOMO_API_KEY=
MOMO_TARGET_ENVIRONMENT=
```

Never commit secrets to GitHub.

## Database deployment

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run build
```

For local development:

```bash
npm run dev
```

## Main routes

Public:
- /
- /services
- /providers/list
- /track
- /contact
- /donation

Provider:
- /providers
- /providers/login
- /provider
- /provider/bookings
- /provider/notifications
- /provider/subscription

Admin:
- /admin/login
- /dashboard
- /dashboard/providers
- /dashboard/payments
- /dashboard/services
- /dashboard/bookings
- /dashboard/donations
- /dashboard/notifications
- /dashboard/contacts
- /dashboard/analytics
