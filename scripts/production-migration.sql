-- Migración para actualizar base de datos de producción
-- Ejecutar en Neon SQL Editor (consola de producción)

-- 1. Eliminar columnas de promoción antiguas (si existen)
ALTER TABLE "Memberships" 
  DROP COLUMN IF EXISTS "DiscountPrice",
  DROP COLUMN IF EXISTS "DiscountMonths";

-- 2. Agregar columna StartDate (si no existe)
ALTER TABLE "Memberships" 
  ADD COLUMN IF NOT EXISTS "StartDate" TIMESTAMP WITH TIME ZONE;

-- 3. Verificar la estructura final
-- Ejecuta este SELECT para confirmar que la tabla tiene la estructura correcta:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'Memberships' 
-- ORDER BY ordinal_position;

-- La tabla debe tener:
-- - Id
-- - Name
-- - Description
-- - MonthlyPrice
-- - Benefits
-- - IsActive
-- - ImageUrl
-- - CreatedAt
-- - StartDate (NUEVO - permite trial period hasta esta fecha)
