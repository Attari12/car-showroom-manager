-- Check what data currently exists
SELECT 'clients' as table_name, count(*) as count FROM clients
UNION ALL
SELECT 'cars' as table_name, count(*) as count FROM cars
UNION ALL
SELECT 'dealers' as table_name, count(*) as count FROM dealers
UNION ALL
SELECT 'buyers' as table_name, count(*) as count FROM buyers;

-- Check existing clients
SELECT * FROM clients;

-- Check if any cars exist
SELECT * FROM cars LIMIT 5;
