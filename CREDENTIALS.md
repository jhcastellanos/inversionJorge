# 🔐 Credentials & Setup Info

## Admin Access
- **URL**: http://localhost:3000/admin/login
- **Username**: `admin`
- **Password**: `admin123`

## Database
- **Connection String**: `postgresql://neondb_owner:npg_J8VQp6MkdlDi@ep-holy-rain-ahk105a2-pooler.c-3.us-east-1.aws.neon.tech/neondb`
- **Tables**: `courses`, `customers`, `purchases`, `admin_user`

## Stripe (Pendiente Configuración)
Para activar los pagos reales:
1. Ve a https://dashboard.stripe.com/test/apikeys
2. Copia las claves de prueba
3. Actualiza tu `.env`:
```
STRIPE_SECRET_KEY=sk_test_tu_clave_real
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_real
```

## Webhook Testing Local
```bash
# 1. Instala Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login en Stripe
stripe login

# 3. Forward webhooks a tu local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Dev Server
```bash
npm run dev
# Abre http://localhost:3000
```

## Production Build
```bash
npm run build
npm start
```
