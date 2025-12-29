# Checklist para Deploy a Producción

## 1. Migración de Base de Datos
Ejecuta este SQL en tu base de datos de producción Neon:

```sql
ALTER TABLE "Memberships" 
  ADD COLUMN IF NOT EXISTS "StartDate" TIMESTAMP WITH TIME ZONE;
```

## 2. Variables de Entorno en Vercel

Configura estas variables en: **Vercel Dashboard → Project → Settings → Environment Variables**

### Base de Datos
```
DATABASE_URL=tu_connection_string_de_produccion_neon
```

### Stripe (IMPORTANTE: Cambiar a modo PRODUCCIÓN)
```
STRIPE_SECRET_KEY=sk_live_xxx (NO usar sk_test_)
STRIPE_PUBLISHABLE_KEY=pk_live_xxx (NO usar pk_test_)
STRIPE_WEBHOOK_SECRET=whsec_xxx (Crear nuevo webhook en Stripe Dashboard)
```

### Next.js
```
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
```

### JWT
```
JWT_SECRET=genera_un_nuevo_secreto_seguro_aleatorio
```

### Discord (Opcional)
```
DISCORD_CLIENT_ID=1452118832423374869
DISCORD_CLIENT_SECRET=2PtMszHjjmVSZLXh8otRXvMP-cc-UYhd
DISCORD_BOT_TOKEN=1452118832423374869
DISCORD_GUILD_ID=1435062376339734631
DISCORD_MEMBER_ROLE_ID=1444872574122201099
```

## 3. Configurar Webhook de Stripe

1. Ir a: https://dashboard.stripe.com/webhooks
2. Crear nuevo endpoint con URL: `https://tu-dominio.vercel.app/api/stripe/webhook`
3. Seleccionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiar el `Signing secret` y agregarlo como `STRIPE_WEBHOOK_SECRET`

## 4. Deploy

### Opción A: Desde terminal
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Opción B: Desde GitHub
1. Hacer push al repositorio
2. Conectar repo en Vercel Dashboard
3. Vercel hará deploy automático

## 5. Post-Deploy

- [ ] Verificar que el sitio carga correctamente
- [ ] Probar crear una membresía desde el admin
- [ ] Probar hacer una compra de prueba en Stripe (modo producción)
- [ ] Verificar que los webhooks lleguen correctamente
- [ ] Revisar logs en Vercel Dashboard

## 6. Seguridad

- [ ] Cambiar JWT_SECRET a un valor seguro
- [ ] Verificar que estás usando claves de Stripe en modo LIVE (no test)
- [ ] Configurar dominio personalizado si aplica
- [ ] Habilitar HTTPS (Vercel lo hace automáticamente)
