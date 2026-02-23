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

// Membership Model
export const Membership = {
  async findAll() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM "Memberships" ORDER BY "CreatedAt" DESC');
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findActive() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM "Memberships" WHERE "IsActive" = true ORDER BY "CreatedAt" DESC');
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findById(id: number) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM "Memberships" WHERE "Id" = $1', [id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async create(data: { name: string; description: string; monthly_price: number; benefits: string; is_active: boolean; image_url?: string | null; start_date?: Date | null }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO "Memberships" ("Name", "Description", "MonthlyPrice", "Benefits", "IsActive", "ImageUrl", "StartDate", "CreatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
        [data.name, data.description, data.monthly_price, data.benefits, data.is_active, data.image_url || null, data.start_date || null]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async update(id: number, data: { name: string; description: string; monthly_price: number; benefits: string; is_active: boolean; image_url?: string | null; start_date?: Date | null }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE "Memberships" SET "Name"=$1, "Description"=$2, "MonthlyPrice"=$3, "Benefits"=$4, "IsActive"=$5, "ImageUrl"=$6, "StartDate"=$7 WHERE "Id"=$8 RETURNING *',
        [data.name, data.description, data.monthly_price, data.benefits, data.is_active, data.image_url || null, data.start_date || null, id]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async delete(id: number) {
    const client = await pool.connect();
    try {
      // Check if there are any subscriptions using this membership
      const subscriptionCheck = await client.query(
        'SELECT COUNT(*) as count FROM "Subscriptions" WHERE "MembershipId" = $1',
        [id]
      );
      
      const subscriptionCount = parseInt(subscriptionCheck.rows[0].count);
      
      if (subscriptionCount > 0) {
        throw new Error(`No se puede eliminar la membresía porque tiene ${subscriptionCount} suscripción(es) activa(s). Primero debe cancelar todas las suscripciones asociadas.`);
      }
      
      await client.query('DELETE FROM "Memberships" WHERE "Id" = $1', [id]);
      return true;
    } finally {
      client.release();
    }
  }
};

// Subscription Model
export const Subscription = {
  async findAll() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT s.*, 
                m."Name" as "MembershipName", 
                m."MonthlyPrice",
                dc."DiscordUsername"
         FROM "Subscriptions" s 
         JOIN "Memberships" m ON s."MembershipId" = m."Id"
         LEFT JOIN "DiscordConnections" dc ON s."CustomerEmail" = dc."CustomerEmail"
         ORDER BY s."CreatedAt" DESC`
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findByEmail(email: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT s.*, m."Name" as "MembershipName", m."MonthlyPrice" FROM "Subscriptions" s JOIN "Memberships" m ON s."MembershipId" = m."Id" WHERE s."CustomerEmail" = $1 AND s."Status" = \'active\' ORDER BY s."CreatedAt" DESC',
        [email]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async findByStripeId(stripeSubscriptionId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT s.*, m."Name" as "MembershipName" 
         FROM "Subscriptions" s
         LEFT JOIN "Memberships" m ON s."MembershipId" = m."Id"
         WHERE s."StripeSubscriptionId" = $1`,
        [stripeSubscriptionId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async create(data: { membership_id: number; customer_email: string; customer_name: string; stripe_subscription_id: string; stripe_customer_id: string; current_period_start: Date; current_period_end: Date }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO "Subscriptions" ("MembershipId", "CustomerEmail", "CustomerName", "StripeSubscriptionId", "StripeCustomerId", "Status", "CurrentPeriodStart", "CurrentPeriodEnd", "CreatedAt") VALUES ($1, $2, $3, $4, $5, \'active\', $6, $7, NOW()) RETURNING *',
        [data.membership_id, data.customer_email, data.customer_name, data.stripe_subscription_id, data.stripe_customer_id, data.current_period_start, data.current_period_end]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async updateStatus(stripeSubscriptionId: string, status: string, cancelAtPeriodEnd: boolean = false) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE "Subscriptions" SET "Status"=$1, "CancelAtPeriodEnd"=$2, "CanceledAt"=$3 WHERE "StripeSubscriptionId"=$4 RETURNING *',
        [status, cancelAtPeriodEnd, status === 'canceled' ? new Date() : null, stripeSubscriptionId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async updateDiscordUserId(stripeSubscriptionId: string, discordUserId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE "Subscriptions" SET "DiscordUserId"=$1 WHERE "StripeSubscriptionId"=$2 RETURNING *',
        [discordUserId, stripeSubscriptionId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }
};

// Discord Connection Model
export const DiscordConnection = {
  async findByEmail(email: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM "DiscordConnections" WHERE "CustomerEmail" = $1',
        [email]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async findByDiscordUserId(discordUserId: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM "DiscordConnections" WHERE "DiscordUserId" = $1',
        [discordUserId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async create(data: { customer_email: string; discord_user_id: string; discord_username: string; discord_access_token?: string; discord_refresh_token?: string }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO "DiscordConnections" ("CustomerEmail", "DiscordUserId", "DiscordUsername", "DiscordAccessToken", "DiscordRefreshToken", "CreatedAt", "UpdatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
        [data.customer_email, data.discord_user_id, data.discord_username, data.discord_access_token || null, data.discord_refresh_token || null]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async update(email: string, data: { discord_user_id: string; discord_username: string; discord_access_token?: string; discord_refresh_token?: string }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE "DiscordConnections" SET "DiscordUserId"=$1, "DiscordUsername"=$2, "DiscordAccessToken"=$3, "DiscordRefreshToken"=$4, "UpdatedAt"=NOW() WHERE "CustomerEmail"=$5 RETURNING *',
        [data.discord_user_id, data.discord_username, data.discord_access_token || null, data.discord_refresh_token || null, email]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async delete(email: string) {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM "DiscordConnections" WHERE "CustomerEmail" = $1', [email]);
      return true;
    } finally {
      client.release();
    }
  }
};

// Contract Model - Store PDF documents
export const Contract = {
  async findBySubscriptionId(subscriptionId: number) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM "Contracts" WHERE "SubscriptionId" = $1',
        [subscriptionId]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async findByEmail(email: string) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM "Contracts" WHERE "CustomerEmail" = $1 ORDER BY "CreatedAt" DESC',
        [email]
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async create(data: { subscription_id: number; customer_email: string; customer_name: string; pdf_content: Buffer; acceptance_date: Date }) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO "Contracts" ("SubscriptionId", "CustomerEmail", "CustomerName", "PdfContent", "AcceptanceDate", "CreatedAt") VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING "Id", "SubscriptionId", "CustomerEmail", "CustomerName", "AcceptanceDate", "CreatedAt"',
        [data.subscription_id, data.customer_email, data.customer_name, data.pdf_content, data.acceptance_date]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async getPdfContent(contractId: number) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT "PdfContent" FROM "Contracts" WHERE "Id" = $1',
        [contractId]
      );
      return result.rows[0]?.PdfContent;
    } finally {
      client.release();
    }
  }
};
