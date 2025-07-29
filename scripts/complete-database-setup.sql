-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS car_images CASCADE;
DROP TABLE IF EXISTS car_documents CASCADE;
DROP TABLE IF EXISTS car_conditions CASCADE;
DROP TABLE IF EXISTS debts CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS buyers CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create clients table
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed BOOLEAN DEFAULT FALSE
);

-- Create cars table
CREATE TABLE cars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(30) NOT NULL,
    mileage INTEGER NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'pending')),
    condition VARCHAR(50) NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}',
    dealer_id UUID,
    buyer_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dealers table
CREATE TABLE dealers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    cnic VARCHAR(20) NOT NULL,
    license_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buyers table
CREATE TABLE buyers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    cnic VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_conditions table
CREATE TABLE car_conditions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    exterior_condition VARCHAR(20) NOT NULL,
    interior_condition VARCHAR(20) NOT NULL,
    engine_condition VARCHAR(20) NOT NULL,
    transmission_condition VARCHAR(20) NOT NULL,
    tire_condition VARCHAR(20) NOT NULL,
    overall_grade VARCHAR(10) NOT NULL,
    notes TEXT,
    inspector_name VARCHAR(100) NOT NULL,
    inspection_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_images table
CREATE TABLE car_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(20) DEFAULT 'exterior',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_documents table
CREATE TABLE car_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debts table
CREATE TABLE debts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    dealer_id UUID REFERENCES dealers(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES buyers(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    remaining_amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints for cars table (after all tables are created)
ALTER TABLE cars ADD CONSTRAINT fk_cars_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE SET NULL;
ALTER TABLE cars ADD CONSTRAINT fk_cars_buyer FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_clients_username ON clients(username);
CREATE INDEX idx_cars_client_id ON cars(client_id);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_dealers_client_id ON dealers(client_id);
CREATE INDEX idx_buyers_client_id ON buyers(client_id);
CREATE INDEX idx_car_conditions_car_id ON car_conditions(car_id);
CREATE INDEX idx_car_images_car_id ON car_images(car_id);
CREATE INDEX idx_car_documents_car_id ON car_documents(car_id);
CREATE INDEX idx_debts_client_id ON debts(client_id);
CREATE INDEX idx_debts_status ON debts(status);

-- Insert sample data
INSERT INTO clients (username, password, password_changed) VALUES
('test_client', 'test123', false),
('sigma_motors', 'sigma123', false),
('premium_auto', 'premium456', false);

-- Get client IDs for sample data
DO $$
DECLARE
    test_client_id UUID;
    sigma_client_id UUID;
    premium_client_id UUID;
BEGIN
    SELECT id INTO test_client_id FROM clients WHERE username = 'test_client';
    SELECT id INTO sigma_client_id FROM clients WHERE username = 'sigma_motors';
    SELECT id INTO premium_client_id FROM clients WHERE username = 'premium_auto';

    -- Insert sample dealers
    INSERT INTO dealers (client_id, name, email, phone, address, cnic, license_number) VALUES
    (test_client_id, 'Ahmed Motors', 'ahmed@motors.com', '+92-300-1234567', '123 Main Street, Karachi', '42101-1234567-1', 'DL-001'),
    (sigma_client_id, 'Sigma Auto Dealer', 'info@sigma.com', '+92-321-9876543', '456 Commercial Area, Lahore', '35202-9876543-2', 'DL-002');

    -- Insert sample buyers
    INSERT INTO buyers (client_id, name, email, phone, address, cnic) VALUES
    (test_client_id, 'Muhammad Ali', 'ali@email.com', '+92-300-1111111', '789 Residential Block, Islamabad', '61101-1111111-3'),
    (sigma_client_id, 'Fatima Khan', 'fatima@email.com', '+92-321-2222222', '321 Housing Society, Rawalpindi', '37405-2222222-4');

    -- Insert sample cars
    INSERT INTO cars (client_id, make, model, year, color, mileage, price, status, condition, description) VALUES
    (test_client_id, 'Toyota', 'Corolla', 2020, 'White', 25000, 2500000.00, 'available', 'Excellent', 'Well maintained family car'),
    (test_client_id, 'Honda', 'Civic', 2019, 'Black', 35000, 2800000.00, 'available', 'Good', 'Single owner, all documents clear'),
    (sigma_client_id, 'Suzuki', 'Alto', 2021, 'Red', 15000, 1800000.00, 'available', 'Excellent', 'Almost new condition'),
    (sigma_client_id, 'Toyota', 'Camry', 2018, 'Silver', 45000, 3200000.00, 'sold', 'Good', 'Luxury sedan with all features'),
    (premium_client_id, 'BMW', 'X3', 2020, 'Blue', 20000, 6500000.00, 'available', 'Excellent', 'Premium SUV with warranty');

END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Users can insert clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update clients" ON clients FOR UPDATE USING (true);
CREATE POLICY "Users can delete clients" ON clients FOR DELETE USING (true);

CREATE POLICY "Users can view all cars" ON cars FOR SELECT USING (true);
CREATE POLICY "Users can insert cars" ON cars FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update cars" ON cars FOR UPDATE USING (true);
CREATE POLICY "Users can delete cars" ON cars FOR DELETE USING (true);

CREATE POLICY "Users can view all dealers" ON dealers FOR SELECT USING (true);
CREATE POLICY "Users can insert dealers" ON dealers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update dealers" ON dealers FOR UPDATE USING (true);
CREATE POLICY "Users can delete dealers" ON dealers FOR DELETE USING (true);

CREATE POLICY "Users can view all buyers" ON buyers FOR SELECT USING (true);
CREATE POLICY "Users can insert buyers" ON buyers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update buyers" ON buyers FOR UPDATE USING (true);
CREATE POLICY "Users can delete buyers" ON buyers FOR DELETE USING (true);

CREATE POLICY "Users can view all car_conditions" ON car_conditions FOR SELECT USING (true);
CREATE POLICY "Users can insert car_conditions" ON car_conditions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update car_conditions" ON car_conditions FOR UPDATE USING (true);
CREATE POLICY "Users can delete car_conditions" ON car_conditions FOR DELETE USING (true);

CREATE POLICY "Users can view all car_images" ON car_images FOR SELECT USING (true);
CREATE POLICY "Users can insert car_images" ON car_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update car_images" ON car_images FOR UPDATE USING (true);
CREATE POLICY "Users can delete car_images" ON car_images FOR DELETE USING (true);

CREATE POLICY "Users can view all car_documents" ON car_documents FOR SELECT USING (true);
CREATE POLICY "Users can insert car_documents" ON car_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update car_documents" ON car_documents FOR UPDATE USING (true);
CREATE POLICY "Users can delete car_documents" ON car_documents FOR DELETE USING (true);

CREATE POLICY "Users can view all debts" ON debts FOR SELECT USING (true);
CREATE POLICY "Users can insert debts" ON debts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update debts" ON debts FOR UPDATE USING (true);
CREATE POLICY "Users can delete debts" ON debts FOR DELETE USING (true);
