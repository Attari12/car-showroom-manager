-- Solution 2: Add only missing columns to existing tables (SAFER - preserves data)

-- Add missing columns to cars table if they don't exist
DO $$ 
BEGIN
    -- Add registration_number column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cars' AND column_name='registration_number') THEN
        ALTER TABLE cars ADD COLUMN registration_number VARCHAR(20);
    END IF;
    
    -- Add mileage column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cars' AND column_name='mileage') THEN
        ALTER TABLE cars ADD COLUMN mileage INTEGER;
    END IF;
    
    -- Add repair_costs column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cars' AND column_name='repair_costs') THEN
        ALTER TABLE cars ADD COLUMN repair_costs DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    -- Add dealer_commission column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cars' AND column_name='dealer_commission') THEN
        ALTER TABLE cars ADD COLUMN dealer_commission DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    -- Add buyer_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cars' AND column_name='buyer_name') THEN
        ALTER TABLE cars ADD COLUMN buyer_name VARCHAR(100);
    END IF;
    
    -- Add buyer_cnic column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cars' AND column_name='buyer_cnic') THEN
        ALTER TABLE cars ADD COLUMN buyer_cnic VARCHAR(15);
    END IF;
    
    -- Add buyer_contact column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cars' AND column_name='buyer_contact') THEN
        ALTER TABLE cars ADD COLUMN buyer_contact VARCHAR(20);
    END IF;
END $$;

-- Add missing columns to dealers table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dealers' AND column_name='total_deals') THEN
        ALTER TABLE dealers ADD COLUMN total_deals INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dealers' AND column_name='total_commission') THEN
        ALTER TABLE dealers ADD COLUMN total_commission DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- Add missing columns to buyers table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='buyers' AND column_name='total_purchases') THEN
        ALTER TABLE buyers ADD COLUMN total_purchases INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='buyers' AND column_name='total_spent') THEN
        ALTER TABLE buyers ADD COLUMN total_spent DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- Add missing columns to debts table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debts' AND column_name='is_settled') THEN
        ALTER TABLE debts ADD COLUMN is_settled BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debts' AND column_name='settled_at') THEN
        ALTER TABLE debts ADD COLUMN settled_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debts' AND column_name='settled_amount') THEN
        ALTER TABLE debts ADD COLUMN settled_amount DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='debts' AND column_name='settlement_notes') THEN
        ALTER TABLE debts ADD COLUMN settlement_notes TEXT;
    END IF;
END $$;

-- Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS car_conditions (
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

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_cars_client_id ON cars(client_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_dealers_client_id ON dealers(client_id);
CREATE INDEX IF NOT EXISTS idx_buyers_client_id ON buyers(client_id);
CREATE INDEX IF NOT EXISTS idx_debts_client_id ON debts(client_id);
