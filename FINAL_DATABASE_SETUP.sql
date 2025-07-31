-- ==========================================
-- COMPLETE CAR SHOWROOM MANAGEMENT SYSTEM
-- FINAL DATABASE SETUP for Supabase
-- Run this entire script in Supabase SQL Editor
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CLEAN SLATE - CAREFUL TABLE DROPS
-- ==========================================

-- Drop tables in reverse dependency order (only if they exist)
DROP TABLE IF EXISTS profit_distributions CASCADE;
DROP TABLE IF EXISTS car_investments CASCADE;
DROP TABLE IF EXISTS seller_debts CASCADE;
DROP TABLE IF EXISTS investor_debts CASCADE;
DROP TABLE IF EXISTS buyer_debts CASCADE;
DROP TABLE IF EXISTS dealer_debts CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS sellers CASCADE;
DROP TABLE IF EXISTS investors CASCADE;
DROP TABLE IF EXISTS buyers CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
-- Keep clients table with existing data if any
-- DROP TABLE IF EXISTS clients CASCADE;

-- ==========================================
-- CREATE CORE TABLES
-- ==========================================

-- Create clients table (if not exists)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed BOOLEAN DEFAULT FALSE
);

-- Create dealers table
CREATE TABLE dealers (
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
CREATE TABLE buyers (
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

-- Create investors table
CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    cnic VARCHAR(20) NOT NULL,
    total_investment NUMERIC(15,2) DEFAULT 0,
    total_profit NUMERIC(15,2) DEFAULT 0,
    active_investments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sellers table
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    cnic VARCHAR(20) NOT NULL,
    total_cars_sold INTEGER DEFAULT 0,
    total_amount_paid NUMERIC(15,2) DEFAULT 0,
    last_sale_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced cars table with all features
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    owner_name VARCHAR(100),
    registration_number VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    mileage INTEGER NOT NULL,
    purchase_price NUMERIC(12,2) NULL,
    asking_price NUMERIC(12,2) NULL,
    purchase_date DATE NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'pending')),
    description TEXT,
    images TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}',
    auction_sheet JSONB,
    
    -- Commission fields
    purchase_commission NUMERIC(12,2) DEFAULT 0,
    dealer_commission NUMERIC(12,2),
    
    -- Investment & Ownership tracking
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    showroom_investment NUMERIC(12,2) DEFAULT 0,
    ownership_type VARCHAR(20) DEFAULT 'partially_owned' CHECK (ownership_type IN ('partially_owned', 'fully_investor_owned')),
    commission_type VARCHAR(10) DEFAULT 'flat' CHECK (commission_type IN ('flat', 'percentage')),
    commission_amount NUMERIC(12,2) DEFAULT 0,
    commission_percentage NUMERIC(5,2) DEFAULT 0,
    
    -- Existing fields
    dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Car investments table (many-to-many relationship)
CREATE TABLE car_investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    investment_amount NUMERIC(12,2) NOT NULL,
    ownership_percentage NUMERIC(5,2) NOT NULL,
    profit_earned NUMERIC(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(car_id, investor_id)
);

-- Profit distributions table for tracking individual sale profits
CREATE TABLE profit_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    sale_price NUMERIC(12,2) NOT NULL,
    total_profit NUMERIC(12,2) NOT NULL,
    showroom_profit NUMERIC(12,2) NOT NULL,
    showroom_profit_source VARCHAR(20) CHECK (showroom_profit_source IN ('ownership', 'commission')),
    investor_profit NUMERIC(12,2) NOT NULL,
    distribution_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- CREATE ALL DEBT MANAGEMENT TABLES
-- ==========================================

