const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://saicjjshmgwsitmwvomj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhaWNqanNobWd3c2l0bXd2b21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzM4OTQsImV4cCI6MjA2OTMwOTg5NH0.DjDOkzdTmRPM7aC-E8xvYT61jPzk2eSmSedzy1qr-4c";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDebtTables() {
  console.log('Testing debt tables...');
  
  try {
    // Test seller_debts table
    console.log('Testing seller_debts table...');
    const { data: sellerDebts, error: sellerError } = await supabase
      .from('seller_debts')
      .select('*')
      .limit(1);
    
    if (sellerError) {
      console.error('seller_debts table error:', sellerError.message);
      console.log('Table seller_debts likely does not exist');
    } else {
      console.log('seller_debts table exists, record count:', sellerDebts?.length || 0);
    }
    
    // Test investor_debts table
    console.log('Testing investor_debts table...');
    const { data: investorDebts, error: investorError } = await supabase
      .from('investor_debts')
      .select('*')
      .limit(1);
    
    if (investorError) {
      console.error('investor_debts table error:', investorError.message);
      console.log('Table investor_debts likely does not exist');
    } else {
      console.log('investor_debts table exists, record count:', investorDebts?.length || 0);
    }
    
    // Test existing buyer_debts table
    console.log('Testing buyer_debts table...');
    const { data: buyerDebts, error: buyerError } = await supabase
      .from('buyer_debts')
      .select('*')
      .limit(1);
    
    if (buyerError) {
      console.error('buyer_debts table error:', buyerError.message);
    } else {
      console.log('buyer_debts table exists, record count:', buyerDebts?.length || 0);
    }
    
    // Test existing dealer_debts table
    console.log('Testing dealer_debts table...');
    const { data: dealerDebts, error: dealerError } = await supabase
      .from('dealer_debts')
      .select('*')
      .limit(1);
    
    if (dealerError) {
      console.error('dealer_debts table error:', dealerError.message);
    } else {
      console.log('dealer_debts table exists, record count:', dealerDebts?.length || 0);
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

async function testWithClient() {
  try {
    console.log('Getting test client...');
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('username', 'test_client')
      .limit(1);
    
    if (clientError) {
      console.error('Error getting test client:', clientError.message);
      return;
    }
    
    if (!clients || clients.length === 0) {
      console.error('No test client found');
      return;
    }
    
    const clientId = clients[0].id;
    console.log('Test client ID:', clientId);
    
    // Now test debt tables with this client ID
    console.log('Testing debt functions with client ID...');
    
    // Test getInvestorDebts function
    try {
      const { data: investorDebts, error: investorError } = await supabase
        .from('investor_debts')
        .select(`
          *,
          investor:investors(name, cnic, phone)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (investorError) {
        console.error('getInvestorDebts error:', investorError.message);
      } else {
        console.log('getInvestorDebts successful, count:', investorDebts?.length || 0);
      }
    } catch (error) {
      console.error('getInvestorDebts function error:', error.message);
    }
    
  } catch (error) {
    console.error('Error in testWithClient:', error);
  }
}

// Run the tests
testDebtTables().then(() => {
  return testWithClient();
}).then(() => {
  console.log('Test completed');
}).catch(error => {
  console.error('Test failed:', error);
});
