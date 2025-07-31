// This script can be run by the admin to create missing debt tables
// It uses the same Supabase client and tries to create tables using raw SQL

import { supabase } from '../lib/supabase-client.js'

const createDebtTablesSQL = `
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
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_seller_debts_updated_at') THEN
        CREATE TRIGGER update_seller_debts_updated_at 
            BEFORE UPDATE ON seller_debts 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_investor_debts_updated_at') THEN
        CREATE TRIGGER update_investor_debts_updated_at 
            BEFORE UPDATE ON investor_debts 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS
ALTER TABLE seller_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_debts ENABLE ROW LEVEL SECURITY;

-- Create policies (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all operations for seller_debts') THEN
        CREATE POLICY "Enable all operations for seller_debts" ON seller_debts FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all operations for investor_debts') THEN
        CREATE POLICY "Enable all operations for investor_debts" ON investor_debts FOR ALL USING (true);
    END IF;
END $$;
`;

async function setupDebtTables() {
  console.log('Setting up debt management tables...');
  
  try {
    // Execute the SQL to create tables
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: createDebtTablesSQL
    });
    
    if (error) {
      console.error('Error creating debt tables:', error);
      console.log('Note: This method requires a custom RPC function in Supabase.');
      console.log('Please run the SQL manually in the Supabase SQL editor:');
      console.log('--------------------');
      console.log(createDebtTablesSQL);
      console.log('--------------------');
      return false;
    }
    
    console.log('Debt tables created successfully!');
    return true;
    
  } catch (error) {
    console.error('Failed to setup debt tables:', error);
    console.log('Please manually execute the following SQL in Supabase SQL editor:');
    console.log('--------------------');
    console.log(createDebtTablesSQL);
    console.log('--------------------');
    return false;
  }
}

// Export for use in other scripts
export { setupDebtTables, createDebtTablesSQL };

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDebtTables().then(success => {
    console.log(success ? 'Setup completed successfully!' : 'Setup failed - please follow manual instructions');
    process.exit(success ? 0 : 1);
  });
}
