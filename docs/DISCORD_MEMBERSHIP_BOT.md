# Bot Discord ↔ Stripe ↔ Plataforma

## Objetivo

1. **Membresía Stripe activa** (incluye “cancelar al final del período” mientras sigue vigente):
   - Rol en plataforma: `trader`
   - Rol en Discord: **Trader** (ID en `DISCORD_TRADER_ROLE_ID`)
2. **Membresía cancelada / expirada**:
   - Rol en plataforma: `visitante` (sin acceso al CRM)
   - Quita el rol Trader en Discord (el usuario queda solo con @everyone)

Admin y soporte **no** se modifican automáticamente.

## Variables de entorno

En Vercel y en el proceso del bot (Railway, VPS, etc.):

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Neon (misma BD que la web) |
| `STRIPE_SECRET_KEY` | Consultar suscripciones |
| `DISCORD_BOT_TOKEN` | Bot con permiso **Manage Roles** |
| `DISCORD_GUILD_ID` | ID del servidor |
| `DISCORD_TRADER_ROLE_ID` | ID del rol “Trader” en Discord |
| `DISCORD_APPLICATION_ID` | App del bot (Developer Portal) |
| `CRON_SECRET` | (opcional) `GET /api/cron/sync-memberships` con header `Authorization: Bearer …` |

El rol del bot en Discord debe estar **por encima** del rol Trader en la jerarquía.

## Cómo vincular usuarios

En Discord (comando slash del bot):

- `/vincular email:correo@ejemplo.com` — guarda `discord_user_id` en `platform_users` y sincroniza.
- `/mi-acceso` — vuelve a leer Stripe y ajusta roles.

## Ejecutar el bot

```bash
npm install
cd bots/discord-membership-bot && npm install
cd ../..
npm run discord-bot
```

Sincronización manual (sin dejar el bot online):

```bash
npm run membership:sync
```

## Disparadores automáticos en producción

- Webhook Stripe: `customer.subscription.updated`, `customer.subscription.deleted`, y tras `invoice.payment_succeeded` de membresía.
- **Cron en Vercel** (plan **Hobby**: una vez al día, `0 0 * * *` UTC ≈ **7 pm Miami** en invierno EST; en verano EDT suele ser **8 pm**). Cada ejecución recorre **todos** los `platform_users`, consulta Stripe y deja en `visitante` + quita Trader en Discord sin membresía activa. Admin/soporte no se tocan.
  - Define `CRON_SECRET` en Vercel (Vercel envía `Authorization: Bearer …` en los cron jobs).
  - Prueba manual: `curl -H "Authorization: Bearer $CRON_SECRET" "https://TU_DOMINIO/api/cron/sync-memberships"`.
  - Para **7 pm Miami exacto todo el año** sin Pro: usa un cron externo gratis (p. ej. cron-job.org) con zona `America/New_York` a las 19:00 llamando la misma URL con el header Bearer.

## Rol `visitante`

Nuevo rol en `platform_users.platform_role`. No entra al CRM (`canEnterMemberPortal` = false). Usuarios asignados manualmente como estudiante/trader sin Stripe no se convierten a visitante salvo que tengan `stripe_customer_id`.