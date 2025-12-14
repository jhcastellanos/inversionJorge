# 🚀 Guía de Deployment

## Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repo: `inversion-real-cursos` (o el que prefieras)
3. Descripción: "Plataforma de cursos - Inversión Real con Jorge"
4. **Privado** o Público (tu eliges)
5. NO inicializar con README (ya lo tenemos)
6. Crear repositorio

## Paso 2: Subir Código a GitHub

En tu terminal (ya dentro de `/Users/jorgecastellanos/projects/cursos`):

```bash
# Conectar tu repo local con GitHub (reemplaza TU-USUARIO con tu username de GitHub)
git remote add origin https://github.com/TU-USUARIO/inversion-real-cursos.git

# Renombrar branch a main (si es necesario)
git branch -M main

# Push inicial
git push -u origin main
```

**Credenciales**: GitHub te pedirá autenticación. Usa Personal Access Token (no password).

---

## Paso 3: Deploy en Vercel ⚡

### Opción A: Deploy desde Dashboard (Recomendado)

1. Ve a https://vercel.com
2. Login con GitHub
3. Click **"New Project"**
4. **Import** tu repo `inversion-real-cursos`
5. **Configure Project**:
   - **Framework Preset**: Next.js (detectado automáticamente)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

6. **Environment Variables** (click "Add"):
   
   ```
   DATABASE_URL=postgresql://neondb_owner:***@ep-***-pooler.c-3.us-east-1.aws.neon.tech/neondb
   
   STRIPE_SECRET_KEY=sk_live_your_actual_secret_key_here
   
   STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key_here
   
   JWT_SECRET=inversion-real-super-secret-key-2025-prod
   
   NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
   ```
   
   **IMPORTANTE**: 
   - Reemplaza con tus keys reales de Stripe Dashboard
   - Después del primer deploy, Vercel te dará una URL tipo `https://inversion-real-cursos.vercel.app`
   - Actualiza `NEXT_PUBLIC_BASE_URL` con esa URL en Settings > Environment Variables
   - Redeploy para aplicar cambios

7. Click **"Deploy"**

⏳ **Espera 2-3 minutos** mientras Vercel:
- Instala dependencias
- Build Next.js
- Deploy a producción

✅ **Listo!** Vercel te dará una URL como: `https://inversion-real-cursos.vercel.app`

### Configuración Post-Deploy

1. **Custom Domain** (Opcional):
   - Settings > Domains
   - Agregar tu dominio personalizado
   - Configurar DNS según instrucciones

2. **Webhooks de Stripe** (Importante para pagos):
   - Ve a Stripe Dashboard > Webhooks
   - Add endpoint: `https://tu-dominio.vercel.app/api/stripe/webhook`
   - Seleccionar eventos: `checkout.session.completed`
   - Copiar webhook secret y agregarlo a env vars de Vercel

3. **Variables de Entorno - Actualización**:
   - Vercel > Settings > Environment Variables
   - Edita `NEXT_PUBLIC_BASE_URL` con tu dominio real
   - Redeploy desde Deployments > ... > Redeploy

---

## Paso 4: Railway (Opcional - Solo si quieres DB propia)

**NOTA**: Ya usas Neon Postgres, NO necesitas Railway para DB. Railway es útil si quieres:
- Hosting adicional
- Servicios backend separados
- Redis, etc.

Si solo necesitas el frontend + Neon, **Vercel es suficiente**.

### Si decides usar Railway:

1. Ve a https://railway.app
2. Login con GitHub
3. New Project > Deploy from GitHub repo
4. Selecciona `inversion-real-cursos`
5. Agrega variables de entorno (igual que Vercel)
6. Railway detecta Next.js automáticamente
7. Deploy

---

## 🔒 Seguridad Post-Deploy

### 1. Verificar que .env NO esté en GitHub

```bash
# En tu proyecto local, verifica:
cat .gitignore
# Debe contener:
# .env
# .env.local
```

Si .env está visible en GitHub:
```bash
git rm --cached .env
git commit -m "Remove .env from git"
git push
```

### 2. Rotar Secrets (Recomendado)

Para producción, genera nuevos secrets:

```bash
# Generar nuevo JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📊 Monitoring y Logs

### Vercel

- **Logs**: Dashboard > Project > Logs (real-time)
- **Analytics**: Settings > Analytics
- **Errores**: Automatically integrated with Vercel

### Base de Datos (Neon)

- Dashboard: https://console.neon.tech
- Queries, métricas, etc.

---

## 🔄 Workflow de Updates

```bash
# 1. Hacer cambios en código
# 2. Commit
git add .
git commit -m "Feature: descripción del cambio"

# 3. Push a GitHub
git push

# 4. Vercel auto-deploy (automático)
# 5. Ver preview en Vercel dashboard
```

---

## 🆘 Troubleshooting

### Error: "Module not found" en Vercel

- Verifica que todas las deps estén en `package.json`
- Redeploy después de agregar deps

### Error: Stripe checkout no redirige

- Verifica `NEXT_PUBLIC_BASE_URL` en env vars
- Debe ser la URL de producción, no localhost

### Error: JWT no funciona en producción

- Verifica `JWT_SECRET` en env vars
- Debe ser el mismo que usas localmente (o genera uno nuevo)

### Error: No se conecta a la BD

- Verifica `DATABASE_URL` en Vercel
- Prueba conexión desde Neon dashboard
- Verifica que Neon pooler connection string sea correcto

---

## 📝 Checklist Final

- [ ] Código en GitHub
- [ ] Deploy en Vercel exitoso
- [ ] Variables de entorno configuradas
- [ ] `NEXT_PUBLIC_BASE_URL` actualizado con dominio real
- [ ] Stripe webhook configurado
- [ ] Login admin funciona en producción
- [ ] Checkout funciona correctamente
- [ ] Imágenes cargan bien

---

## 🎉 ¡Todo Listo!

Tu plataforma está en producción. Accede a:

- **Landing**: `https://tu-dominio.vercel.app`
- **Admin**: `https://tu-dominio.vercel.app/admin/login`

**Usuario admin**: jhcastellanos  
**Password**: (el configurado en tu BD)

---

**© 2025 Inversión Real con Jorge**
