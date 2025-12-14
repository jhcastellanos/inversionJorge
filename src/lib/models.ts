import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Course Model
export const Course = {
  async findAll() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM "Courses" ORDER BY "CreatedAt" DESC');
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findActive() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM "Courses" WHERE "IsActive" = true ORDER BY "CreatedAt" DESC');
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findById(id: number) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM "Courses" WHERE "Id" = $1', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async create(data: { title: string; description: string; image_url: string; final_price: number; is_active: boolean; start_date?: string; end_date?: string }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO "Courses" ("Title", "Description", "ImageUrl", "Price", "IsActive", "StartDate", "EndDate", "CreatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
        [data.title, data.description, data.image_url, data.final_price, data.is_active, data.start_date || null, data.end_date || null]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async update(id: number, data: { title: string; description: string; image_url: string; final_price: number; is_active: boolean; start_date?: string; end_date?: string }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE "Courses" SET "Title"=$1, "Description"=$2, "ImageUrl"=$3, "Price"=$4, "IsActive"=$5, "StartDate"=$6, "EndDate"=$7 WHERE "Id"=$8 RETURNING *',
        [data.title, data.description, data.image_url, data.final_price, data.is_active, data.start_date || null, data.end_date || null, id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async delete(id: number) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM "Courses" WHERE "Id" = $1', [id]);
      return true;
    } finally {
      client.release();
    }
  }
};

// Customer Model
export const Customer = {
  async findByEmail(email: string) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM customers WHERE email = $1', [email]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async create(data: { email: string; full_name: string }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO customers (email, full_name, created_at) VALUES ($1, $2, NOW()) RETURNING *',
        [data.email, data.full_name]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async upsert(data: { email: string; full_name: string }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO customers (email, full_name, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (email) DO UPDATE SET full_name = $2 RETURNING *',
        [data.email, data.full_name]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
};

// Order Model (Uses Orders table)
export const Order = {
  async findByCourseId(courseId: number) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM "Orders" WHERE "CourseId" = $1 ORDER BY "CreatedAt" DESC',
        [courseId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findBySessionId(sessionId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM "Orders" WHERE "StripeSessionId" = $1',
        [sessionId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async create(data: { user_id: string; course_id: number; amount: number; stripe_session_id: string; stripe_payment_intent_id: string | null; payment_status: string; payment_provider: string; customer_email: string; customer_name: string }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO "Orders" ("UserId", "CourseId", "Amount", "StripeSessionId", "StripePaymentIntentId", "PaymentStatus", "PaymentProvider", "CustomerEmail", "CustomerName", "CreatedAt", "CompletedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *',
        [data.user_id, data.course_id, data.amount, data.stripe_session_id, data.stripe_payment_intent_id, data.payment_status, data.payment_provider, data.customer_email, data.customer_name]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
};

// Keep Purchase for backward compatibility (references Orders)
export const Purchase = Order;

// Admin User Model
export const AdminUser = {
  async findByUsername(username: string) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM admin_user WHERE username = $1', [username]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }
};
