-- Simple user seed data for Baithak In Bir
-- Creates a test user in Supabase Auth and adds their profile

DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Try to create a user in auth.users (this might fail if user already exists)
    BEGIN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@baithak.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO test_user_id;
        
        -- Insert the user profile
        INSERT INTO user_profiles (id, email, role, permissions, is_active)
        VALUES (
            test_user_id,
            'admin@baithak.com',
            'owner',
            '{"dashboard": true, "orders": true, "menu": true, "inventory": true, "analytics": true, "users": true, "settings": true}',
            true
        );
        
        RAISE NOTICE 'Test user created successfully with email: admin@baithak.com and password: admin123';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not create auth user (may already exist): %', SQLERRM;
        
        -- Try to find existing user and create profile
        SELECT id INTO test_user_id FROM auth.users WHERE email = 'admin@baithak.com' LIMIT 1;
        
        IF test_user_id IS NOT NULL THEN
            INSERT INTO user_profiles (id, email, role, permissions, is_active)
            VALUES (
                test_user_id,
                'admin@baithak.com',
                'owner',
                '{"dashboard": true, "orders": true, "menu": true, "inventory": true, "analytics": true, "users": true, "settings": true}',
                true
            )
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'User profile created for existing auth user';
        END IF;
    END;
END $$;