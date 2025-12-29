# Sistema de Facturación con Fecha de Inicio Fija

## 📅 Fechas Importantes

- **Inicio de Facturación**: 1 de febrero de 2026
- **Precio Promocional**: $100/mes (válido feb, mar, abr 2026)
- **Cambio a Precio Regular**: 1 de mayo de 2026
- **Precio Regular**: $150/mes (a partir de mayo 2026)

---

## 🎯 Cómo Funciona

### Escenario 1: Compra ANTES del 1 de Febrero 2026

**Ejemplo**: Usuario compra el 15 de enero de 2026

```
✅ Compra: 15 enero 2026
⏸️ Trial Period: Del 15 enero al 1 febrero (sin cargo)
💰 Primer Cobro: 1 febrero 2026 → $100
💰 Segundo Cobro: 1 marzo 2026 → $100
💰 Tercer Cobro: 1 abril 2026 → $100
💰 Cuarto Cobro: 1 mayo 2026 → $150 (precio regular)
💰 Cobros siguientes: Siempre el día 1 de cada mes → $150
```

**Lo que pasa técnicamente:**
- Stripe crea la suscripción con `trial_end` = 1 febrero 2026
- Durante el trial no hay cobros
- El primer cargo se hace el 1 de febrero a precio promocional
- El schedule cambia el precio a $150 el 1 de mayo

---

### Escenario 2: Compra DESPUÉS del 1 de Febrero (durante promoción)

**Ejemplo**: Usuario compra el 15 de febrero de 2026

```
✅ Compra: 15 febrero 2026
💰 Primer Cobro INMEDIATO: 15 febrero 2026 → $50 (prorrateado por 15 días)
   Cálculo: ($100 / 28 días) × 13 días restantes ≈ $46.43
💰 Segundo Cobro: 1 marzo 2026 → $100 (mes completo)
💰 Tercer Cobro: 1 abril 2026 → $100 (mes completo)
💰 Cuarto Cobro: 1 mayo 2026 → $150 (precio regular)
💰 Cobros siguientes: Siempre el día 1 de cada mes → $150
```

**Lo que pasa técnicamente:**
- Stripe cobra inmediatamente el proporcional del mes actual
- `billing_cycle_anchor` se establece al día de la compra
- El schedule ajusta para cobrar completo el 1 del próximo mes
- El schedule cambia el precio a $150 el 1 de mayo

---

### Escenario 3: Compra DESPUÉS de la Promoción

**Ejemplo**: Usuario compra el 15 de mayo de 2026

```
✅ Compra: 15 mayo 2026
💰 Primer Cobro INMEDIATO: 15 mayo 2026 → $75 (prorrateado por 15 días)
   Cálculo: ($150 / 31 días) × 16 días restantes ≈ $77.42
💰 Segundo Cobro: 1 junio 2026 → $150 (mes completo)
💰 Cobros siguientes: Siempre el día 1 de cada mes → $150
```

**Lo que pasa técnicamente:**
- La promoción ya expiró, así que usa precio regular desde el inicio
- Stripe cobra inmediatamente el proporcional a $150/mes
- `billing_cycle_anchor` normaliza todos los cobros al día 1

---

## 🔧 Implementación Técnica

### En `subscription-checkout/route.ts`:

```typescript
const PROMO_START_DATE = new Date('2026-02-01T00:00:00Z');
const PROMO_END_DATE = new Date('2026-05-01T00:00:00Z');
const now = new Date();

let billingCycleAnchor: number;
let trialEnd: number | undefined;

if (now < PROMO_START_DATE) {
  // Trial hasta el 1 de febrero
  billingCycleAnchor = Math.floor(PROMO_START_DATE.getTime() / 1000);
  trialEnd = billingCycleAnchor;
} else {
  // Cobrar desde hoy con prorrateado
  billingCycleAnchor = Math.floor(now.getTime() / 1000);
}

subscription_data: {
  billing_cycle_anchor: billingCycleAnchor,
  proration_behavior: 'create_prorations',
  trial_end: trialEnd, // Solo si es antes del 1 feb
}
```

### En `webhook/route.ts`:

```typescript
const promoEndDate = new Date('2026-05-01T00:00:00Z');
const promoEndTimestamp = Math.floor(promoEndDate.getTime() / 1000);

phases: [
  {
    // Fase 1: Precio promocional hasta el 1 de mayo 2026
    items: [{ price: discountPriceId, quantity: 1 }],
    end_date: promoEndTimestamp,
  },
  {
    // Fase 2: Precio regular desde el 1 de mayo 2026 en adelante
    items: [{ price: regularPriceId, quantity: 1 }],
  },
]
```

---

## 📊 Visualización del Schedule

Cuando un usuario compra, el Stripe Schedule se ve así:

```
SUBSCRIPTION SCHEDULE
├── PHASE 1 (Promocional)
│   ├── Precio: $100/mes
│   ├── Inicio: Depende de cuándo compró
│   └── Fin: 1 mayo 2026 00:00:00 UTC
│
└── PHASE 2 (Regular)
    ├── Precio: $150/mes
    ├── Inicio: 1 mayo 2026 00:00:00 UTC
    └── Fin: Indefinido (continúa para siempre)
```

---

## ✅ Ventajas de Este Sistema

1. **Alineación de Cobros**: Todos los usuarios pagan el día 1 del mes
2. **Prorrateado Justo**: Si compras a mitad de mes, solo pagas los días restantes
3. **Promoción Limitada**: La promoción expira automáticamente el 1 de mayo
4. **Trial Automático**: Si compras antes del lanzamiento, no pagas hasta el 1 de febrero
5. **Sin Mantenimiento**: Todo es automático, Stripe maneja los cambios de precio

---

## 🧪 Cómo Probar en Sandbox

1. Cambia las fechas en el código a fechas cercanas (ej: mañana)
2. Crea una suscripción
3. Verifica el schedule en Stripe Dashboard
4. Usa `stripe` CLI para simular el paso del tiempo:
   ```bash
   stripe trigger subscription.created
   ```

---

## ⚠️ Consideraciones Importantes

1. **Timezone**: Todas las fechas están en UTC
2. **Prorrateado**: Stripe calcula automáticamente según días del mes
3. **Trial**: Solo aplica si compras antes del 1 de febrero
4. **Schedule**: Se crea automáticamente en el webhook `checkout.session.completed`
5. **Cambio de Precio**: Es automático, no requiere intervención manual

---

## 🔍 Verificar Schedule en Stripe

Después de crear una suscripción, puedes verificar con este código:

```javascript
const schedule = await stripe.subscriptionSchedules.list({
  customer: 'cus_XXXXX',
  expand: ['data.phases.items.price']
});

schedule.data.forEach(s => {
  console.log('Schedule ID:', s.id);
  s.phases.forEach((phase, i) => {
    console.log(`Fase ${i + 1}:`);
    console.log('  Precio:', phase.items[0].price.unit_amount / 100);
    console.log('  Inicio:', new Date(phase.start_date * 1000));
    console.log('  Fin:', phase.end_date ? new Date(phase.end_date * 1000) : 'Indefinido');
  });
});
```
