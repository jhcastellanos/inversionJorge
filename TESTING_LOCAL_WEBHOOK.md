# Testing Stripe Webhooks Locally

## Problema
Las compras de Stripe no aparecen en el panel admin porque **los webhooks no funcionan en localhost**.

Stripe necesita enviar notificaciones POST a tu servidor, pero `http://localhost:3000` no es accesible desde internet.

---

## Solución 1: Stripe CLI (Recomendado)

### Instalar Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Verificar instalación
stripe --version
```

### Configurar y usar

1. **Autenticarse:**
```bash
stripe login
```

2. **Reenviar webhooks a localhost:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Esto te dará un **webhook signing secret** que comienza con `whsec_...`

3. **Actualizar .env con el secret:**
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

4. **Reiniciar el servidor:**
```bash
npm run dev
```

5. **Hacer una compra de prueba** y verás los eventos en la terminal de Stripe CLI

---

## Solución 2: Registrar compra directamente en checkout (Sin webhook)

Modificar el checkout para guardar la compra inmediatamente en lugar de esperar el webhook.

**Ventaja:** Funciona sin webhook
**Desventaja:** Si el usuario cierra la ventana después de pagar, la compra se registra igual

---

## Verificar si hay compras en la base de datos

```bash
node -e "
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_J8VQp6MkdlDi@ep-holy-rain-ahk105a2-pooler.c-3.us-east-1.aws.neon.tech/neondb' });
(async () => {
  const client = await pool.connect();
  try {
    const purchases = await client.query('SELECT * FROM purchases ORDER BY purchased_at DESC');
    console.log('Compras:', purchases.rows);
    const customers = await client.query('SELECT * FROM customers');
    console.log('Clientes:', customers.rows);
  } finally {
    client.release();
    await pool.end();
  }
})();
"
```

---

## ¿Cuál solución prefieres?

1. **Stripe CLI** - Más profesional, testing completo del webhook
2. **Registro directo** - Más rápido, funciona sin configuración adicional
