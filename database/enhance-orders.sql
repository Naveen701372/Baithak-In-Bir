-- Enhance orders schema for better order management
-- Add payment status and individual item status tracking

-- Add payment status to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'paid', 'refunded'));

-- Add individual item status to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS item_status VARCHAR(20) DEFAULT 'pending' 
CHECK (item_status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed'));

-- Add completed quantity tracking for individual items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS completed_quantity INTEGER DEFAULT 0;

-- Add notes for individual items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add cancelled_at timestamp for tracking when orders are cancelled
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Add cancelled_reason for tracking why orders are cancelled
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;

-- Update existing order_items to have default status
UPDATE order_items 
SET item_status = 'pending' 
WHERE item_status IS NULL;

-- Create index for better performance on item status queries
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(item_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);