# Configuración de Email para Términos y Condiciones

Este documento explica cómo configurar el sistema de envío de emails usando **Resend** (servicio gratuito recomendado).

## ¿Por qué Resend?

- ✅ **Gratis:** 100 emails/día permanentemente
- ✅ **Fácil:** No necesita configuración complicada de Gmail
- ✅ **Confiable:** Mejor deliverability que Gmail SMTP
- ✅ **Integrado:** Perfect para Next.js
- ✅ **Rápido:** Emails se envían al instante

## Variables de Entorno Requeridas

```
RESEND_API_KEY=re_xxxxxxxxxx
OWNER_EMAIL=inversionrealconjorge@gmail.com
```

## Paso 1: Crear Cuenta en Resend

1. Ve a https://resend.com
2. Haz clic en **Sign Up**
3. Completa tu email y contraseña
4. Verifica tu email

## Paso 2: Obtener API Key

1. Después de registrarte, ve a **API Keys** en el panel izquierdo
2. Haz clic en **Create API Key**
3. Dale un nombre (ejemplo: "Términos y Condiciones")
4. Selecciona **Full Access**
5. Copia la key (comienza con `re_`)

### Importante:
- **RESEND_API_KEY**: La key que acabas de copiar de Resend (ejemplo: `re_xyz123...`)
- **OWNER_EMAIL**: Tu email personal donde recibirás los contratos (inversionrealconjorge@gmail.com)

## Paso 3: Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Selecciona **Settings** → **Environment Variables**
3. Agrega estas 2 variables:
   - `RESEND_API_KEY` = re_xxxxxxxxxx (tu API key de Resend)
   - `OWNER_EMAIL` = inversionrealconjorge@gmail.com

4. Haz redeploy del proyecto

## Paso 4: Configurar en Railway

1. Ve a tu proyecto en Railway
2. Selecciona **Variables**
3. Agrega las mismas 2 variables:
   - `RESEND_API_KEY` = re_xxxxxxxxxx
   - `OWNER_EMAIL` = inversionrealconjorge@gmail.com

## Paso 5: Configurar Localmente (.env.local)

Para desarrollo local, crea un archivo `.env.local` en la raíz del proyecto con:

```
RESEND_API_KEY=re_xxxxxxxxxx
OWNER_EMAIL=inversionrealconjorge@gmail.com
```

## Funcionamiento

Cuando un usuario se suscribe a la membresía "Trading en Vivo":

1. ✅ Se muestra un modal con términos y condiciones
2. ✅ Usuario ingresa su nombre y email
3. ✅ Usuario marca checkbox "Acepto los términos"
4. ✅ Usuario hace clic en "Aceptar y Continuar"
5. ✅ El sistema genera un PDF con:
   - Los términos y condiciones completos
   - Nombre y email del suscriptor
   - Fecha y hora de aceptación
   - Nota sobre responsabilidad legal
6. ✅ El PDF se envía automáticamente via Resend a inversionrealconjorge@gmail.com
7. ✅ El usuario es redirigido a Stripe para completar el pago

## Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente el API key desde Resend
- Debe empezar con `re_`

### Error: "Email not sent"
- Comprueba que OWNER_EMAIL sea una dirección válida
- Revisa los logs del servidor
- En Resend dashboard puedes ver el historial de emails

### El email no llega
- Revisa la carpeta de SPAM
- Ve al dashboard de Resend → **Emails** para ver si se envió exitosamente
- Resend tiene mejor deliverability que Gmail SMTP

## Monitoreo

En Resend dashboard puedes:
- Ver historial de todos los emails enviados
- Ver si llegaron exitosamente o fallaron
- Ver detalles de cada email
- Descargcar logs

## Límites

- **Plan Gratis:** 100 emails/día permanentemente
- Para tu caso es más que suficiente
- Si necesitas más, planes pagos comienzan en $20/mes

## Seguridad

- 🔒 El API key se guarda de forma segura en Vercel y Railway
- ⚠️ NUNCA compartas tu API key públicamente
- 🔐 Resend maneja la seguridad de los emails automáticamente
