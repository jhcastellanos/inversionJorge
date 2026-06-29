import { Pool } from '@neondatabase/serverless';

/**
 * Seed de los 3 planes de membresía (Mensual, Trimestral, Semestral).
 *
 * Qué hace:
 *  1. Desactiva TODAS las membresías activas actuales (incluida la antigua de
 *     $150). No se borran: quedan en la BD como inactivas, así no rompemos
 *     suscripciones existentes ni el historial.
 *  2. Crea/actualiza (upsert por nombre) los 3 planes nuevos y los deja activos.
 *
 * Es idempotente: puedes ejecutarlo varias veces sin duplicar planes.
 *
 * IMPORTANTE sobre el precio:
 *   "MonthlyPrice" guarda el equivalente MENSUAL. El cobro real en Stripe es
 *   MonthlyPrice * meses del plan (1 / 3 / 6). El portal calcula el total y el
 *   ahorro automáticamente a partir de este valor.
 *     - Mensual:   $200/mes  -> cobro $200 cada mes
 *     - Trimestral:$180/mes  -> cobro $540 cada 3 meses (ahorras $20/mes)
 *     - Semestral: $150/mes  -> cobro $900 cada 6 meses (ahorras $50/mes)
 *
 * Cómo ejecutarlo (apuntando a la BD que quieras, p. ej. producción):
 *   DATABASE_URL="postgresql://...." node scripts/seed-membership-plans.mjs
 */

const PLANS = [
  {
    name: 'Mensual',
    description:
      'Plan flexible mes a mes. Ideal para empezar y vivir el trading en vivo con nosotros.',
    monthlyPrice: 200,
    benefits: [
      'Acceso al canal de trading en vivo con nosotros',
      'Acceso a las clases grabadas',
    ],
  },
  {
    name: 'Trimestral',
    description:
      'El más popular. 3 meses de acompañamiento con acceso completo a clases en vivo y nuevo material.',
    monthlyPrice: 180,
    benefits: [
      'Acceso al canal de trading en vivo con nosotros',
      'Acceso a las clases grabadas',
      'Acceso a todas las clases en vivo',
      'Todo el nuevo material educativo (grabado y presencial)',
    ],
  },
  {
    name: 'Semestral',
    description:
      'La experiencia completa. 6 meses con todo lo anterior más una sesión 1-a-1 mensual personalizada.',
    monthlyPrice: 150,
    benefits: [
      'Acceso al canal de trading en vivo con nosotros',
      'Acceso a las clases grabadas',
      'Acceso a todas las clases en vivo',
      'Todo el nuevo material educativo (grabado y presencial)',
      'Sesión 1-a-1 mensual: revisión de tu plan, estructuración de portafolio en todos los tipos de inversión, dudas, configuración de plataformas y recomendaciones',
    ],
  },
];

const TEMPORARY_PLAN = {
  name: 'Mensual Temporal $150',
  description:
    'Oferta temporal por tiempo limitado. Acceso mensual al canal de trading en vivo y clases grabadas.',
  monthlyPrice: 150,
  benefits: [
    'Acceso al canal de trading en vivo con nosotros',
    'Acceso a las clases grabadas',
  ],
};

const MANAGED_PLAN_NAMES = [...PLANS.map((p) => p.name), TEMPORARY_PLAN.name];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Falta la variable DATABASE_URL.');
    console.error('   Ejecuta: DATABASE_URL="postgresql://..." node scripts/seed-membership-plans.mjs');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    console.log('🔄 Desactivando membresías legacy (excepto planes gestionados)...');
    const deactivated = await client.query(
      `UPDATE "Memberships" SET "IsActive" = false
       WHERE "IsActive" = true AND "Name" <> ALL($1::text[])`,
      [MANAGED_PLAN_NAMES]
    );
    console.log(`   ✅ ${deactivated.rowCount} membresía(s) legacy desactivada(s).`);

    for (const plan of PLANS) {
      const benefitsText = plan.benefits.join('\n');

      const updated = await client.query(
        `UPDATE "Memberships"
           SET "Description" = $2,
               "MonthlyPrice" = $3,
               "Benefits" = $4,
               "IsActive" = true
         WHERE "Name" = $1
         RETURNING "Id"`,
        [plan.name, plan.description, plan.monthlyPrice, benefitsText]
      );

      if (updated.rowCount > 0) {
        console.log(`   ♻️  Plan "${plan.name}" actualizado (id ${updated.rows[0].Id}).`);
      } else {
        const inserted = await client.query(
          `INSERT INTO "Memberships" ("Name", "Description", "MonthlyPrice", "Benefits", "IsActive", "CreatedAt")
           VALUES ($1, $2, $3, $4, true, NOW())
           RETURNING "Id"`,
          [plan.name, plan.description, plan.monthlyPrice, benefitsText]
        );
        console.log(`   ➕ Plan "${plan.name}" creado (id ${inserted.rows[0].Id}).`);
      }
    }

    // Membresía temporal $150: siempre existe, oculta por defecto al crear.
    // Al actualizar NO tocamos IsActive (lo controla el panel admin).
    {
      const plan = TEMPORARY_PLAN;
      const benefitsText = plan.benefits.join('\n');
      const updated = await client.query(
        `UPDATE "Memberships"
           SET "Description" = $2,
               "MonthlyPrice" = $3,
               "Benefits" = $4
         WHERE "Name" = $1
         RETURNING "Id"`,
        [plan.name, plan.description, plan.monthlyPrice, benefitsText]
      );

      if (updated.rowCount > 0) {
        console.log(`   ♻️  Plan "${plan.name}" actualizado (id ${updated.rows[0].Id}, IsActive sin cambios).`);
      } else {
        const inserted = await client.query(
          `INSERT INTO "Memberships" ("Name", "Description", "MonthlyPrice", "Benefits", "IsActive", "CreatedAt")
           VALUES ($1, $2, $3, $4, false, NOW())
           RETURNING "Id"`,
          [plan.name, plan.description, plan.monthlyPrice, benefitsText]
        );
        console.log(`   ➕ Plan "${plan.name}" creado inactivo (id ${inserted.rows[0].Id}).`);
      }
    }

    console.log('\n🎉 Seed completado. Planes activos: Mensual, Trimestral, Semestral.');
    console.log('   Membresía temporal $150: oculta hasta activarla en Admin → Membresías.');
    console.log('   Recuerda: el cobro = MonthlyPrice x meses (1/3/6).');
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
