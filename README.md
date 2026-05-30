# Inversión Real con Jorge y Guille - Plataforma de Cursos

Plataforma de venta de cursos para la academia **Inversión Real con Jorge y Guille**, especializada en educación sobre bolsa de valores, trading y estrategias de inversión.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Base de Datos**: Neon PostgreSQL (serverless)
- **Pagos**: Stripe (Live mode)
- **Autenticación**: JWT + bcryptjs
- **Estilos**: Tailwind CSS

## 📋 Características

- Landing page con cursos activos
- Panel de administración (CRUD cursos)
- Stripe Checkout integrado
- Autenticación JWT segura
- Diseño responsive moderno

## 🔧 Variables de Entorno

```env
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
JWT_SECRET=...
NEXT_PUBLIC_BASE_URL=https://...
```

## 🚢 Deployment

### Vercel
1. Push a GitHub
2. Conectar repo en Vercel
3. Configurar env vars
4. Deploy

### Railway
Usar para database Postgres o conectar Neon existente.

## 👤 Admin

- URL: `/admin/login`
- Usuario: `jhcastellanos`

---

**© 2025 Inversión Real con Jorge y Guille**
