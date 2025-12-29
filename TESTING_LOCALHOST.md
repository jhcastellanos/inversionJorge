# ✅ CHECKLIST PARA PROBAR EN LOCALHOST

## Estado Actual
📅 **Fecha actual (UTC)**: 28 de diciembre 2025, 02:49
🎯 **Escenario activo**: DURANTE LA PROMOCIÓN
⏰ **Tiempo restante**: ~69 horas hasta fin de promoción (31 dic)

---

## Antes de empezar

### ✅ 1. Servidor Next.js
```bash
npm run dev
```
Debe estar corriendo en: http://localhost:3000

### ✅ 2. Stripe CLI (Webhooks)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Debe mostrar: "Ready! Your webhook signing secret is whsec_..."

### ✅ 3. Base de Datos
La conexión a Neon debe estar funcionando (ya está configurada en .env)

---

## 🧪 Pasos para Probar

### Paso 1: Comprar una Membresía

1. Ve a http://localhost:3000
2. Click en "Unirse a la Comunidad" o botón similar
3. Completa el checkout con tarjeta de prueba de Stripe:
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura (ej: 12/26)
   - CVC: Cualquier 3 dígitos (ej: 123)
   - Email: Cualquiera (ej: test@test.com)

### Paso 2: Verificar que el Webhook se ejecutó

En la terminal de Stripe CLI deberías ver:
```
checkout.session.completed [evt_xxx] Succeeded
```

### Paso 3: Verificar el Schedule creado

```bash
node verify-last-subscription.js
```

Deberías ver:
- ✅ SCHEDULE ENCONTRADO
- Fase 1: $100/mes (promocional) hasta 31 dic
- Fase 2: $150/mes (regular) desde 31 dic en adelante

---

## 🎯 Qué esperar según cuándo compres

### Si compras HOY (28 dic):
```
💰 Cobro inmediato: ~$3.23 (1 día prorrateado de $100)
💰 1 enero 2026: $150 (ya cambió a precio regular)
💰 1 febrero 2026: $150
💰 Y así sucesivamente...
```

### Si compras el 29 dic:
```
💰 Cobro inmediato: ~$6.45 (2 días prorrateados de $100)
💰 1 enero 2026: $150 (ya cambió a precio regular)
💰 1 febrero 2026: $150
💰 Y así sucesivamente...
```

### Si compras el 30 dic:
```
💰 Cobro inmediato: ~$3.23 (1 día prorrateado de $100)
💰 1 enero 2026: $150 (ya cambió a precio regular)
💰 1 febrero 2026: $150
💰 Y así sucesivamente...
```

### Si compras el 1 ene 2026 o después:
```
💰 Cobro inmediato: Prorrateado a $150 (ya no hay promoción)
💰 1 febrero 2026: $150
💰 Y así sucesivamente...
```

---

## 🔍 Verificar en Stripe Dashboard

1. Ve a https://dashboard.stripe.com/test/subscriptions
2. Busca la suscripción más reciente
3. Debería mostrar status: `canceled` (normal, porque el schedule la reemplaza)
4. Ve a https://dashboard.stripe.com/test/subscription-schedules
5. Busca el schedule más reciente
6. Verifica que tenga 2 fases con los precios correctos

---

## ⚠️ Troubleshooting

### El webhook no se ejecuta
- ✅ Verifica que Stripe CLI esté corriendo
- ✅ El webhook secret debe estar en `.env`:
  ```
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  ```

### No se crea el schedule
- ✅ Revisa los logs del servidor Next.js
- ✅ Busca mensajes como:
  ```
  🎯 Subscription metadata: ...
  🎯 Has discount: true
  ✅ Schedule created: ...
  ```

### Error en el checkout
- ✅ Verifica que las claves de Stripe estén en `.env`
- ✅ Usa tarjeta de prueba: 4242 4242 4242 4242

---

## 📝 Después de Probar

Si todo funciona correctamente:

1. ✅ Cambiar las fechas a las de producción:
   - En `subscription-checkout/route.ts`
   - En `webhook/route.ts`
   - Fecha inicio: 1 febrero 2026
   - Fecha fin: 1 mayo 2026

2. ✅ Configurar variables de producción en tu hosting

3. ✅ Configurar webhook en Stripe Live mode

4. ✅ Deployar a producción

---

## 🎉 ¡Listo para Probar!

Ejecuta en orden:
1. `npm run dev` (en una terminal)
2. `stripe listen --forward-to localhost:3000/api/stripe/webhook` (en otra terminal)
3. Abre http://localhost:3000 y compra una membresía
4. `node verify-last-subscription.js` (para verificar)
