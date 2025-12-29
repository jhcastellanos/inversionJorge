## Configuración de Membresía para Producción

### Datos a ingresar en el formulario:

**Nombre:**
```
Comunidad Trading Pro
```

**Descripción:**
```
Acceso completo a todos nuestros materiales educativos y sesiones de trading en vivo. Opera con nosotros y aprende en tiempo real.
```

**Precio Regular (Mensual):**
```
150
```

**Precio con Descuento (Primeros meses):**
```
100
```

**Cantidad de Meses con Descuento:**
```
3
```

**Beneficios:** (uno por línea)
```
Acceso a todos los cursos grabados
Trading en vivo diario de 9 AM hasta la última operativa del día
Observa nuestras operativas en tiempo real
Gestión de riesgo en vivo - ganancias y pérdidas
Análisis de mercado en directo
Material educativo actualizado constantemente
```

**Estado:**
```
✓ Activa
```

### Resultado Esperado:

Cuando un usuario compre esta membresía:
- Pagará $100/mes durante los primeros 3 meses
- A partir del 4to mes, pagará $150/mes automáticamente
- El cambio de precio es completamente automático (Stripe lo maneja)

### Verificación en Stripe:

Después de crear la membresía y que alguien la compre:

1. Ve a Stripe Dashboard → Subscriptions
2. Busca la suscripción del cliente
3. Verás un mensaje: "Price will change to $150.00 on [fecha]"
4. En la sección "Schedule" verás las 2 fases configuradas

### Importante para Producción:

✅ El webhook DEBE estar configurado en Stripe para que el schedule se cree automáticamente
✅ La URL del webhook debe ser HTTPS (no HTTP)
✅ Verifica que el webhook secret esté correcto en las variables de entorno
✅ Prueba con una compra real para confirmar que todo funciona
