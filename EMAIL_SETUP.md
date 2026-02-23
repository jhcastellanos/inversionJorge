# Configuración de Email para Términos y Condiciones

Este documento explica cómo configurar el sistema de envío de emails para la generación de PDFs de términos y condiciones.

## Variables de Entorno Requeridas

```
EMAIL_USER=tu_gmail@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
OWNER_EMAIL=inversionrealconjorge@gmail.com
```

## Paso 1: Configurar Gmail App Password

El sistema usa Gmail SMTP para enviar emails. Necesitas crear una **App Password** (no es tu contraseña normal).

### Instrucciones:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. En el menú izquierdo, selecciona **Seguridad**
3. En "Verificación en dos pasos", asegúrate que esté ACTIVADA (si no está, actívala primero)
4. Una vez activada la verificación en dos pasos, aparecerá la opción "Contraseña de aplicación"
5. Haz clic en "Contraseña de aplicación"
6. Selecciona:
   - Aplicación: **Correo**
   - Dispositivo: **Windows, Mac u otro (personalizado)**
   - Escribe: "NodeJS Email"
7. Google generará una contraseña de 16 caracteres (sin espacios)
8. Copia esa contraseña

### Importante:
- **EMAIL_USER**: Tu email de Gmail completo (ejemplo: jorge@gmail.com)
- **EMAIL_PASS**: La contraseña de aplicación de 16 caracteres que Google te generó
- **OWNER_EMAIL**: Dónde se enviarán los PDFs firmados (inversionrealconjorge@gmail.com)

## Paso 2: Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Selecciona **Settings** → **Environment Variables**
3. Agrega estas 3 variables:
   - `EMAIL_USER` = tu_gmail@gmail.com
   - `EMAIL_PASS` = (la contraseña de 16 caracteres)
   - `OWNER_EMAIL` = inversionrealconjorge@gmail.com

## Paso 3: Configurar en Railway

1. Ve a tu proyecto en Railway
2. Selecciona **Variables**
3. Agrega las mismas 3 variables de entorno

## Paso 4: Configurar Localmente (.env.local)

Para desarrollo local, crea un archivo `.env.local` en la raíz del proyecto con:

```
EMAIL_USER=tu_gmail@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
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
6. ✅ El PDF se envía automáticamente a inversionrealconjorge@gmail.com
7. ✅ El usuario es redirigido a Stripe para completar el pago

## Solución de Problemas

### Error: "SMTP auth failed"
- Verifica que EMAIL_PASS sea la contraseña de aplicación (16 caracteres), NO tu contraseña de Gmail
- Asegúrate que la verificación en dos pasos esté activada

### Error: "ECONNREFUSED"
- El servidor no puede conectarse a Gmail SMTP
- Verifica que las variables de entorno estén correctamente configuradas
- En desarrollo local, reinicia el servidor: `npm run dev`

### El email no llega
- Revisa la carpeta de SPAM
- Verifica que OWNER_EMAIL sea una dirección válida
- Comprueba los logs del servidor para errores

## Seguridad

- ⚠️ NUNCA compartas tu contraseña de aplicación de Google
- 🔒 Las variables de entorno se guardan de forma segura en Vercel y Railway
- 📄 Los PDFs contienen información sensible, envía solo a addresses de confianza
