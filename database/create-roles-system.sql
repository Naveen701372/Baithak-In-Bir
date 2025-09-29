-- Create roles management system
-- This allows dynamic role and permission management through the UI

-- Create roles table to store role definitions
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system roles
INSERT INTO roles (id, name, description, permissions, is_system) VALUES
  ('owner', 'Owner', 'Full access to all features', '{
    "dashboard": true,
    "orders": true,
    "menu": true,
    "inventory": true,
    "analytics": true,
    "users": true,
    "settings": true
  }'::jsonb, true),
  
  ('manager', 'Manager', 'Access to most features except user management', '{
    "dashboard": true,
    "orders": true,
    "menu": true,
    "inventory": true,
    "analytics": true,
    "users": false,
    "settings": false
  }'::jsonb, true),
  
  ('staff', 'Staff', 'Limited access to orders only', '{
    "dashboard": false,
    "orders": true,
    "menu": false,
    "inventory": false,
    "analytics": false,
    "users": false,
    "settings": false
  }'::jsonb, true)

ON CONFLICT (id) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  updated_at = CURRENT_TIMESTAMP;

-- Update user_profiles table to reference roles table
-- Add a foreign key constraint to ensure users have valid roles
DO $$
BEGIN
  -- Add role_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'role_id') THEN
    ALTER TABLE user_profiles ADD COLUMN role_id TEXT;
  END IF;
END $$;

-- Update existing users to use role_id
UPDATE user_profiles 
SET role_id = role 
WHERE role_id IS NULL;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'fk_user_profiles_role') THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT fk_user_profiles_role 
    FOREIGN KEY (role_id) REFERENCES roles(id);
  END IF;
END $$;

-- Create function to automatically update permissions when role changes
CREATE OR REPLACE FUNCTION update_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- When role_id changes, update permissions to match the role
  IF NEW.role_id IS DISTINCT FROM OLD.role_id THEN
    SELECT permissions INTO NEW.permissions 
    FROM roles 
    WHERE id = NEW.role_id;
  END IF;
  
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update permissions
DROP TRIGGER IF EXISTS trigger_update_user_permissions ON user_profiles;
CREATE TRIGGER trigger_update_user_permissions
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_permissions();

-- Create function to update all users when a role's permissions change
CREATE OR REPLACE FUNCTION update_role_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- When role permissions change, update all users with that role
  UPDATE user_profiles 
  SET permissions = NEW.permissions,
      updated_at = CURRENT_TIMESTAMP
  WHERE role_id = NEW.id;
  
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role permission updates
DROP TRIGGER IF EXISTS trigger_update_role_permissions ON roles;
CREATE TRIGGER trigger_update_role_permissions
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_role_permissions();

-- Add RLS policies for roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read roles
CREATE POLICY "Allow authenticated users to read roles" ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow owners to manage roles
CREATE POLICY "Allow owners to manage roles" ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.permissions->>'users' = 'true'
    )
  );

-- Create view for role statistics
CREATE OR REPLACE VIEW role_stats AS
SELECT 
  r.id,
  r.name,
  r.description,
  r.permissions,
  r.is_system,
  COUNT(up.id) as user_count
FROM roles r
LEFT JOIN user_profiles up ON r.id = up.role_id
GROUP BY r.id, r.name, r.description, r.permissions, r.is_system
ORDER BY r.name;
