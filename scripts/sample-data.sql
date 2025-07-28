-- Insert sample data for testing

-- Insert sample admin (you can change these credentials)
INSERT INTO clients (username, password) VALUES 
('admin', 'admin123');

-- Insert sample clients
INSERT INTO clients (username, password, created_at) VALUES 
('client001', 'temp123', NOW() - INTERVAL '5 days'),
('client002', 'temp456', NOW() - INTERVAL '3 days'),
('showroom_karachi', 'karachi123', NOW() - INTERVAL '1 day');

-- Get client IDs for sample data
DO $$
DECLARE
    client1_id UUID;
    client2_id UUID;
    car1_id UUID;
    car2_id UUID;
    dealer1_id UUID;
    buyer1_id UUID;
BEGIN
    -- Get client IDs
    SELECT id INTO client1_id FROM clients WHERE username = 'client001';
    SELECT id INTO client2_id FROM clients WHERE username = 'client002';
    
    -- Insert sample cars
    INSERT INTO cars (client_id, make, model, year, purchase_price, asking_price, purchase_date, owner_name, status, sold_price, sold_date, profit)
    VALUES 
    (client1_id, 'Toyota', 'Corolla', 2020, 2500000, 2800000, '2024-01-10', 'Ahmed Ali', 'sold', 2750000, '2024-01-18', 250000),
    (client1_id, 'Honda', 'Civic', 2019, 3000000, 3400000, '2024-01-12', 'Sara Khan', 'available', NULL, NULL, NULL),
    (client2_id, 'Suzuki', 'Alto', 2021, 1800000, 2100000, '2024-01-15', 'Muhammad Hassan', 'sold', 2050000, '2024-01-20', 250000);
    
    -- Get car IDs for relationships
    SELECT id INTO car1_id FROM cars WHERE make = 'Toyota' AND model = 'Corolla' LIMIT 1;
    SELECT id INTO car2_id FROM cars WHERE make = 'Suzuki' AND model = 'Alto' LIMIT 1;
    
    -- Insert sample dealers
    INSERT INTO dealers (client_id, name, cnic, contact_number)
    VALUES 
    (client1_id, 'Kareem Motors', '42101-1234567-1', '+92-300-1234567'),
    (client2_id, 'City Auto Dealers', '42101-7654321-9', '+92-321-9876543');
    
    -- Get dealer ID
    SELECT id INTO dealer1_id FROM dealers WHERE name = 'Kareem Motors' LIMIT 1;
    
    -- Insert sample buyers
    INSERT INTO buyers (client_id, name, cnic, contact_number)
    VALUES 
    (client1_id, 'Fahad Sheikh', '42101-9876543-2', '+92-333-5555555'),
    (client2_id, 'Ayesha Malik', '42101-1111111-3', '+92-345-7777777');
    
    -- Get buyer ID
    SELECT id INTO buyer1_id FROM buyers WHERE name = 'Fahad Sheikh' LIMIT 1;
    
    -- Insert car-dealer relationships
    INSERT INTO car_dealers (car_id, dealer_id, commission, involvement_type)
    VALUES 
    (car1_id, dealer1_id, 50000, 'sale');
    
    -- Insert car-buyer relationships
    INSERT INTO car_buyers (car_id, buyer_id, purchase_date, purchase_price)
    VALUES 
    (car1_id, buyer1_id, '2024-01-18', 2750000);
    
    -- Insert sample car conditions
    INSERT INTO car_conditions (car_id, trunk_painted, hood_painted, roof_painted, doors_painted, fenders_painted, grade)
    VALUES 
    (car1_id, TRUE, FALSE, TRUE, FALSE, TRUE, 3),
    (car2_id, FALSE, TRUE, FALSE, TRUE, FALSE, 4);
    
    -- Insert sample debts
    INSERT INTO debts (client_id, debtor_type, debtor_id, amount, debt_type, description)
    VALUES 
    (client1_id, 'dealer', dealer1_id, 25000, 'owed_to_client', 'Pending commission payment'),
    (client2_id, 'buyer', buyer1_id, 100000, 'owed_by_client', 'Advance payment for next purchase');
    
END $$;
