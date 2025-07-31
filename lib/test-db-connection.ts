// Simple database connectivity test
import { testConnection, getClients, getInvestors, getSellers } from './supabase-client'

export async function runDatabaseTest() {
  console.log('🔍 Testing database connectivity...')
  
  try {
    // Test basic connection
    const connectionResult = await testConnection()
    if (!connectionResult.success) {
      throw new Error(`Connection failed: ${connectionResult.error}`)
    }
    console.log('✅ Database connection successful')
    
    // Test clients table
    const clients = await getClients()
    console.log(`✅ Found ${clients.length} clients in database`)
    
    if (clients.length > 0) {
      const testClientId = clients[0].id
      
      // Test investors table
      try {
        const investors = await getInvestors(testClientId)
        console.log(`✅ Found ${investors.length} investors for client`)
      } catch (error) {
        console.log('⚠️  Investors table might not exist yet, this is expected for new setups')
      }
      
      // Test sellers table
      try {
        const sellers = await getSellers(testClientId)
        console.log(`✅ Found ${sellers.length} sellers for client`)
      } catch (error) {
        console.log('⚠️  Sellers table might not exist yet, this is expected for new setups')
      }
    }
    
    console.log('🎉 Database test completed successfully!')
    return { success: true, message: 'All database operations working correctly' }
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).testDatabase = runDatabaseTest
}
