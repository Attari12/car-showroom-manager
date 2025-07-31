-- Show all valid client accounts
SELECT 
    username, 
    id,
    created_at,
    password_changed,
    'Use this username to log in' as note
FROM clients 
ORDER BY created_at;

-- Show sample login credentials
SELECT 
    'Available Login Accounts:' as info,
    'Username: test_client, Password: test123' as account1,
    'Username: sigma_motors, Password: sigma123' as account2,
    'Username: admin, Password: admin123' as account3;
