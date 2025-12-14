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

  async create(data: { title: string; description: string; image_url: string; final_price: number; is_active: boolean }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO "Courses" ("Title", "Description", "ImageUrl", "Price", "IsActive", "CreatedAt") VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
        [data.title, data.description, data.image_url, data.final_price, data.is_active]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async update(id: number, data: { title: string; description: string; image_url: string; final_price: number; is_active: boolean }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE "Courses" SET "Title"=$1, "Description"=$2, "ImageUrl"=$3, "Price"=$4, "IsActive"=$5 WHERE "Id"=$6 RETURNING *',
        [data.title, data.description, data.image_url, data.final_price, data.is_active, id]
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

// Purchase Model
export const Purchase = {
  async findByCourseId(courseId: number) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT p.*, c.email, c.full_name FROM purchases p JOIN customers c ON p.customer_id = c.id WHERE p.course_id = $1 ORDER BY p.purchased_at DESC',
        [courseId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async create(data: { customer_id: number; course_id: number; purchase_code: string; amount_paid: number; payment_method: string; payment_status: string }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO purchases (customer_id, course_id, purchase_code, amount_paid, payment_method, payment_status, purchased_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
        [data.customer_id, data.course_id, data.purchase_code, data.amount_paid, data.payment_method, data.payment_status]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
};

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
