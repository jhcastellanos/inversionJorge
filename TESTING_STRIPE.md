# 🧪 Testing Stripe Checkout (Sandbox Mode)

## ✅ Configuración Actual
- **Stripe Keys**: TEST MODE (sandbox)
- **Servidor**: http://localhost:3000
- **Database**: Neon (production data pero pagos en test)

## 📝 Pasos para Probar Checkout Completo

### 1. Navega al Landing
```
http://localhost:3000
```

### 2. Click "Inscribirse Ahora" en cualquier curso
Esto te redirigirá a Stripe Checkout en modo test.

### 3. Usa Tarjeta de Test de Stripe
En la página de Stripe Checkout, usa estos datos:

**Tarjeta de Prueba - Pago Exitoso:**
```
Card Number: 4242 4242 4242 4242
Expiry: Cualquier fecha futura (ej: 12/25)
CVC: Cualquier 3 dígitos (ej: 123)
ZIP: Cualquier 5 dígitos (ej: 12345)
```

**Otras Tarjetas de Prueba:**
- `4000 0000 0000 0002` - Rechazada (declined)
- `4000 0025 0000 3155` - Requiere autenticación 3D Secure

### 4. Completa el Pago
- Stripe procesará el pago en modo test
- Te redirigirá a `/success` si todo va bien

### 5. Verifica en Stripe Dashboard
```
https://dashboard.stripe.com/test/payments
```
Deberías ver el pago registrado.

---

## 🔍 Qué Verificar

### Frontend:
- [ ] Landing carga correctamente
- [ ] Imágenes de cursos se muestran
- [ ] Botón "Inscribirse Ahora" funciona
- [ ] Redirección a Stripe Checkout

### Stripe Checkout:
- [ ] Página de Stripe se carga
- [ ] Muestra nombre y precio del curso correcto
- [ ] Acepta tarjeta de test
- [ ] Procesa el pago

### Post-Pago:
- [ ] Redirección a página de éxito
- [ ] Pago aparece en Stripe Dashboard (test mode)
- [ ] (Opcional) Webhook registra la compra en BD

---

## 🐛 Debugging

### Si checkout no redirige a Stripe:
1. Check console del browser (F12)
2. Verificar que no hay errores 500
3. Confirmar que STRIPE_SECRET_KEY está en .env

### Si Stripe rechaza el pago:
- Verificar que usas tarjeta de test correcta
- En test mode, solo tarjetas de prueba funcionan

### Si webhook no funciona:
- Webhook requiere setup adicional (Stripe CLI)
- Para testing local, puedes ignorar webhooks

---

## 📊 Logs a Observar

En la terminal donde corre `npm run dev`:
```
🛒 Checkout for courseId: X
📦 Found course: {...}
POST /api/stripe/checkout 200
```

---

## ✅ Checklist de Prueba Completa

- [ ] Landing page carga
- [ ] Click "Inscribirse Ahora"
- [ ] Stripe Checkout abre
- [ ] Ingresar tarjeta 4242 4242 4242 4242
- [ ] Completar pago
- [ ] Redirige a /success
- [ ] Pago visible en Stripe Dashboard

---

## 🚀 Para Producción

Cuando estés listo para producción:
1. Cambiar a Stripe **LIVE keys** en Vercel env vars
2. Configurar webhook en producción
3. Verificar que success_url apunta a dominio real

**IMPORTANTE**: Nunca uses test keys en producción ni live keys en desarrollo.
