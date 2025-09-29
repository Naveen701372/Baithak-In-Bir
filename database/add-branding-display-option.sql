-- Add branding display option to restaurant settings
-- This allows restaurants to choose between showing logo, text, or both

-- Add the branding_display column
ALTER TABLE restaurant_settings 
ADD COLUMN IF NOT EXISTS branding_display VARCHAR(10) DEFAULT 'both' CHECK (branding_display IN ('logo', 'text', 'both'));

-- Update existing records to have the default value
UPDATE restaurant_settings 
SET branding_display = 'both' 
WHERE branding_display IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN restaurant_settings.branding_display IS 'Controls what to display in branding: logo, text, or both';
