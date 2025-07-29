-- Minimal sample data - just admin and one test client

-- Insert admin (if not exists)
INSERT INTO clients (username, password, password_changed) 
VALUES ('admin', 'admin123', true)
ON CONFLICT (username) DO NOTHING;

-- Insert one test client
INSERT INTO clients (username, password, created_at, password_changed) 
VALUES ('test_client', 'test123', NOW(), false)
ON CONFLICT (username) DO NOTHING;
