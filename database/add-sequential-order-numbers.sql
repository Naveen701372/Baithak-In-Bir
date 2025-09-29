-- Add sequential order numbers to the orders table
-- This adds a new order_number field that auto-increments starting from 1

-- Add the order_number column with a sequence
DO $$ 
BEGIN
    -- Check if order_number column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_number'
    ) THEN
        -- Create a sequence for order numbers
        CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
        
        -- Add the order_number column
        ALTER TABLE orders ADD COLUMN order_number INTEGER;
        
        -- Set default value for the column to use the sequence
        ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT nextval('order_number_seq');
        
        -- Update existing orders with sequential numbers based on creation date
        WITH numbered_orders AS (
            SELECT id, row_number() OVER (ORDER BY created_at) as new_order_number
            FROM orders 
            WHERE order_number IS NULL
        )
        UPDATE orders 
        SET order_number = numbered_orders.new_order_number
        FROM numbered_orders
        WHERE orders.id = numbered_orders.id;
        
        -- Sync the sequence to start from the next available number
        PERFORM setval('order_number_seq', COALESCE((SELECT MAX(order_number) FROM orders), 0) + 1, false);
        
        -- Make the column NOT NULL after updating existing records
        ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
        
        -- Add a unique constraint
        ALTER TABLE orders ADD CONSTRAINT unique_order_number UNIQUE (order_number);
        
        -- Create an index for better performance
        CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
        
        RAISE NOTICE 'Successfully added order_number column with sequential numbers';
    ELSE
        RAISE NOTICE 'order_number column already exists';
    END IF;
END $$;
