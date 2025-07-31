-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS debts CASCADE;
DROP TABLE IF EXISTS car_conditions CASCADE;
DROP TABLE IF EXISTS car_documents CASCADE;
DROP TABLE IF EXISTS car_images CASCADE;
DROP TABLE IF EXISTS car_buyers CASCADE;
DROP TABLE IF EXISTS car_dealers CASCADE;
DROP TABLE IF EXISTS buyer_debts CASCADE;
DROP TABLE IF EXISTS dealer_debts CASCADE;
DROP TABLE IF EXISTS buyers CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed BOOLEAN DEFAULT FALSE
);

-- Create dealers table (must be created before cars table)
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

-- Create buyers table (must be created before cars table)
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

-- Create cars table (with proper foreign key references)
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    owner_name VARCHAR(100),
    registration_number VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    mileage INTEGER NOT NULL,
    purchase_price numeric(12,2) NULL,
    asking_price numeric(12,2) NULL,
    purchase_date date NULL,
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

-- Create buyer_debts table (for the debt management system)
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

-- Create dealer_debts table (for the debt management system)
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

-- Create car_images table
CREATE TABLE car_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_documents table
CREATE TABLE car_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_conditions table
CREATE TABLE car_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    exterior_condition VARCHAR(50) NOT NULL,
    interior_condition VARCHAR(50) NOT NULL,
    engine_condition VARCHAR(50) NOT NULL,
    transmission_condition VARCHAR(50) NOT NULL,
    tire_condition VARCHAR(50) NOT NULL,
    overall_grade VARCHAR(10) NOT NULL,
    notes TEXT,
    inspector_name VARCHAR(255) NOT NULL,
    inspection_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_dealers relationship table (many-to-many)
CREATE TABLE car_dealers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
    commission DECIMAL(10,2),
    involvement_type VARCHAR(20) CHECK (involvement_type IN ('purchase', 'sale', 'both')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_buyers relationship table
CREATE TABLE car_buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debts table (legacy/additional debt tracking)
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    remaining_amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_username ON clients(username);
CREATE INDEX IF NOT EXISTS idx_cars_client_id ON cars(client_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_dealers_client_id ON dealers(client_id);
CREATE INDEX IF NOT EXISTS idx_buyers_client_id ON buyers(client_id);
CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);
CREATE INDEX IF NOT EXISTS idx_car_documents_car_id ON car_documents(car_id);
CREATE INDEX IF NOT EXISTS idx_car_conditions_car_id ON car_conditions(car_id);
CREATE INDEX IF NOT EXISTS idx_debts_client_id ON debts(client_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_car_dealers_car_id ON car_dealers(car_id);
CREATE INDEX IF NOT EXISTS idx_car_dealers_dealer_id ON car_dealers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_car_buyers_car_id ON car_buyers(car_id);
CREATE INDEX IF NOT EXISTS idx_car_buyers_buyer_id ON car_buyers(buyer_id);

-- Debt management table indexes
CREATE INDEX IF NOT EXISTS idx_buyer_debts_client_id ON buyer_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_buyer_debts_buyer_id ON buyer_debts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_debts_is_settled ON buyer_debts(is_settled);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_client_id ON dealer_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_dealer_id ON dealer_debts(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_is_settled ON dealer_debts(is_settled);

-- Insert sample data
INSERT INTO clients (username, password, created_at, password_changed) 
VALUES 
  ('test_client', 'test123', NOW(), false),
  ('sigma_motors', 'sigma123', NOW(), false)
ON CONFLICT (username) DO NOTHING;

-- Create RLS policies (Row Level Security)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Enable all operations for clients" ON clients;
DROP POLICY IF EXISTS "Enable all operations for cars" ON cars;
DROP POLICY IF EXISTS "Enable all operations for dealers" ON dealers;
DROP POLICY IF EXISTS "Enable all operations for buyers" ON buyers;
DROP POLICY IF EXISTS "Enable all operations for buyer_debts" ON buyer_debts;
DROP POLICY IF EXISTS "Enable all operations for dealer_debts" ON dealer_debts;
DROP POLICY IF EXISTS "Enable all operations for car_images" ON car_images;
DROP POLICY IF EXISTS "Enable all operations for car_documents" ON car_documents;
DROP POLICY IF EXISTS "Enable all operations for car_conditions" ON car_conditions;
DROP POLICY IF EXISTS "Enable all operations for car_dealers" ON car_dealers;
DROP POLICY IF EXISTS "Enable all operations for car_buyers" ON car_buyers;
DROP POLICY IF EXISTS "Enable all operations for debts" ON debts;

-- Create policies for all tables (allow all operations for now)
CREATE POLICY "Enable all operations for clients" ON clients FOR ALL USING (true);
CREATE POLICY "Enable all operations for cars" ON cars FOR ALL USING (true);
CREATE POLICY "Enable all operations for dealers" ON dealers FOR ALL USING (true);
CREATE POLICY "Enable all operations for buyers" ON buyers FOR ALL USING (true);
CREATE POLICY "Enable all operations for buyer_debts" ON buyer_debts FOR ALL USING (true);
CREATE POLICY "Enable all operations for dealer_debts" ON dealer_debts FOR ALL USING (true);
CREATE POLICY "Enable all operations for car_images" ON car_images FOR ALL USING (true);
CREATE POLICY "Enable all operations for car_documents" ON car_documents FOR ALL USING (true);
CREATE POLICY "Enable all operations for car_conditions" ON car_conditions FOR ALL USING (true);
CREATE POLICY "Enable all operations for car_dealers" ON car_dealers FOR ALL USING (true);
CREATE POLICY "Enable all operations for car_buyers" ON car_buyers FOR ALL USING (true);
CREATE POLICY "Enable all operations for debts" ON debts FOR ALL USING (true);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('car-images', 'car-images', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('car-documents', 'car-documents', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('debt-documents', 'debt-documents', true) 
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies first to avoid conflicts
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

-- Set up storage policies for car-images bucket
CREATE POLICY "Allow public read access on car images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'car-images');

CREATE POLICY "Allow authenticated users to upload car images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'car-images');

CREATE POLICY "Allow authenticated users to update car images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'car-images');

CREATE POLICY "Allow authenticated users to delete car images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'car-images');

-- Set up storage policies for car-documents bucket
CREATE POLICY "Allow public read access on car documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'car-documents');

CREATE POLICY "Allow authenticated users to upload car documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'car-documents');

CREATE POLICY "Allow authenticated users to update car documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'car-documents');

CREATE POLICY "Allow authenticated users to delete car documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'car-documents');

-- Set up storage policies for debt-documents bucket
CREATE POLICY "Allow public read access on debt documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'debt-documents');

CREATE POLICY "Allow authenticated users to upload debt documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'debt-documents');

CREATE POLICY "Allow authenticated users to update debt documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'debt-documents');

CREATE POLICY "Allow authenticated users to delete debt documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'debt-documents');

-- Trigger function for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON dealers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buyer_debts_updated_at BEFORE UPDATE ON buyer_debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealer_debts_updated_at BEFORE UPDATE ON dealer_debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

NOTIFY pgrst, 'reload schema';
