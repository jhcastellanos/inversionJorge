# ⚠️ CONFIGURACIÓN URGENTE - Variables de Entorno en Vercel

## El Error
```
Error: No database host or connection string was set
```

Esto significa que Vercel **NO tiene acceso** a tus variables de entorno.

---

## ✅ Solución: Configurar Variables en Vercel

### 1. Ve a tu proyecto en Vercel
https://vercel.com/dashboard

### 2. Selecciona tu proyecto "inversionJorge"

### 3. Ve a Settings → Environment Variables

### 4. Agrega TODAS estas variables (una por una):

#### Variable 1: DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: Tu connection string de Neon (cópialo de tu archivo `.env` local)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: STRIPE_SECRET_KEY
- **Key**: `STRIPE_SECRET_KEY`
- **Value**: Tu Stripe secret key (empieza con `sk_test_` para pruebas o `sk_live_` para producción)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **Ubicación**: Cópialo de tu archivo `.env` local

#### Variable 3: STRIPE_PUBLISHABLE_KEY
- **Key**: `STRIPE_PUBLISHABLE_KEY`
- **Value**: Tu Stripe publishable key (empieza con `pk_test_` o `pk_live_`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **Ubicación**: Cópialo de tu archivo `.env` local

#### Variable 4: STRIPE_WEBHOOK_SECRET
- **Key**: `STRIPE_WEBHOOK_SECRET`
- **Value**: `whsec_your_webhook_secret_here` (lo configurarás después)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **Nota**: Esta se configurará después cuando actives el webhook en Stripe

#### Variable 5: NEXT_PUBLIC_BASE_URL
- **Key**: `NEXT_PUBLIC_BASE_URL`
- **Value**: `https://tu-dominio.vercel.app` (cámbialo por tu dominio real de Vercel)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 6: BLOB_READ_WRITE_TOKEN
- **Key**: `BLOB_READ_WRITE_TOKEN`
- **Value**: Se genera automáticamente al habilitar Vercel Blob
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **Nota**: Esta variable se crea automáticamente cuando habilitas Vercel Blob Storage

#### Variable 7: JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: `your-super-secret-jwt-key-change-this-in-production`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **Recomendación**: Genera un string aleatorio seguro para producción

---

## 4.5. Habilitar Vercel Blob Storage

Para que las imágenes se guarden persistentemente:

1. En tu proyecto de Vercel, ve a **Storage**
2. Click en **Create Database**
3. Selecciona **Blob Storage**
4. Click **Continue**
5. Acepta los términos y click **Create**
6. La variable `BLOB_READ_WRITE_TOKEN` se creará automáticamente

**Plan gratuito incluye:**
- ✅ 1GB de almacenamiento
- ✅ Perfecto para imágenes de cursos

---

## 5. Redeploy después de agregar variables

Después de agregar TODAS las variables:

1. Ve a **Deployments** tab
2. Click en el deployment más reciente
3. Click en los **3 puntos** (⋯) 
4. Click **"Redeploy"**
5. Confirma el redeploy

---

## 6. Verificar que funciona

Una vez que termine el redeploy:

1. Visita tu URL de Vercel: `https://inversion-jorge.vercel.app` (o tu dominio)
2. Deberías ver la página principal con los cursos
3. NO debería aparecer el error de "No database host"

---

## 🔒 IMPORTANTE - Seguridad

- ❌ **NUNCA** commits el archivo `.env` a GitHub
- ✅ El archivo `.gitignore` ya incluye `.env`
- ✅ Usa Stripe TEST keys para pruebas
- ✅ Cambia a Stripe LIVE keys solo cuando estés listo para producción

---

## 🆘 Si todavía no funciona

1. Verifica que TODAS las variables estén configuradas en Vercel
2. Verifica que no haya espacios extra en los valores
3. Haz un nuevo Redeploy
4. Revisa los logs en Vercel → Deployments → [tu deploy] → Runtime Logs
