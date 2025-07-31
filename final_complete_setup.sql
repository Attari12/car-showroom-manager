-- ==========================================
-- COMPLETE CAR MANAGEMENT SYSTEM DATABASE SETUP
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CREATE CORE TABLES
-- ==========================================

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed BOOLEAN DEFAULT FALSE
);

-- Create dealers table
CREATE TABLE IF NOT EXISTS dealers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    cnic VARCHAR(20) NOT NULL,
    license_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buyers table
CREATE TABLE IF NOT EXISTS buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    cnic VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cars table with all required fields
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    owner_name VARCHAR(100),
    registration_number VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    mileage INTEGER NOT NULL,
    purchase_price NUMERIC(12,2) NULL,
    asking_price NUMERIC(12,2) NULL,
    purchase_date DATE NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'pending')),
    condition VARCHAR(50) NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}',
    dealer_commission NUMERIC(12,2),
    dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buyer_debts table for debt management
CREATE TABLE IF NOT EXISTS buyer_debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('owed_to_client', 'owed_by_client')),
    description TEXT NOT NULL,
    documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_settled BOOLEAN DEFAULT FALSE,
    settled_date DATE,
    settled_amount DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dealer_debts table for debt management
CREATE TABLE IF NOT EXISTS dealer_debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('owed_to_client', 'owed_by_client')),
    description TEXT NOT NULL,
    documents TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_settled BOOLEAN DEFAULT FALSE,
    settled_date DATE,
    settled_amount DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_clients_username ON clients(username);
