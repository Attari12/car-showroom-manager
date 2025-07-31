-- Add money_spent column to cars table for tracking additional expenses
ALTER TABLE cars ADD COLUMN IF NOT EXISTS money_spent NUMERIC(12,2) DEFAULT 0;

-- Add index for better performance on money_spent queries
CREATE INDEX IF NOT EXISTS idx_cars_money_spent ON cars(money_spent);

-- Update existing cars to have money_spent = 0 if NULL
UPDATE cars SET money_spent = 0 WHERE money_spent IS NULL;

-- Add comment to document the field
COMMENT ON COLUMN cars.money_spent IS 'Additional money spent on car repairs, maintenance, or improvements that should be subtracted from profit calculation';

SELECT 'money_spent column added successfully' as status;
