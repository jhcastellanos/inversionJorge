import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function POST() {
  try {
    await query(`
      ALTER TABLE "Memberships" 
        DROP COLUMN IF EXISTS "DiscountPrice",
        DROP COLUMN IF EXISTS "DiscountMonths",
        DROP COLUMN IF EXISTS "StartDate"
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Columnas de promoción eliminadas exitosamente' 
    });
  } catch (error: any) {
    console.error('Error al eliminar columnas:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
