-- Create admin_user table if not exists
CREATE TABLE IF NOT EXISTS admin_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_user (username, password_hash) 
VALUES ('admin', '$2a$10$XqZ8J8K7vZ8K7vZ8K7vZ8OzM7vZ8K7vZ8K7vZ8K7vZ8K7vZ8K7vZ8')
ON CONFLICT (username) DO NOTHING;