-- Create buyer_debts table
CREATE TABLE buyer_debts (
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

-- Create dealer_debts table
CREATE TABLE dealer_debts (
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

-- Create seller_debts table
CREATE TABLE seller_debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
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

-- Create investor_debts table
CREATE TABLE investor_debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_cars_seller_id ON cars(seller_id);
CREATE INDEX IF NOT EXISTS idx_cars_ownership_type ON cars(ownership_type);
CREATE INDEX IF NOT EXISTS idx_dealers_client_id ON dealers(client_id);
CREATE INDEX IF NOT EXISTS idx_buyers_client_id ON buyers(client_id);
CREATE INDEX IF NOT EXISTS idx_investors_client_id ON investors(client_id);
CREATE INDEX IF NOT EXISTS idx_sellers_client_id ON sellers(client_id);
CREATE INDEX IF NOT EXISTS idx_car_investments_car_id ON car_investments(car_id);
CREATE INDEX IF NOT EXISTS idx_car_investments_investor_id ON car_investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_car_investments_is_active ON car_investments(is_active);
CREATE INDEX IF NOT EXISTS idx_profit_distributions_car_id ON profit_distributions(car_id);

-- Debt table indexes
CREATE INDEX IF NOT EXISTS idx_buyer_debts_client_id ON buyer_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_buyer_debts_buyer_id ON buyer_debts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_debts_is_settled ON buyer_debts(is_settled);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_client_id ON dealer_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_dealer_id ON dealer_debts(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_is_settled ON dealer_debts(is_settled);
CREATE INDEX IF NOT EXISTS idx_seller_debts_client_id ON seller_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_seller_debts_seller_id ON seller_debts(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_debts_is_settled ON seller_debts(is_settled);
CREATE INDEX IF NOT EXISTS idx_investor_debts_client_id ON investor_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_investor_debts_investor_id ON investor_debts(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_debts_is_settled ON investor_debts(is_settled);

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
    investor1_id UUID;
    investor2_id UUID;
    investor3_id UUID;
    seller1_id UUID;
    seller2_id UUID;
    seller3_id UUID;
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
    
    -- Insert dealers
    INSERT INTO dealers (client_id, name, email, phone, address, cnic, license_number) VALUES
    (test_client_id, 'Ahmed Motors', 'ahmed@motors.com', '+92-300-1234567', 'Main Market, Lahore', '35202-1234567-1', 'DL-001'),
    (test_client_id, 'Khan Automobiles', 'khan@autos.com', '+92-301-2345678', 'GT Road, Rawalpindi', '37405-2345678-2', 'DL-002'),
    (sigma_client_id, 'Premium Cars Islamabad', 'info@premium.com', '+92-302-3456789', 'Blue Area, Islamabad', '61101-3456789-3', 'DL-003');
    
    SELECT id INTO dealer1_id FROM dealers WHERE name = 'Ahmed Motors' AND client_id = test_client_id;
    SELECT id INTO dealer2_id FROM dealers WHERE name = 'Khan Automobiles' AND client_id = test_client_id;
    SELECT id INTO dealer3_id FROM dealers WHERE name = 'Premium Cars Islamabad' AND client_id = sigma_client_id;
    
    -- Insert buyers
    INSERT INTO buyers (client_id, name, email, phone, address, cnic) VALUES
    (test_client_id, 'Muhammad Ali Shah', 'ali@email.com', '+92-300-9876543', 'Model Town, Lahore', '35202-9876543-1'),
    (test_client_id, 'Sarah Khan', 'sarah@email.com', '+92-301-8765432', 'DHA Phase 5, Karachi', '42101-8765432-2'),
    (test_client_id, 'Ahmad Hassan', 'ahmad@email.com', '+92-302-7654321', 'F-7 Sector, Islamabad', '61101-7654321-3'),
    (sigma_client_id, 'Fatima Sheikh', 'fatima@email.com', '+92-303-6543210', 'Gulberg III, Lahore', '35202-6543210-4');
    
    SELECT id INTO buyer1_id FROM buyers WHERE name = 'Muhammad Ali Shah' AND client_id = test_client_id;
    SELECT id INTO buyer2_id FROM buyers WHERE name = 'Sarah Khan' AND client_id = test_client_id;
    SELECT id INTO buyer3_id FROM buyers WHERE name = 'Ahmad Hassan' AND client_id = test_client_id;
    SELECT id INTO buyer4_id FROM buyers WHERE name = 'Fatima Sheikh' AND client_id = sigma_client_id;
    
    -- Insert investors
    INSERT INTO investors (client_id, name, email, phone, address, cnic, total_investment, total_profit, active_investments) VALUES
    (test_client_id, 'Ahmed Ali', 'ahmed@example.com', '+92-300-1234567', 'Lahore, Pakistan', '42101-1234567-1', 500000, 75000, 2),
    (test_client_id, 'Sara Khan', 'sara.investor@email.com', '+92-301-9876543', 'Karachi, Pakistan', '42201-9876543-2', 750000, 125000, 3),
    (sigma_client_id, 'Hassan Sheikh', 'hassan@email.com', '+92-302-5555555', 'Islamabad, Pakistan', '61101-5555555-5', 1000000, 150000, 1);
    
    SELECT id INTO investor1_id FROM investors WHERE name = 'Ahmed Ali' AND client_id = test_client_id;
    SELECT id INTO investor2_id FROM investors WHERE name = 'Sara Khan' AND client_id = test_client_id;
    SELECT id INTO investor3_id FROM investors WHERE name = 'Hassan Sheikh' AND client_id = sigma_client_id;
    
    -- Insert sellers
    INSERT INTO sellers (client_id, name, email, phone, address, cnic, total_cars_sold, total_amount_paid, last_sale_date) VALUES
    (test_client_id, 'Muhammad Hassan', 'hassan.seller@email.com', '+92-302-5678901', 'Islamabad, Pakistan', '42301-5678901-3', 8, 2400000, '2024-01-15'),
    (test_client_id, 'Fatima Sheikh', 'fatima.seller@email.com', '+92-303-1122334', 'Faisalabad, Pakistan', '42401-1122334-4', 5, 1850000, '2024-01-20'),
    (sigma_client_id, 'Ali Ahmad', 'ali.seller@email.com', '+92-304-9999999', 'Lahore, Pakistan', '35202-9999999-9', 3, 900000, '2024-01-10');
    
    SELECT id INTO seller1_id FROM sellers WHERE name = 'Muhammad Hassan' AND client_id = test_client_id;
    SELECT id INTO seller2_id FROM sellers WHERE name = 'Fatima Sheikh' AND client_id = test_client_id;
    SELECT id INTO seller3_id FROM sellers WHERE name = 'Ali Ahmad' AND client_id = sigma_client_id;
    
    -- Insert sample cars with purchase commission
    car1_id := uuid_generate_v4();
    car2_id := uuid_generate_v4();
    car3_id := uuid_generate_v4();
    car4_id := uuid_generate_v4();
    car5_id := uuid_generate_v4();
    
    INSERT INTO cars (id, client_id, make, model, year, owner_name, registration_number, color, condition, mileage, purchase_price, asking_price, purchase_date, status, description, dealer_id, buyer_id, dealer_commission, purchase_commission, seller_id, showroom_investment, ownership_type, commission_type, commission_amount, commission_percentage) VALUES
    (car1_id, test_client_id, 'Toyota', 'Corolla GLi', 2020, 'Original Owner', 'LEA-1234', 'Pearl White', 'Excellent', 45000, 3200000, 3500000, '2023-01-15', 'available', 'Well maintained family car with complete service history.', dealer1_id, NULL, 100000, 50000, seller1_id, 2000000, 'partially_owned', 'flat', 0, 0),
    (car2_id, test_client_id, 'Honda', 'Civic Oriel', 2019, 'Company Vehicle', 'LEB-5678', 'Silver Metallic', 'Good', 52000, 2800000, 3100000, '2023-02-20', 'sold', 'Clean corporate car with minor wear and tear.', dealer2_id, buyer1_id, 150000, 75000, seller2_id, 0, 'fully_investor_owned', 'percentage', 0, 15),
    (car3_id, test_client_id, 'Suzuki', 'Alto VXR', 2021, 'Lady Driven', 'LEC-9012', 'Candy Red', 'Excellent', 28000, 1800000, 2000000, '2023-03-10', 'available', 'Brand new condition with remaining warranty.', NULL, NULL, NULL, 25000, NULL, 1800000, 'partially_owned', 'flat', 0, 0),
    (car4_id, sigma_client_id, 'BMW', 'X3 xDrive30i', 2018, 'Import Direct', 'LED-3456', 'Jet Black', 'Good', 68000, 7500000, 8200000, '2023-04-05', 'reserved', 'Luxury SUV with premium features.', dealer3_id, NULL, 300000, 150000, NULL, 4000000, 'partially_owned', 'flat', 0, 0),
    (car5_id, sigma_client_id, 'Mercedes-Benz', 'C200 AMG Line', 2019, 'Lease Return', 'LEE-7890', 'Brilliant Blue', 'Excellent', 42000, 6200000, 6800000, '2023-04-15', 'sold', 'Executive sedan in pristine condition.', dealer3_id, buyer4_id, 250000, 100000, NULL, 3000000, 'partially_owned', 'flat', 0, 0);
    
    -- Insert car investments
    INSERT INTO car_investments (car_id, investor_id, investment_amount, ownership_percentage, is_active) VALUES
    (car1_id, investor1_id, 1200000, 37.5, true),
    (car2_id, investor2_id, 2800000, 100, false),
    (car1_id, investor2_id, 800000, 25, true),
    (car4_id, investor3_id, 3500000, 46.7, true),
    (car5_id, investor3_id, 3200000, 51.6, false);
    
    -- Insert profit distributions for sold cars (including purchase commission in calculations)
    INSERT INTO profit_distributions (car_id, sale_price, total_profit, showroom_profit, showroom_profit_source, investor_profit, distribution_data) VALUES
    (car2_id, 3100000, 225000, 33750, 'commission', 191250, '{"commission_rate": 15, "investor_share": 191250, "showroom_commission": 33750, "purchase_commission": 75000}'),
    (car5_id, 6800000, 500000, 242000, 'ownership', 258000, '{"showroom_ownership": 48.4, "investor_ownership": 51.6, "showroom_profit": 242000, "investor_profit": 258000, "purchase_commission": 100000}');
    
    -- Add more sample cars
    INSERT INTO cars (client_id, make, model, year, owner_name, registration_number, color, condition, mileage, purchase_price, asking_price, purchase_date, status, description, dealer_id, purchase_commission, showroom_investment, ownership_type) VALUES
    (test_client_id, 'Toyota', 'Camry Grande', 2017, 'Bank Auction', 'LEB-2468', 'Champagne Gold', 'Good', 89000, 4200000, 4600000, '2023-05-01', 'available', 'Mid-size luxury sedan with leather interior.', dealer1_id, 85000, 4200000, 'partially_owned'),
    (test_client_id, 'Honda', 'City Aspire', 2018, 'Doctor Owner', 'LEC-1357', 'Taffeta White', 'Excellent', 71000, 2400000, 2750000, '2023-05-10', 'available', 'Well-maintained sedan with genuine parts only.', NULL, 45000, 2400000, 'partially_owned'),
    (test_client_id, 'Suzuki', 'Cultus VXL', 2020, 'Expat Owned', 'LEA-9753', 'Graphite Grey', 'Excellent', 35000, 1650000, 1850000, '2023-05-15', 'pending', 'Low mileage hatchback.', dealer2_id, 30000, 1000000, 'partially_owned'),
    (sigma_client_id, 'Audi', 'A4 TFSI', 2017, 'Businessman', 'LED-8642', 'Glacier White', 'Good', 95000, 5800000, 6300000, '2023-05-20', 'available', 'German engineering with quattro AWD.', dealer3_id, 120000, 3500000, 'partially_owned'),
    (sigma_client_id, 'Toyota', 'Land Cruiser VX', 2016, 'Embassy Vehicle', 'LEE-1975', 'Desert Beige', 'Good', 125000, 12500000, 13800000, '2023-05-25', 'available', 'Bulletproof SUV with premium features.', NULL, 250000, 12500000, 'partially_owned');
    
    -- Insert comprehensive debt records for all types
    INSERT INTO buyer_debts (client_id, buyer_id, amount, type, description, is_settled, documents) VALUES
    (test_client_id, buyer1_id, 50000, 'owed_to_client', 'Remaining payment for Honda Civic Oriel - final installment due', false, ARRAY['receipt_001.pdf']),
    (test_client_id, buyer2_id, 25000, 'owed_by_client', 'Advance payment received for future car purchase', false, ARRAY['advance_receipt.pdf']);
    
    INSERT INTO dealer_debts (client_id, dealer_id, amount, type, description, is_settled, documents) VALUES
    (test_client_id, dealer1_id, 75000, 'owed_by_client', 'Commission payment pending for Toyota Corolla sale', false, ARRAY['commission_note.pdf']),
    (sigma_client_id, dealer3_id, 125000, 'owed_by_client', 'Outstanding commission for Mercedes C200 sale', false, ARRAY['dealer_invoice.pdf']);
    
    INSERT INTO seller_debts (client_id, seller_id, amount, type, description, is_settled, documents) VALUES
    (test_client_id, seller1_id, 35000, 'owed_by_client', 'Commission payment pending for Toyota Corolla purchase', false, ARRAY['seller_commission_note.pdf']),
    (test_client_id, seller2_id, 60000, 'owed_to_client', 'Overpayment made for Honda Civic purchase - to be adjusted', false, ARRAY['overpayment_receipt.pdf']);
    
    INSERT INTO investor_debts (client_id, investor_id, amount, type, description, is_settled, documents) VALUES
    (test_client_id, investor1_id, 45000, 'owed_to_client', 'Profit distribution pending for Toyota Corolla sold', false, ARRAY['profit_distribution_note.pdf']),
    (sigma_client_id, investor3_id, 80000, 'owed_by_client', 'Additional investment commitment for BMW X3', false, ARRAY['investment_commitment.pdf']);
    
    RAISE NOTICE 'Sample data inserted successfully with debt management';
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
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_debts ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for authenticated users)
DROP POLICY IF EXISTS "Enable all operations for clients" ON clients;
DROP POLICY IF EXISTS "Enable all operations for cars" ON cars;
DROP POLICY IF EXISTS "Enable all operations for dealers" ON dealers;
DROP POLICY IF EXISTS "Enable all operations for buyers" ON buyers;
DROP POLICY IF EXISTS "Enable all operations for investors" ON investors;
DROP POLICY IF EXISTS "Enable all operations for sellers" ON sellers;
DROP POLICY IF EXISTS "Enable all operations for car_investments" ON car_investments;
DROP POLICY IF EXISTS "Enable all operations for profit_distributions" ON profit_distributions;
DROP POLICY IF EXISTS "Enable all operations for buyer_debts" ON buyer_debts;
DROP POLICY IF EXISTS "Enable all operations for dealer_debts" ON dealer_debts;
DROP POLICY IF EXISTS "Enable all operations for seller_debts" ON seller_debts;
DROP POLICY IF EXISTS "Enable all operations for investor_debts" ON investor_debts;

CREATE POLICY "Enable all operations for clients" ON clients FOR ALL USING (true);
CREATE POLICY "Enable all operations for cars" ON cars FOR ALL USING (true);
CREATE POLICY "Enable all operations for dealers" ON dealers FOR ALL USING (true);
CREATE POLICY "Enable all operations for buyers" ON buyers FOR ALL USING (true);
CREATE POLICY "Enable all operations for investors" ON investors FOR ALL USING (true);
CREATE POLICY "Enable all operations for sellers" ON sellers FOR ALL USING (true);
CREATE POLICY "Enable all operations for car_investments" ON car_investments FOR ALL USING (true);
CREATE POLICY "Enable all operations for profit_distributions" ON profit_distributions FOR ALL USING (true);
CREATE POLICY "Enable all operations for buyer_debts" ON buyer_debts FOR ALL USING (true);
CREATE POLICY "Enable all operations for dealer_debts" ON dealer_debts FOR ALL USING (true);
CREATE POLICY "Enable all operations for seller_debts" ON seller_debts FOR ALL USING (true);
CREATE POLICY "Enable all operations for investor_debts" ON investor_debts FOR ALL USING (true);

-- ==========================================
-- SETUP STORAGE POLICIES
-- ==========================================

-- Create storage policies for car-images
DROP POLICY IF EXISTS "Allow public read access on car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update car images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete car images" ON storage.objects;

CREATE POLICY "Allow public read access on car images" ON storage.objects FOR SELECT USING (bucket_id IN ('car-images', 'car-documents', 'debt-documents'));
CREATE POLICY "Allow authenticated users to upload car images" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('car-images', 'car-documents', 'debt-documents'));
CREATE POLICY "Allow authenticated users to update car images" ON storage.objects FOR UPDATE USING (bucket_id IN ('car-images', 'car-documents', 'debt-documents'));
CREATE POLICY "Allow authenticated users to delete car images" ON storage.objects FOR DELETE USING (bucket_id IN ('car-images', 'car-documents', 'debt-documents'));

-- ==========================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_dealers_updated_at ON dealers;
DROP TRIGGER IF EXISTS update_buyers_updated_at ON buyers;
DROP TRIGGER IF EXISTS update_cars_updated_at ON cars;
DROP TRIGGER IF EXISTS update_investors_updated_at ON investors;
DROP TRIGGER IF EXISTS update_sellers_updated_at ON sellers;
DROP TRIGGER IF EXISTS update_car_investments_updated_at ON car_investments;
DROP TRIGGER IF EXISTS update_buyer_debts_updated_at ON buyer_debts;
DROP TRIGGER IF EXISTS update_dealer_debts_updated_at ON dealer_debts;
DROP TRIGGER IF EXISTS update_seller_debts_updated_at ON seller_debts;
DROP TRIGGER IF EXISTS update_investor_debts_updated_at ON investor_debts;

-- Create triggers
CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON dealers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_car_investments_updated_at BEFORE UPDATE ON car_investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyer_debts_updated_at BEFORE UPDATE ON buyer_debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealer_debts_updated_at BEFORE UPDATE ON dealer_debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_debts_updated_at BEFORE UPDATE ON seller_debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investor_debts_updated_at BEFORE UPDATE ON investor_debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- FINAL VERIFICATION AND SUMMARY
-- ==========================================

SELECT 
    'SETUP COMPLETE!' as status,
    (SELECT COUNT(*) FROM clients) as total_clients,
    (SELECT COUNT(*) FROM cars) as total_cars,
    (SELECT COUNT(*) FROM dealers) as total_dealers,
    (SELECT COUNT(*) FROM buyers) as total_buyers,
    (SELECT COUNT(*) FROM investors) as total_investors,
    (SELECT COUNT(*) FROM sellers) as total_sellers,
    (SELECT COUNT(*) FROM car_investments) as car_investments,
    (SELECT COUNT(*) FROM profit_distributions) as profit_distributions,
    (SELECT COUNT(*) FROM buyer_debts) as buyer_debts,
    (SELECT COUNT(*) FROM dealer_debts) as dealer_debts,
    (SELECT COUNT(*) FROM seller_debts) as seller_debts,
    (SELECT COUNT(*) FROM investor_debts) as investor_debts;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'CAR SHOWROOM DATABASE SETUP COMPLETED!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'All tables created successfully:';
    RAISE NOTICE '✓ Core tables: clients, cars, dealers, buyers, investors, sellers';
    RAISE NOTICE '✓ Investment tables: car_investments, profit_distributions';
    RAISE NOTICE '✓ Debt management: buyer_debts, dealer_debts, seller_debts, investor_debts';
    RAISE NOTICE '✓ Indexes, triggers, and RLS policies applied';
    RAISE NOTICE '✓ Storage buckets and policies configured';
    RAISE NOTICE '✓ Sample data inserted for testing';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'LOGIN CREDENTIALS:';
    RAISE NOTICE '• Username: test_client | Password: test123';
    RAISE NOTICE '• Username: sigma_motors | Password: sigma123';
    RAISE NOTICE '• Username: admin | Password: admin123';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Your car showroom management system is ready!';
    RAISE NOTICE '============================================';
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
