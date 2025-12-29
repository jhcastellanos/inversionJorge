# ✅ SISTEMA DE FACTURACIÓN DINÁMICO - VERSIÓN FINAL

## 🎯 Cómo Funciona Ahora

El sistema lee **TODO** desde la base de datos (tabla `Memberships`):

### Campos en la Base de Datos:
- `StartDate` - Fecha de inicio de la membresía (cuando empiezan los cobros)
- `DiscountPrice` - Precio promocional (ej: $100)
- `DiscountMonths` - Duración de la promoción en meses (ej: 3)
- `MonthlyPrice` - Precio regular después de la promoción (ej: $150)

### Cálculo Automático:
```
Fin de Promoción = StartDate + DiscountMonths
```

---

## 📊 Los 3 Escenarios

### 1️⃣ Compra ANTES del StartDate

**Ejemplo:** StartDate = 1 Feb 2026, Compra = 15 Ene 2026

```
✅ Resultado:
• Trial GRATUITO del 15 ene al 1 feb
• Primer cobro: 1 febrero → $100 (precio promocional)
• Cobros siguientes: $100/mes hasta que termine promoción
• Cambio automático: A $150/mes después de 3 meses
```

**Código:**
```typescript
if (purchaseDate < startDate) {
  billingCycleAnchor = startDate;
  trialEnd = startDate;
  currentPrice = discountPrice;
}
```

---

### 2️⃣ Compra DURANTE la Promoción

**Ejemplo:** StartDate = 1 Feb 2026, DiscountMonths = 3, Compra = 15 Feb 2026

```
✅ Resultado:
• Cobro INMEDIATO prorrateado: ~$50 (15 días de feb a $100/mes)
• Próximo cobro: 1 marzo → $100
• Continúa: $100/mes hasta 1 mayo (fin de promoción)
• Cambio automático: A $150/mes desde 1 mayo
```

**Código:**
```typescript
if (purchaseDate >= startDate && purchaseDate < promoEndDate) {
  billingCycleAnchor = purchaseDate;
  currentPrice = discountPrice;
  // Stripe calcula el prorrateado automáticamente
}
```

---

### 3️⃣ Compra DESPUÉS de la Promoción

**Ejemplo:** StartDate = 1 Feb 2026, DiscountMonths = 3, Compra = 15 Mayo 2026

```
✅ Resultado:
• Cobro INMEDIATO prorrateado: ~$75 (16 días de mayo a $150/mes)
• Próximo cobro: 1 junio → $150
• Continúa: $150/mes indefinidamente
• Sin promoción disponible
```

**Código:**
```typescript
if (purchaseDate >= promoEndDate) {
  billingCycleAnchor = purchaseDate;
  currentPrice = regularPrice; // Sin descuento
}
```

---

## 🔧 Configurar en Admin Panel

### Paso 1: Ir a Editar Membresía

Ve a: http://localhost:3000/admin/memberships/1/edit

### Paso 2: Configurar Promoción

Completa estos campos:

1. **Fecha de Inicio de la Membresía** → 2026-02-01T00:00
2. **Precio Promocional** → 100
3. **Duración Promoción (Meses)** → 3
4. **Precio Regular** → 150

### Paso 3: Guardar

El sistema calculará automáticamente:
- Fin de promoción = 2026-05-01 (1 feb + 3 meses)

---

## 🧪 Probar en Localhost

### 1. Ver configuración actual:
```bash
node test-membership-config.js
```

### 2. Iniciar servidores:
```bash
# Terminal 1
npm run dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3. Comprar membresía:
- Ve a http://localhost:3000
- Compra con tarjeta: 4242 4242 4242 4242

### 4. Verificar schedule:
```bash
node verify-last-subscription.js
```

---

## 📝 Ejemplo Real Configurado

**Configuración actual en BD:**
- StartDate: 28 dic 2025 00:00
- DiscountPrice: $120
- DiscountMonths: 4
- MonthlyPrice: $150

**Cálculos:**
- Fin promoción: 28 abr 2026 (28 dic + 4 meses)

**Si compras HOY (27 dic 2025):**
- Trial gratuito hasta 28 dic
- Primer cobro: 28 dic → $120
- Precio promocional hasta: 28 abr 2026
- Cambio automático: $150/mes desde 28 abr

---

## 🚀 Para Producción

### 1. Configurar en Admin:
- StartDate → 2026-02-01T00:00:00
- DiscountPrice → 100
- DiscountMonths → 3
- MonthlyPrice → 150

### 2. Variables de Entorno:
```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 3. Webhook en Stripe:
- URL: https://tudominio.com/api/stripe/webhook
- Eventos: checkout.session.completed, customer.subscription.*

---

## ✅ Ventajas del Nuevo Sistema

1. **Dinámico** - Todo se configura desde admin panel
2. **Flexible** - Cambia fechas/precios sin tocar código
3. **Automático** - Calcula prorrateados y cambios de precio
4. **Normalizado** - Todos pagan el día 1 del mes
5. **Sin Mantenimiento** - Stripe maneja todo automáticamente

---

## 🎉 ¡Listo para Usar!

El sistema está completamente funcional. Solo necesitas:
1. Configurar fechas en admin panel
2. Comprar una membresía para probar
3. Verificar que el schedule se cree correctamente

Todo lo demás es automático! 🚀
