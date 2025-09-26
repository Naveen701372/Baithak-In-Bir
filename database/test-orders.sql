-- Test orders for the order management system
-- Run this after you have menu items in your database

-- Insert some test orders
INSERT INTO orders (id, customer_name, customer_phone, status, total_amount, notes, created_at) VALUES
(gen_random_uuid(), 'John Doe', '+977-9841234567', 'pending', 450.00, 'Extra spicy please', NOW() - INTERVAL '5 minutes'),
(gen_random_uuid(), 'Jane Smith', '+977-9841234568', 'preparing', 280.00, NULL, NOW() - INTERVAL '15 minutes'),
(gen_random_uuid(), 'Mike Johnson', '+977-9841234569', 'ready', 720.00, 'No onions', NOW() - INTERVAL '25 minutes'),
(gen_random_uuid(), 'Sarah Wilson', '+977-9841234570', 'completed', 350.00, NULL, NOW() - INTERVAL '1 hour'),
(gen_random_uuid(), 'David Brown', '+977-9841234571', 'pending', 520.00, 'Table 5', NOW() - INTERVAL '2 minutes');

-- Note: You'll need to add order_items manually after creating menu_items
-- This is just to create the basic order structure for testing