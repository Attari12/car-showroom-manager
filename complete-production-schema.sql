-- Complete Production Database Schema for Car Showroom Manager v11

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table (managed by admin)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    password_changed BOOLEAN DEFAULT FALSE,
    password_change_date TIMESTAMP
);

-- Cars table
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    registration_number VARCHAR(20),
    mileage INTEGER,
    purchase_price DECIMAL(12,2) NOT NULL,
    asking_price DECIMAL(12,2) NOT NULL,
    purchase_date DATE NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold')),
    sold_price DECIMAL(12,2),
    sold_date DATE,
    profit DECIMAL(12,2),
    repair_costs DECIMAL(12,2) DEFAULT 0,
    dealer_commission DECIMAL(12,2) DEFAULT 0,
    buyer_name VARCHAR(100),
    buyer_cnic VARCHAR(15),
    buyer_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Car images table
CREATE TABLE car_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Car documents table
CREATE TABLE car_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    document_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Car condition table (for auction sheet)
CREATE TABLE car_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    trunk_painted BOOLEAN DEFAULT FALSE,
    pillars_painted BOOLEAN DEFAULT FALSE,
    hood_painted BOOLEAN DEFAULT FALSE,
    roof_painted BOOLEAN DEFAULT FALSE,
    front_left_door_painted BOOLEAN DEFAULT FALSE,
    front_right_door_painted BOOLEAN DEFAULT FALSE,
    back_left_door_painted BOOLEAN DEFAULT FALSE,
    back_right_door_painted BOOLEAN DEFAULT FALSE,
    front_left_fender_painted BOOLEAN DEFAULT FALSE,
    front_right_fender_painted BOOLEAN DEFAULT FALSE,
    back_left_fender_painted BOOLEAN DEFAULT FALSE,
    back_right_fender_painted BOOLEAN DEFAULT FALSE,
    grade INTEGER CHECK (grade BETWEEN 1 AND 5),
    auction_sheet_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dealers table
CREATE TABLE dealers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    cnic VARCHAR(15) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    total_deals INTEGER DEFAULT 0,
    total_commission DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Buyers table
CREATE TABLE buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    cnic VARCHAR(15) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    total_purchases INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Car dealers relationship (many-to-many)
CREATE TABLE car_dealers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    commission DECIMAL(10,2),
    involvement_type VARCHAR(20) CHECK (involvement_type IN ('purchase', 'sale', 'both')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Car buyers relationship (for tracking who bought which car)
CREATE TABLE car_buyers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Debts table (for tracking debts between client and dealers/buyers)
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    debtor_type VARCHAR(10) CHECK (debtor_type IN ('dealer', 'buyer')),
    debtor_id UUID NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    debt_type VARCHAR(20) CHECK (debt_type IN ('owed_to_client', 'owed_by_client')),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    settled_at TIMESTAMP,
    is_settled BOOLEAN DEFAULT FALSE,
    settled_amount DECIMAL(12,2),
    settlement_notes TEXT
);

-- Debt documents table (for proof documents)
CREATE TABLE debt_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    document_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Password change history table
CREATE TABLE password_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    old_password VARCHAR(255),
    new_password VARCHAR(255),
    changed_by VARCHAR(20) CHECK (changed_by IN ('admin', 'client')),
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cars_client_id ON cars(client_id);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_car_images_car_id ON car_images(car_id);
CREATE INDEX idx_car_documents_car_id ON car_documents(car_id);
CREATE INDEX idx_dealers_client_id ON dealers(client_id);
CREATE INDEX idx_buyers_client_id ON buyers(client_id);
CREATE INDEX idx_debts_client_id ON debts(client_id);
CREATE INDEX idx_debts_debtor ON debts(debtor_type, debtor_id);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_changes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these later for better security)
CREATE POLICY "Enable all operations for authenticated users" ON clients FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON cars FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON car_images FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON car_documents FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON car_conditions FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON dealers FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON buyers FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON car_dealers FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON car_buyers FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON debts FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON debt_documents FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON password_changes FOR ALL USING (true);
