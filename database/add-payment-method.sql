-- Add payment method field to orders table
-- This allows tracking whether payment was made via UPI, Cash, etc.

DO $$ 
BEGIN
    -- Check if payment_method column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_method'
    ) THEN
        -- Add the payment_method column
        ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20);
        
        -- Add a check constraint for valid payment methods
        ALTER TABLE orders ADD CONSTRAINT payment_method_check 
        CHECK (payment_method IS NULL OR payment_method IN ('UPI', 'Cash', 'Card'));
        
        -- Create an index for better performance
        CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
        
        RAISE NOTICE 'Successfully added payment_method column';
    ELSE
        RAISE NOTICE 'payment_method column already exists';
    END IF;
END $$;