CREATE INDEX IF NOT EXISTS idx_cars_client_id ON cars(client_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_dealer_id ON cars(dealer_id);
CREATE INDEX IF NOT EXISTS idx_cars_buyer_id ON cars(buyer_id);
CREATE INDEX IF NOT EXISTS idx_dealers_client_id ON dealers(client_id);
CREATE INDEX IF NOT EXISTS idx_buyers_client_id ON buyers(client_id);
CREATE INDEX IF NOT EXISTS idx_buyer_debts_client_id ON buyer_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_buyer_debts_buyer_id ON buyer_debts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_debts_is_settled ON buyer_debts(is_settled);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_client_id ON dealer_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_dealer_id ON dealer_debts(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_is_settled ON dealer_debts(is_settled);

-- ==========================================
-- INSERT SAMPLE CLIENT DATA
-- ==========================================

INSERT INTO clients (username, password, created_at, password_changed) VALUES 
  ('test_client', 'test123', NOW(), false),
  ('sigma_motors', 'sigma123', NOW(), false),
  ('admin', 'admin123', NOW(), false)
ON CONFLICT (username) DO NOTHING;

-- ==========================================
-- INSERT COMPREHENSIVE SAMPLE DATA
-- ==========================================

DO $$
DECLARE
    test_client_id UUID;
    sigma_client_id UUID;
    admin_client_id UUID;
    dealer1_id UUID;
    dealer2_id UUID;
    dealer3_id UUID;
    buyer1_id UUID;
    buyer2_id UUID;
    buyer3_id UUID;
    buyer4_id UUID;
    car1_id UUID;
    car2_id UUID;
    car3_id UUID;
    car4_id UUID;
    car5_id UUID;
BEGIN
    -- Get client IDs
    SELECT id INTO test_client_id FROM clients WHERE username = 'test_client';
    SELECT id INTO sigma_client_id FROM clients WHERE username = 'sigma_motors';
    SELECT id INTO admin_client_id FROM clients WHERE username = 'admin';
    
    -- Insert dealers and get their IDs
    INSERT INTO dealers (client_id, name, email, phone, address, cnic, license_number) VALUES
    (test_client_id, 'Ahmed Motors', 'ahmed@motors.com', '+92-300-1234567', 'Main Market, Lahore', '35202-1234567-1', 'DL-001'),
    (test_client_id, 'Khan Automobiles', 'khan@autos.com', '+92-301-2345678', 'GT Road, Rawalpindi', '37405-2345678-2', 'DL-002'),
    (sigma_client_id, 'Premium Cars Islamabad', 'info@premium.com', '+92-302-3456789', 'Blue Area, Islamabad', '61101-3456789-3', 'DL-003')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO dealer1_id FROM dealers WHERE name = 'Ahmed Motors' AND client_id = test_client_id;
    SELECT id INTO dealer2_id FROM dealers WHERE name = 'Khan Automobiles' AND client_id = test_client_id;
    SELECT id INTO dealer3_id FROM dealers WHERE name = 'Premium Cars Islamabad' AND client_id = sigma_client_id;
    
    -- Insert buyers and get their IDs
    INSERT INTO buyers (client_id, name, email, phone, address, cnic) VALUES
    (test_client_id, 'Muhammad Ali Shah', 'ali@email.com', '+92-300-9876543', 'Model Town, Lahore', '35202-9876543-1'),
    (test_client_id, 'Sarah Khan', 'sarah@email.com', '+92-301-8765432', 'DHA Phase 5, Karachi', '42101-8765432-2'),
    (test_client_id, 'Ahmad Hassan', 'ahmad@email.com', '+92-302-7654321', 'F-7 Sector, Islamabad', '61101-7654321-3'),
    (sigma_client_id, 'Fatima Sheikh', 'fatima@email.com', '+92-303-6543210', 'Gulberg III, Lahore', '35202-6543210-4')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO buyer1_id FROM buyers WHERE name = 'Muhammad Ali Shah' AND client_id = test_client_id;
    SELECT id INTO buyer2_id FROM buyers WHERE name = 'Sarah Khan' AND client_id = test_client_id;
    SELECT id INTO buyer3_id FROM buyers WHERE name = 'Ahmad Hassan' AND client_id = test_client_id;
    SELECT id INTO buyer4_id FROM buyers WHERE name = 'Fatima Sheikh' AND client_id = sigma_client_id;
    
    -- Insert sample cars with comprehensive data
    INSERT INTO cars (id, client_id, make, model, year, owner_name, registration_number, color, mileage, purchase_price, asking_price, purchase_date, status, condition, description, dealer_id, buyer_id, dealer_commission) VALUES
    (uuid_generate_v4(), test_client_id, 'Toyota', 'Corolla GLi', 2020, 'Original Owner', 'LEA-1234', 'Pearl White', 45000, 3200000, 3500000, '2023-01-15', 'available', 'Excellent', 'Well maintained family car with complete service history. Non-accidental, first owner, all documents clear.', dealer1_id, NULL, 100000),
    (uuid_generate_v4(), test_client_id, 'Honda', 'Civic Oriel', 2019, 'Company Vehicle', 'LEB-5678', 'Silver Metallic', 52000, 2800000, 3100000, '2023-02-20', 'sold', 'Good', 'Clean corporate car with minor wear and tear. Regular maintenance done.', dealer2_id, buyer1_id, 150000),
    (uuid_generate_v4(), test_client_id, 'Suzuki', 'Alto VXR', 2021, 'Lady Driven', 'LEC-9012', 'Candy Red', 28000, 1800000, 2000000, '2023-03-10', 'available', 'Excellent', 'Brand new condition with remaining warranty. Perfect for city driving.', NULL, NULL, NULL),
    (uuid_generate_v4(), sigma_client_id, 'BMW', 'X3 xDrive30i', 2018, 'Import Direct', 'LED-3456', 'Jet Black', 68000, 7500000, 8200000, '2023-04-05', 'reserved', 'Good', 'Luxury SUV with premium features. Imported from Japan with complete auction sheet.', dealer3_id, NULL, 300000),
    (uuid_generate_v4(), sigma_client_id, 'Mercedes-Benz', 'C200 AMG Line', 2019, 'Lease Return', 'LEE-7890', 'Brilliant Blue', 42000, 6200000, 6800000, '2023-04-15', 'sold', 'Excellent', 'Executive sedan in pristine condition. Full service history available.', dealer3_id, buyer4_id, 250000)
    ON CONFLICT (id) DO NOTHING;
    
    -- Add more cars for better inventory display
    INSERT INTO cars (client_id, make, model, year, owner_name, registration_number, color, mileage, purchase_price, asking_price, purchase_date, status, condition, description, dealer_id, buyer_id, dealer_commission) VALUES
    (test_client_id, 'Toyota', 'Camry Grande', 2017, 'Bank Auction', 'LEB-2468', 'Champagne Gold', 89000, 4200000, 4600000, '2023-05-01', 'available', 'Good', 'Mid-size luxury sedan with leather interior. Needs minor touch-up.', dealer1_id, NULL, 120000),
    (test_client_id, 'Honda', 'City Aspire', 2018, 'Doctor Owner', 'LEC-1357', 'Taffeta White', 71000, 2400000, 2750000, '2023-05-10', 'available', 'Excellent', 'Well-maintained sedan with genuine parts only. Complete record available.', NULL, NULL, NULL),
    (test_client_id, 'Suzuki', 'Cultus VXL', 2020, 'Expat Owned', 'LEA-9753', 'Graphite Grey', 35000, 1650000, 1850000, '2023-05-15', 'pending', 'Excellent', 'Low mileage hatchback. Expat leaving country sale.', dealer2_id, NULL, 80000),
    (sigma_client_id, 'Audi', 'A4 TFSI', 2017, 'Businessman', 'LED-8642', 'Glacier White', 95000, 5800000, 6300000, '2023-05-20', 'available', 'Good', 'German engineering with quattro AWD. Premium interior with sunroof.', dealer3_id, NULL, 200000),
    (sigma_client_id, 'Toyota', 'Land Cruiser VX', 2016, 'Embassy Vehicle', 'LEE-1975', 'Desert Beige', 125000, 12500000, 13800000, '2023-05-25', 'available', 'Good', 'Bulletproof SUV with premium features. Diplomatic use with maintenance records.', NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;
    
    -- Insert sample debt records
    INSERT INTO buyer_debts (client_id, buyer_id, amount, type, description, is_settled, documents) VALUES
    (test_client_id, buyer1_id, 50000, 'owed_to_client', 'Remaining payment for Honda Civic Oriel - final installment due', false, ARRAY['receipt_001.pdf']),
    (test_client_id, buyer2_id, 25000, 'owed_by_client', 'Advance payment received for future car purchase', false, ARRAY['advance_receipt.pdf'])
    ON CONFLICT DO NOTHING;
    
    INSERT INTO dealer_debts (client_id, dealer_id, amount, type, description, is_settled, documents) VALUES
    (test_client_id, dealer1_id, 75000, 'owed_by_client', 'Commission payment pending for Toyota Corolla sale', false, ARRAY['commission_note.pdf']),
    (sigma_client_id, dealer3_id, 125000, 'owed_by_client', 'Outstanding commission for Mercedes C200 sale', false, ARRAY['dealer_invoice.pdf'])
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample data inserted successfully with comprehensive car inventory';
END $$;

-- ==========================================
-- CREATE STORAGE BUCKETS
-- ==========================================

INSERT INTO storage.buckets (id, name, public) VALUES 
  ('car-images', 'car-images', true),
  ('car-documents', 'car-documents', true),
  ('debt-documents', 'debt-documents', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- SETUP ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_debts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Enable all operations for clients" ON clients;
DROP POLICY IF EXISTS "Enable all operations for cars" ON cars;
DROP POLICY IF EXISTS "Enable all operations for dealers" ON dealers;
DROP POLICY IF EXISTS "Enable all operations for buyers" ON buyers;
DROP POLICY IF EXISTS "Enable all operations for buyer_debts" ON buyer_debts;
DROP POLICY IF EXISTS "Enable all operations for dealer_debts" ON dealer_debts;

-- Create new policies
CREATE POLICY "Enable all operations for clients" ON clients FOR ALL USING (true);
CREATE POLICY "Enable all operations for cars" ON cars FOR ALL USING (true);
CREATE POLICY "Enable all operations for dealers" ON dealers FOR ALL USING (true);
CREATE POLICY "Enable all operations for buyers" ON buyers FOR ALL USING (true);
CREATE POLICY "Enable all operations for buyer_debts" ON buyer_debts FOR ALL USING (true);
CREATE POLICY "Enable all operations for dealer_debts" ON dealer_debts FOR ALL USING (true);

-- ==========================================
-- SETUP STORAGE POLICIES
-- ==========================================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow public read access on car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on car documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload car documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update car documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete car documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access on debt documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload debt documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update debt documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete debt documents" ON storage.objects;

-- Create storage policies for car-images
CREATE POLICY "Allow public read access on car images" ON storage.objects FOR SELECT USING (bucket_id = 'car-images');
CREATE POLICY "Allow authenticated users to upload car images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'car-images');
CREATE POLICY "Allow authenticated users to update car images" ON storage.objects FOR UPDATE USING (bucket_id = 'car-images');
CREATE POLICY "Allow authenticated users to delete car images" ON storage.objects FOR DELETE USING (bucket_id = 'car-images');

-- Create storage policies for car-documents
CREATE POLICY "Allow public read access on car documents" ON storage.objects FOR SELECT USING (bucket_id = 'car-documents');
CREATE POLICY "Allow authenticated users to upload car documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'car-documents');
CREATE POLICY "Allow authenticated users to update car documents" ON storage.objects FOR UPDATE USING (bucket_id = 'car-documents');
CREATE POLICY "Allow authenticated users to delete car documents" ON storage.objects FOR DELETE USING (bucket_id = 'car-documents');

-- Create storage policies for debt-documents
CREATE POLICY "Allow public read access on debt documents" ON storage.objects FOR SELECT USING (bucket_id = 'debt-documents');
CREATE POLICY "Allow authenticated users to upload debt documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'debt-documents');
CREATE POLICY "Allow authenticated users to update debt documents" ON storage.objects FOR UPDATE USING (bucket_id = 'debt-documents');
CREATE POLICY "Allow authenticated users to delete debt documents" ON storage.objects FOR DELETE USING (bucket_id = 'debt-documents');

-- ==========================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_dealers_updated_at ON dealers;
DROP TRIGGER IF EXISTS update_buyers_updated_at ON buyers;
DROP TRIGGER IF EXISTS update_cars_updated_at ON cars;
DROP TRIGGER IF EXISTS update_buyer_debts_updated_at ON buyer_debts;
DROP TRIGGER IF EXISTS update_dealer_debts_updated_at ON dealer_debts;

CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON dealers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyer_debts_updated_at BEFORE UPDATE ON buyer_debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealer_debts_updated_at BEFORE UPDATE ON dealer_debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- FINAL VERIFICATION
-- ==========================================

-- Display summary of created data
SELECT 
    'Setup Complete!' as status,
    (SELECT COUNT(*) FROM clients) as total_clients,
    (SELECT COUNT(*) FROM cars) as total_cars,
    (SELECT COUNT(*) FROM dealers) as total_dealers,
    (SELECT COUNT(*) FROM buyers) as total_buyers,
    (SELECT COUNT(*) FROM buyer_debts) as buyer_debts,
    (SELECT COUNT(*) FROM dealer_debts) as dealer_debts;

-- Show sample data overview
SELECT 'Cars by Status' as overview;
SELECT status, COUNT(*) as count FROM cars GROUP BY status ORDER BY status;

SELECT 'Cars by Client' as overview;
SELECT c.username, COUNT(cars.*) as car_count 
FROM clients c 
LEFT JOIN cars ON c.id = cars.client_id 
GROUP BY c.username 
ORDER BY car_count DESC;

NOTIFY pgrst, 'reload schema';

-- ==========================================
-- SCRIPT COMPLETION MESSAGE
-- ==========================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'CAR MANAGEMENT SYSTEM SETUP COMPLETED!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Created tables: clients, cars, dealers, buyers, buyer_debts, dealer_debts';
    RAISE NOTICE 'Sample data: 3 clients, 10 cars, 3 dealers, 4 buyers';
    RAISE NOTICE 'Storage buckets: car-images, car-documents, debt-documents';
    RAISE NOTICE 'All policies and indexes created successfully';
    RAISE NOTICE 'Your car management system is ready to use!';
    RAISE NOTICE '============================================';
END $$;
