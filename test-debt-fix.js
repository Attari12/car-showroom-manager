// Test script to verify debt function fixes
import { getInvestorDebts, getSellerDebts, checkDebtTablesExist } from './lib/supabase-client.js'

async function testDebtFunctions() {
  console.log('Testing debt function fixes...')
  
  // Test table existence check
  console.log('1. Checking debt table existence...')
  try {
    const tableStatus = await checkDebtTablesExist()
    console.log('Table status:', tableStatus)
  } catch (error) {
    console.error('Error checking tables:', error.message)
  }
  
  // Test getInvestorDebts with fallback
  console.log('2. Testing getInvestorDebts...')
  try {
    const investorDebts = await getInvestorDebts('test-client-id')
    console.log('Investor debts result:', Array.isArray(investorDebts) ? `Array with ${investorDebts.length} items` : 'Not an array')
  } catch (error) {
    console.error('Error in getInvestorDebts:', error.message)
  }
  
  // Test getSellerDebts with fallback
  console.log('3. Testing getSellerDebts...')
  try {
    const sellerDebts = await getSellerDebts('test-client-id')
    console.log('Seller debts result:', Array.isArray(sellerDebts) ? `Array with ${sellerDebts.length} items` : 'Not an array')
  } catch (error) {
    console.error('Error in getSellerDebts:', error.message)
  }
  
  console.log('Test completed!')
}

testDebtFunctions()
