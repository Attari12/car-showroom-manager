-- Insert production sample data for Car Showroom Manager v11

-- Insert admin user
INSERT INTO clients (username, password, password_changed) VALUES 
('admin', 'admin123', true);

-- Insert sample clients
INSERT INTO clients (username, password, created_at, password_changed) VALUES 
('showroom_karachi', 'karachi123', NOW() - INTERVAL '5 days', false),
('dealer_lahore', 'lahore456', NOW() - INTERVAL '3 days', false),
('auto_islamabad', 'islamabad789', NOW() - INTERVAL '1 day', false);

-- Get client IDs and insert related data
DO $$
DECLARE
    client1_id UUID;
    client2_id UUID;
    client3_id UUID;
    car1_id UUID;
    car2_id UUID;
    car3_id UUID;
    dealer1_id UUID;
    dealer2_id UUID;
    buyer1_id UUID;
    buyer2_id UUID;
BEGIN
    -- Get client IDs
    SELECT id INTO client1_id FROM clients WHERE username = 'showroom_karachi';
    SELECT id INTO client2_id FROM clients WHERE username = 'dealer_lahore';
    SELECT id INTO client3_id FROM clients WHERE username = 'auto_islamabad';
    
    -- Insert sample cars with all new fields
    INSERT INTO cars (client_id, make, model, year, registration_number, mileage, purchase_price, asking_price, purchase_date, owner_name, status, sold_price, sold_date, profit, repair_costs, dealer_commission, buyer_name, buyer_cnic, buyer_contact, description)
    VALUES 
    (client1_id, 'Toyota', 'Corolla', 2020, 'LZH-238', 45000, 2500000, 2800000, '2024-01-10', 'Ahmed Ali', 'sold', 2750000, '2024-01-18', 175000, 25000, 50000, 'Fahad Sheikh', '42101-9876543-2', '+92-333-5555555', 'Excellent condition, well maintained vehicle'),
    (client1_id, 'Honda', 'Civic', 2019, 'KHI-456', 62000, 3000000, 3400000, '2024-01-12', 'Sara Khan', 'available', NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, 'Premium Honda Civic with excellent performance'),
    (client2_id, 'Suzuki', 'Alto', 2021, 'ISB-789', 28000, 1800000, 2100000, '2024-01-15', 'Muhammad Hassan', 'sold', 2050000, '2024-01-20', 205000, 15000, 30000, 'Ayesha Malik', '42101-1111111-3', '+92-345-7777777', 'Low mileage, single owner vehicle'),
    (client3_id, 'Toyota', 'Camry', 2021, 'LHR-321', 35000, 4500000, 4900000, '2024-01-20', 'Ali Ahmed', 'available', NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, 'Luxury sedan with premium features');
    
    -- Get car IDs for relationships
    SELECT id INTO car1_id FROM cars WHERE make = 'Toyota' AND model = 'Corolla' AND client_id = client1_id LIMIT 1;
    SELECT id INTO car2_id FROM cars WHERE make = 'Honda' AND model = 'Civic' AND client_id = client1_id LIMIT 1;
    SELECT id INTO car3_id FROM cars WHERE make = 'Suzuki' AND model = 'Alto' AND client_id = client2_id LIMIT 1;
    
    -- Insert sample dealers
    INSERT INTO dealers (client_id, name, cnic, contact_number, total_deals, total_commission)
    VALUES 
    (client1_id, 'Kareem Motors', '42101-1234567-1', '+92-300-1234567', 2, 80000),
    (client2_id, 'City Auto Dealers', '42101-7654321-9', '+92-321-9876543', 1, 30000);
    
    -- Get dealer IDs
    SELECT id INTO dealer1_id FROM dealers WHERE name = 'Kareem Motors' LIMIT 1;
    SELECT id INTO dealer2_id FROM dealers WHERE name = 'City Auto Dealers' LIMIT 1;
    
    -- Insert sample buyers
    INSERT INTO buyers (client_id, name, cnic, contact_number, total_purchases, total_spent)
    VALUES 
    (client1_id, 'Fahad Sheikh', '42101-9876543-2', '+92-333-5555555', 1, 2750000),
    (client2_id, 'Ayesha Malik', '42101-1111111-3', '+92-345-7777777', 1, 2050000);
    
    -- Get buyer IDs
    SELECT id INTO buyer1_id FROM buyers WHERE name = 'Fahad Sheikh' LIMIT 1;
    SELECT id INTO buyer2_id FROM buyers WHERE name = 'Ayesha Malik' LIMIT 1;
    
    -- Insert car-dealer relationships
    INSERT INTO car_dealers (car_id, dealer_id, commission, involvement_type)
    VALUES 
    (car1_id, dealer1_id, 50000, 'sale'),
    (car2_id, dealer1_id, 30000, 'purchase'),
    (car3_id, dealer2_id, 30000, 'sale');
    
    -- Insert car-buyer relationships
    INSERT INTO car_buyers (car_id, buyer_id, purchase_date, purchase_price)
    VALUES 
    (car1_id, buyer1_id, '2024-01-18', 2750000),
    (car3_id, buyer2_id, '2024-01-20', 2050000);
    
    -- Insert sample car conditions (auction sheet data)
    INSERT INTO car_conditions (car_id, trunk_painted, pillars_painted, hood_painted, roof_painted, front_left_door_painted, front_right_door_painted, back_left_door_painted, back_right_door_painted, front_left_fender_painted, front_right_fender_painted, back_left_fender_painted, back_right_fender_painted, grade)
    VALUES 
    (car1_id, TRUE, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE, 3),
    (car2_id, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, 4),
    (car3_id, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, 4);
    
    -- Insert sample debts with settlement status
    INSERT INTO debts (client_id, debtor_type, debtor_id, amount, debt_type, description, is_settled, settled_at, settled_amount)
    VALUES 
    (client1_id, 'dealer', dealer1_id, 25000, 'owed_to_client', 'Pending commission payment for Toyota Corolla', false, NULL, NULL),
    (client2_id, 'buyer', buyer2_id, 100000, 'owed_by_client', 'Advance payment for next purchase', false, NULL, NULL),
    (client1_id, 'dealer', dealer1_id, 15000, 'owed_by_client', 'Advance commission paid', true, NOW() - INTERVAL '2 days', 15000);
    
END $$;
