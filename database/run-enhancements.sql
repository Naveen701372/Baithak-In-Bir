-- Run this script in your Supabase SQL editor to add the missing columns

-- Check if columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add completed_quantity to order_items if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'completed_quantity') THEN
        ALTER TABLE order_items ADD COLUMN completed_quantity INTEGER DEFAULT 0;
    END IF;
    
    -- Add item_status to order_items if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'item_status') THEN
        ALTER TABLE order_items ADD COLUMN item_status VARCHAR(20) DEFAULT 'pending';
        ALTER TABLE order_items ADD CONSTRAINT order_items_item_status_check 
            CHECK (item_status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed'));
    END IF;
    
    -- Add notes to order_items if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'notes') THEN
        ALTER TABLE order_items ADD COLUMN notes TEXT;
    END IF;
    
    -- Add payment_status to orders if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
        ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
            CHECK (payment_status IN ('pending', 'paid', 'refunded'));
    END IF;
    
    -- Add cancelled_at to orders if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'cancelled_at') THEN
        ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add cancelled_reason to orders if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'cancelled_reason') THEN
        ALTER TABLE orders ADD COLUMN cancelled_reason TEXT;
    END IF;
END $$;

-- Update existing order_items to have default status and completed_quantity
UPDATE order_items 
SET item_status = 'pending' 
WHERE item_status IS NULL;

UPDATE order_items 
SET completed_quantity = 0 
WHERE completed_quantity IS NULL;

-- Ensure all existing order_items have proper defaults
UPDATE order_items 
SET 
  item_status = COALESCE(item_status, 'pending'),
  completed_quantity = COALESCE(completed_quantity, 0)
WHERE item_status IS NULL OR completed_quantity IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(item_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Show the updated schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('orders', 'order_items')
ORDER BY table_name, ordinal_position;