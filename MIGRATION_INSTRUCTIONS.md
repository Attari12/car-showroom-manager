# Database Migration Required

## Issue
The application is trying to use a `money_spent` column in the `cars` table that doesn't exist in the database yet.

## Quick Fix via Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to your project**: saicjjshmgwsitmwvomj
3. **Go to Table Editor**
4. **Select the "cars" table**
5. **Add a new column** with these settings:
   - **Name**: `money_spent`
   - **Type**: `numeric`
   - **Length**: `(12,2)`
   - **Default**: `0`
   - **Allow nullable**: `false`

## Alternative: SQL Command

Run this SQL command in the Supabase SQL Editor:

```sql
ALTER TABLE cars ADD COLUMN IF NOT EXISTS money_spent NUMERIC(12,2) DEFAULT 0;

-- Update existing cars to have money_spent = 0 if NULL
UPDATE cars SET money_spent = 0 WHERE money_spent IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_cars_money_spent ON cars(money_spent);

-- Add comment to document the field
COMMENT ON COLUMN cars.money_spent IS 'Additional money spent on car repairs, maintenance, or improvements that should be subtracted from profit calculation';
```

## Verification

After adding the column, you can verify it worked by running:

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'cars' AND column_name = 'money_spent';
```

## What This Column Does

The `money_spent` column tracks additional expenses for each car (repairs, maintenance, improvements) that should be subtracted from profit calculations, providing more accurate financial reporting.
