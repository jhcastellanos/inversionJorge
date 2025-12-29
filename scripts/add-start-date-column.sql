-- Agregar columna StartDate a la tabla Memberships
ALTER TABLE "Memberships" 
  ADD COLUMN IF NOT EXISTS "StartDate" TIMESTAMP WITH TIME ZONE;

-- Comentario: Esta columna define cuándo comienza oficialmente la membresía
-- Si alguien compra antes de esta fecha, entrará en período de prueba (no se cobra)
-- hasta que llegue la fecha de inicio
