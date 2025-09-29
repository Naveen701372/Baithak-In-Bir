-- Update existing staff users to remove dashboard access
-- This ensures any existing staff users have the correct permissions

UPDATE user_profiles 
SET permissions = '{
  "dashboard": false,
  "orders": true,
  "menu": false,
  "inventory": false,
  "analytics": false,
  "users": false,
  "settings": false
}'::jsonb
WHERE role = 'staff' AND permissions ->> 'dashboard' = 'true';

-- Verify the update
SELECT email, role, permissions 
FROM user_profiles 
WHERE role = 'staff';
