-- Create missing debt tables for sellers and investors
-- Based on the existing buyer_debts and dealer_debts structure

-- Create seller_debts table if it doesn't exist
CREATE TABLE IF NOT EXISTS seller_debts (
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

-- Create investor_debts table if it doesn't exist
CREATE TABLE IF NOT EXISTS investor_debts (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_debts_client_id ON seller_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_seller_debts_seller_id ON seller_debts(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_debts_is_settled ON seller_debts(is_settled);

CREATE INDEX IF NOT EXISTS idx_investor_debts_client_id ON investor_debts(client_id);
CREATE INDEX IF NOT EXISTS idx_investor_debts_investor_id ON investor_debts(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_debts_is_settled ON investor_debts(is_settled);

-- Create triggers for updated_at
CREATE TRIGGER update_seller_debts_updated_at 
    BEFORE UPDATE ON seller_debts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_debts_updated_at 
    BEFORE UPDATE ON investor_debts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE seller_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_debts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all operations for seller_debts" ON seller_debts FOR ALL USING (true);
CREATE POLICY "Enable all operations for investor_debts" ON investor_debts FOR ALL USING (true);

-- Insert sample debt records if tables were empty
INSERT INTO seller_debts (client_id, seller_id, amount, type, description, is_settled, documents) 
SELECT 
    test_client_id,
    seller1_id,
    75000,
    'owed_by_client',
    'Commission payment pending for car purchase',
    false,
    ARRAY['seller_commission_note.pdf']
FROM (
    SELECT id as test_client_id FROM clients WHERE username = 'test_client' LIMIT 1
) c,
(
    SELECT id as seller1_id FROM sellers WHERE name = 'Muhammad Hassan' LIMIT 1
) s
WHERE NOT EXISTS (SELECT 1 FROM seller_debts);

INSERT INTO investor_debts (client_id, investor_id, amount, type, description, is_settled, documents) 
SELECT 
    test_client_id,
    investor1_id,
    50000,
    'owed_to_client',
    'Profit distribution pending for sold car',
    false,
    ARRAY['profit_distribution_note.pdf']
FROM (
    SELECT id as test_client_id FROM clients WHERE username = 'test_client' LIMIT 1
) c,
(
    SELECT id as investor1_id FROM investors WHERE name = 'Ahmed Ali' LIMIT 1
) i
WHERE NOT EXISTS (SELECT 1 FROM investor_debts);

-- Verification
SELECT 
    'Debt Tables Created Successfully!' as status,
    (SELECT COUNT(*) FROM seller_debts) as seller_debts_count,
    (SELECT COUNT(*) FROM investor_debts) as investor_debts_count;
