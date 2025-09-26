-- Fix foreign key constraint in user_sessions table
-- The constraint is still pointing to the old 'users' table instead of 'user_profiles'

-- First, drop the existing foreign key constraint
ALTER TABLE user_sessions 
DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;

-- Add the correct foreign key constraint pointing to user_profiles
ALTER TABLE user_sessions 
ADD CONSTRAINT user_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Also clean up any orphaned sessions that don't have matching user_profiles
DELETE FROM user_sessions 
WHERE user_id NOT IN (SELECT id FROM user_profiles);

-- Add unique constraint on session_token if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_session_token'
    ) THEN
        ALTER TABLE user_sessions 
        ADD CONSTRAINT unique_session_token 
        UNIQUE (session_token);
    END IF;
END $$;