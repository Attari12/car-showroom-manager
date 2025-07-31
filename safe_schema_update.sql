-- SAFE SCHEMA UPDATE SCRIPT
-- This script adds new tables without dropping existing data

-- Only create new tables if they don't exist
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

-- Add new indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_buyer_debts_client_id ON buyer_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_buyer_debts_buyer_id ON buyer_debts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_debts_is_settled ON buyer_debts(is_settled);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_client_id ON dealer_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_dealer_id ON dealer_debts(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_debts_is_settled ON dealer_debts(is_settled);

-- Add RLS policies safely
ALTER TABLE buyer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealer_debts ENABLE ROW LEVEL SECURITY;

-- Only create policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all operations for buyer_debts') THEN
        CREATE POLICY "Enable all operations for buyer_debts" ON buyer_debts FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all operations for dealer_debts') THEN
        CREATE POLICY "Enable all operations for dealer_debts" ON dealer_debts FOR ALL USING (true);
    END IF;
END $$;
