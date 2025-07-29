-- Create storage buckets for file uploads

-- Create car images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create car documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-documents', 'car-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create debt documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('debt-documents', 'debt-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for car-images bucket
CREATE POLICY "Allow public read access on car images"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-images');

CREATE POLICY "Allow authenticated users to upload car images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'car-images');

CREATE POLICY "Allow authenticated users to update car images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'car-images');

CREATE POLICY "Allow authenticated users to delete car images"
ON storage.objects FOR DELETE
USING (bucket_id = 'car-images');

-- Set up storage policies for car-documents bucket
CREATE POLICY "Allow public read access on car documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-documents');

CREATE POLICY "Allow authenticated users to upload car documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'car-documents');

CREATE POLICY "Allow authenticated users to update car documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'car-documents');

CREATE POLICY "Allow authenticated users to delete car documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'car-documents');

-- Set up storage policies for debt-documents bucket
CREATE POLICY "Allow public read access on debt documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'debt-documents');

CREATE POLICY "Allow authenticated users to upload debt documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'debt-documents');

CREATE POLICY "Allow authenticated users to update debt documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'debt-documents');

CREATE POLICY "Allow authenticated users to delete debt documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'debt-documents');
