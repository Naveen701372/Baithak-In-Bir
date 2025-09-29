-- Restaurant Settings Table
-- Stores restaurant branding information including name, logo, and theme colors
-- This script is idempotent and can be run multiple times safely

-- Restaurant settings table
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_name VARCHAR(200) NOT NULL DEFAULT 'Baithak In Bir',
  logo_url TEXT,
  tagline TEXT,
  -- Theme colors for customer-facing interface
  primary_color VARCHAR(7) NOT NULL DEFAULT '#14b8a6', -- teal-500
  secondary_color VARCHAR(7) NOT NULL DEFAULT '#0f766e', -- teal-600
  accent_color VARCHAR(7) NOT NULL DEFAULT '#f0fdfa', -- teal-50
  text_color VARCHAR(7) NOT NULL DEFAULT '#111827', -- gray-900
  -- Contact information
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  -- Operating hours
  operating_hours JSONB DEFAULT '{}',
  -- Additional settings
  currency VARCHAR(10) DEFAULT 'INR',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (single restaurant)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'restaurant_settings' AND policyname = 'Allow all operations') THEN
    CREATE POLICY "Allow all operations" ON restaurant_settings FOR ALL USING (true);
  END IF;
END $$;

-- Insert default restaurant settings if none exist
INSERT INTO restaurant_settings (
  restaurant_name,
  primary_color,
  secondary_color,
  accent_color,
  text_color,
  phone,
  email
) 
SELECT 
  'Baithak In Bir',
  '#14b8a6',
  '#0f766e', 
  '#f0fdfa',
  '#111827',
  '+91-XXXXXXXXXX',
  'contact@baithak-in-bir.com'
WHERE NOT EXISTS (SELECT 1 FROM restaurant_settings);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_active ON restaurant_settings(is_active);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_restaurant_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_restaurant_settings_updated_at ON restaurant_settings;
CREATE TRIGGER trigger_update_restaurant_settings_updated_at
  BEFORE UPDATE ON restaurant_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_settings_updated_at();
