# Cloudflare R2 + Vercel

La app sigue en **Vercel**; archivos grandes y media van a **R2** (API S3).

## 1. Crear bucket en Cloudflare

1. Dashboard → **R2** → Create bucket.
2. **Settings** → **Public access**: activa acceso público (subdominio `*.r2.dev`) o conecta dominio propio.
3. Anota la **Public bucket URL** → `R2_PUBLIC_BASE_URL` (sin barra final).

## 2. API token

R2 → **Manage R2 API Tokens** → Create token con permiso **Object Read & Write** en ese bucket.

- `R2_ACCOUNT_ID` (Account ID en el panel de Cloudflare)
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

Añade las mismas variables en **Vercel** → Environment Variables → redeploy.

## 3. CORS (subidas desde el navegador)

En el bucket → **CORS policy**:

```json
[
  {
    "AllowedOrigins": [
      "https://inversion-jorge.vercel.app",
      "https://TU_DOMINIO",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Sin CORS, el Academy Manager fallará al subir vídeos (PUT firmado).

## 4. Qué usa R2 en el código

| Ruta | Uso |
|------|-----|
| `POST /api/admin/academy-upload` | URL firmada; el browser sube a R2 |
| `POST /api/upload` | Imágenes de cursos (≤5 MB) |

Los archivos antiguos en Vercel Blob siguen funcionando si la URL en BD no cambia. Nuevas subidas usan R2.

## 5. Free tier R2 (referencia)

~10 GB-mes de almacenamiento, millones de operaciones lectura/escritura, **egress sin cargo**. Ver [pricing R2](https://developers.cloudflare.com/r2/pricing/).