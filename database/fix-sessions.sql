-- Fix user_sessions table to prevent conflicts
-- Add unique constraint on session_token and clean up any duplicates

-- First, remove any duplicate sessions (keep the most recent one for each user)
DELETE FROM user_sessions 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM user_sessions 
  ORDER BY user_id, created_at DESC
);

-- Add unique constraint on session_token to prevent duplicates
ALTER TABLE user_sessions 
ADD CONSTRAINT unique_session_token 
UNIQUE (session_token);

-- Also add an index for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_unique ON user_sessions(session_token);