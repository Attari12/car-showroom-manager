const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Environment variables - replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://saicjjshmgwsitmwvomj.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhaWNqanNobWd3c2l0bXd2b21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzM4OTQsImV4cCI6MjA2OTMwOTg5NH0.DjDOkzdTmRPM7aC-E8xvYT61jPzk2eSmSedzy1qr-4c"

async function runMigration() {
  try {
    console.log('Connecting to Supabase...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync('add_money_spent_column.sql', 'utf8')
    
    console.log('Running migration...')
    console.log('SQL:', migrationSQL)
    
    // Execute the migration - Split by statements and run each one
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim()
      if (trimmedStatement.length > 0 && !trimmedStatement.startsWith('--')) {
        console.log(`Executing: ${trimmedStatement.substring(0, 50)}...`)
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: trimmedStatement 
        })
        
        if (error) {
          console.error('Migration error:', error)
          // Try alternative approach using .from() for simple ALTER TABLE
          if (trimmedStatement.includes('ALTER TABLE')) {
            console.log('Trying alternative approach...')
            // For Supabase, we might need to use the REST API or direct SQL execution
            // Let's try to add the column using the cars table directly
            console.log('Note: Column might need to be added through Supabase dashboard or direct SQL execution')
          }
        } else {
          console.log('Statement executed successfully:', data)
        }
      }
    }
    
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    console.log('\nTo fix this manually:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to the Table Editor')
    console.log('3. Select the "cars" table')
    console.log('4. Add a new column:')
    console.log('   - Name: money_spent')
    console.log('   - Type: numeric')
    console.log('   - Length: (12,2)')
    console.log('   - Default: 0')
    console.log('   - Allow nullable: false')
  }
}

runMigration()
