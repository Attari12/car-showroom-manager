-- Get client IDs for sample data
DO $$
DECLARE
    test_client_id UUID;
    sigma_client_id UUID;
BEGIN
    -- Get existing client IDs
    SELECT id INTO test_client_id FROM clients WHERE username = 'test_client';
    SELECT id INTO sigma_client_id FROM clients WHERE username = 'sigma_motors';
    
    -- Insert sample dealers
    INSERT INTO dealers (client_id, name, email, phone, address, cnic, license_number) VALUES
    (test_client_id, 'Ahmed Motors', 'ahmed@motors.com', '+92-300-1234567', 'Main Market, Lahore', '35202-1234567-1', 'DL-001'),
    (test_client_id, 'Khan Automobiles', 'khan@autos.com', '+92-301-2345678', 'GT Road, Rawalpindi', '37405-2345678-2', 'DL-002'),
    (sigma_client_id, 'Premium Cars', 'info@premium.com', '+92-302-3456789', 'Blue Area, Islamabad', '61101-3456789-3', 'DL-003');
    
    -- Insert sample buyers
    INSERT INTO buyers (client_id, name, email, phone, address, cnic) VALUES
    (test_client_id, 'Muhammad Ali', 'ali@email.com', '+92-300-9876543', 'Model Town, Lahore', '35202-9876543-1'),
    (test_client_id, 'Sarah Khan', 'sarah@email.com', '+92-301-8765432', 'DHA, Karachi', '42101-8765432-2'),
    (test_client_id, 'Ahmad Hassan', 'ahmad@email.com', '+92-302-7654321', 'F-7, Islamabad', '61101-7654321-3'),
    (sigma_client_id, 'Fatima Sheikh', 'fatima@email.com', '+92-303-6543210', 'Gulberg, Lahore', '35202-6543210-4');
    
    -- Insert sample cars
    INSERT INTO cars (client_id, make, model, year, owner_name, registration_number, color, mileage, purchase_price, asking_price, purchase_date, status, condition, description, dealer_id, buyer_id) VALUES
    (test_client_id, 'Toyota', 'Corolla', 2020, 'Original Owner', 'LEA-1234', 'White', 45000, 3200000, 3500000, '2023-01-15', 'available', 'Excellent', 'Well maintained family car with complete service history', (SELECT id FROM dealers WHERE name = 'Ahmed Motors' LIMIT 1), NULL),
    (test_client_id, 'Honda', 'Civic', 2019, 'Second Owner', 'LEB-5678', 'Silver', 52000, 2800000, 3100000, '2023-02-20', 'sold', 'Good', 'Clean car with minor wear and tear', (SELECT id FROM dealers WHERE name = 'Khan Automobiles' LIMIT 1), (SELECT id FROM buyers WHERE name = 'Muhammad Ali' LIMIT 1)),
    (test_client_id, 'Suzuki', 'Alto', 2021, 'First Owner', 'LEC-9012', 'Red', 28000, 1800000, 2000000, '2023-03-10', 'available', 'Excellent', 'Brand new condition with warranty', NULL, NULL),
    (sigma_client_id, 'BMW', 'X3', 2018, 'Import', 'LED-3456', 'Black', 68000, 7500000, 8200000, '2023-04-05', 'reserved', 'Good', 'Luxury SUV with premium features', (SELECT id FROM dealers WHERE name = 'Premium Cars' LIMIT 1), NULL),
    (sigma_client_id, 'Mercedes', 'C-Class', 2019, 'Lease Return', 'LEE-7890', 'Blue', 42000, 6200000, 6800000, '2023-04-15', 'sold', 'Excellent', 'Executive sedan in pristine condition', (SELECT id FROM dealers WHERE name = 'Premium Cars' LIMIT 1), (SELECT id FROM buyers WHERE name = 'Fatima Sheikh' LIMIT 1));
    
    RAISE NOTICE 'Sample data inserted successfully';
END $$;

-- Update dealer commissions for sold cars
UPDATE cars SET dealer_commission = 150000 WHERE status = 'sold' AND dealer_id IS NOT NULL;

-- Add some sample debt records
DO $$
DECLARE
    test_client_id UUID;
    buyer_id UUID;
    dealer_id UUID;
BEGIN
    SELECT id INTO test_client_id FROM clients WHERE username = 'test_client';
    SELECT id INTO buyer_id FROM buyers WHERE name = 'Muhammad Ali' LIMIT 1;
    SELECT id INTO dealer_id FROM dealers WHERE name = 'Ahmed Motors' LIMIT 1;
    
    -- Sample buyer debt
    INSERT INTO buyer_debts (client_id, buyer_id, amount, type, description, is_settled) VALUES
    (test_client_id, buyer_id, 50000, 'owed_to_client', 'Remaining payment for Honda Civic', false);
    
    -- Sample dealer debt
    INSERT INTO dealer_debts (client_id, dealer_id, amount, type, description, is_settled) VALUES
    (test_client_id, dealer_id, 25000, 'owed_by_client', 'Commission payment pending', false);
END $$;
