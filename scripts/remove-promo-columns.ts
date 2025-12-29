import { query } from '../src/lib/db';

async function removePromoColumns() {
  try {
    await query(`
      ALTER TABLE "Memberships" 
        DROP COLUMN IF EXISTS "DiscountPrice",
        DROP COLUMN IF EXISTS "DiscountMonths",
        DROP COLUMN IF EXISTS "StartDate"
    `);
    console.log('✅ Columnas de promoción eliminadas exitosamente');
  } catch (error) {
    console.error('❌ Error al eliminar columnas:', error);
  }
}

removePromoColumns();
