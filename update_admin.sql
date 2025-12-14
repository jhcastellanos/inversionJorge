-- Update admin credentials
UPDATE admin_user 
SET username = 'jhcastellanos', 
    password_hash = '$2a$10$3cW7BIgCo/kaWt6fYC1FJ.a87ZWzo9vijF.xNl3z.2JqR06XJ7T6q' 
WHERE username = 'admin';

-- Verify update
SELECT id, username, created_at FROM admin_user;
