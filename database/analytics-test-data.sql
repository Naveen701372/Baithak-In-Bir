-- Analytics Test Data
-- Creates sample orders across different time periods to demonstrate analytics
-- Run this after running the main seed.sql file

-- Clear existing test data (optional)
-- DELETE FROM order_items;
-- DELETE FROM orders;

-- Insert diverse orders across different time periods for analytics demonstration
DO $$
DECLARE
    order_id_1 UUID := gen_random_uuid();
    order_id_2 UUID := gen_random_uuid();
    order_id_3 UUID := gen_random_uuid();
    order_id_4 UUID := gen_random_uuid();
    order_id_5 UUID := gen_random_uuid();
    order_id_6 UUID := gen_random_uuid();
    order_id_7 UUID := gen_random_uuid();
    order_id_8 UUID := gen_random_uuid();
    order_id_9 UUID := gen_random_uuid();
    order_id_10 UUID := gen_random_uuid();
    order_id_11 UUID := gen_random_uuid();
    order_id_12 UUID := gen_random_uuid();
    order_id_13 UUID := gen_random_uuid();
    order_id_14 UUID := gen_random_uuid();
    order_id_15 UUID := gen_random_uuid();
    order_id_16 UUID := gen_random_uuid();
    order_id_17 UUID := gen_random_uuid();
    order_id_18 UUID := gen_random_uuid();
    order_id_19 UUID := gen_random_uuid();
    order_id_20 UUID := gen_random_uuid();
BEGIN
    -- Orders from today (morning rush - 8 AM)
    INSERT INTO orders (id, customer_name, customer_phone, status, total_amount, payment_status, notes, created_at) VALUES
    (order_id_1, 'Rajesh Kumar', '+977-9841234567', 'completed', 270.00, 'paid', 'Extra sugar in tea', NOW() - INTERVAL '2 hours'),
    (order_id_2, 'Priya Sharma', '+977-9841234568', 'completed', 430.00, 'paid', 'Make it spicy', NOW() - INTERVAL '1 hour 45 minutes');

    -- Orders from today (lunch rush - 12 PM)
    INSERT INTO orders (id, customer_name, customer_phone, status, total_amount, payment_status, notes, created_at) VALUES
    (order_id_3, 'Amit Thapa', '+977-9841234569', 'completed', 580.00, 'paid', 'Less oil', NOW() - INTERVAL '5 hours'),
    (order_id_4, 'Sunita Rai', '+977-9841234570', 'ready', 320.00, 'pending', 'Table 3', NOW() - INTERVAL '4 hours 30 minutes'),
    (order_id_5, 'Krishna Bahadur', '+977-9841234571', 'completed', 450.00, 'paid', NULL, NOW() - INTERVAL '4 hours');

    -- Orders from today (evening rush - 6 PM)
    INSERT INTO orders (id, customer_name, customer_phone, status, total_amount, payment_status, notes, created_at) VALUES
    (order_id_6, 'Maya Gurung', '+977-9841234572', 'preparing', 380.00, 'pending', 'Extra cheese', NOW() - INTERVAL '30 minutes'),
    (order_id_7, 'Deepak Shrestha', '+977-9841234573', 'pending', 250.00, 'pending', 'Quick service please', NOW() - INTERVAL '15 minutes');

    -- Orders from yesterday (various times)
    INSERT INTO orders (id, customer_name, customer_phone, status, total_amount, payment_status, notes, created_at) VALUES
    (order_id_8, 'Sita Poudel', '+977-9841234574', 'completed', 490.00, 'paid', NULL, NOW() - INTERVAL '1 day 6 hours'),
    (order_id_9, 'Ravi Magar', '+977-9841234575', 'completed', 340.00, 'paid', 'Hot and fresh', NOW() - INTERVAL '1 day 4 hours'),
    (order_id_10, 'Kamala Khadka', '+977-9841234576', 'completed', 420.00, 'paid', 'Less spice', NOW() - INTERVAL '1 day 2 hours');

    -- Orders from 2 days ago
    INSERT INTO orders (id, customer_name, customer_phone, status, total_amount, payment_status, notes, created_at) VALUES
    (order_id_11, 'Bikash Tamang', '+977-9841234577', 'completed', 380.00, 'paid', NULL, NOW() - INTERVAL '2 days 8 hours'),
    (order_id_12, 'Gita Limbu', '+977-9841234578', 'completed', 520.00, 'paid', 'Extra sauce', NOW() - INTERVAL '2 days 6 hours');

    -- Orders from 3 days ago  
    INSERT INTO orders (id, customer_name, customer_phone, status, total_amount, payment_status, notes, created_at) VALUES
    (order_id_13, 'Mohan Adhikari', '+977-9841234579', 'completed', 290.00, 'paid', NULL, NOW() - INTERVAL '3 days 7 hours'),
    (order_id_14, 'Laxmi Bhattarai', '+977-9841234580', 'completed', 610.00, 'paid', 'Family order', NOW() - INTERVAL '3 days 5 hours');

    -- Orders from 4 days ago
    INSERT INTO orders (id, customer_name, customer_phone, status, total_amount, payment_status, notes, created_at) VALUES
    (order_id_15, 'Santosh Karki', '+977-9841234581', 'completed', 350.00, 'paid', NULL, NOW() - INTERVAL '4 days 9 hours'),
    (order_id_16, 'Sarita Thapa', '+977-9841234582', 'completed', 470.00, 'paid', 'Medium spice', NOW() - INTERVAL '4 days 3 hours');

    -- Orders from 5 days ago
    INSERT INTO orders (id, customer_name, customer_phone, status, total_amount, payment_status, notes, created_at) VALUES
    (order_id_17, 'Binod Shahi', '+977-9841234583', 'completed', 320.00, 'paid', NULL, NOW() - INTERVAL '5 days 8 hours'),
    (order_id_18, 'Anita Rana', '+977-9841234584', 'completed', 540.00, 'paid', 'Party order', NOW() - INTERVAL '5 days 4 hours');

    -- Orders from 6 days ago  
    INSERT INTO orders (id, customer_name, customer_phone, status, total_amount, payment_status, notes, created_at) VALUES
    (order_id_19, 'Suresh Basnet', '+977-9841234585', 'completed', 280.00, 'paid', NULL, NOW() - INTERVAL '6 days 7 hours'),
    (order_id_20, 'Mina Chapagain', '+977-9841234586', 'completed', 390.00, 'paid', 'Extra fresh', NOW() - INTERVAL '6 days 2 hours');

    -- Now insert order items for realistic analytics
    
    -- Order 1: Morning coffee and sandwich (order_id_1 - ₹270)
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_1, (SELECT id FROM menu_items WHERE name = 'Hot Coffee'), 1, 100.00, 100.00, 'completed'),
    (order_id_1, (SELECT id FROM menu_items WHERE name = 'Filter Coffee'), 1, 120.00, 120.00, 'completed'),
    (order_id_1, (SELECT id FROM menu_items WHERE name = 'Hot Tea'), 1, 40.00, 40.00, 'completed'),
    (order_id_1, (SELECT id FROM menu_items WHERE name = 'Masala Tea'), 1, 50.00, 50.00, 'completed');

    -- Order 2: Breakfast combo (order_id_2 - ₹430)
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_2, (SELECT id FROM menu_items WHERE name = 'Veggie Sandwich'), 2, 130.00, 260.00, 'completed'),
    (order_id_2, (SELECT id FROM menu_items WHERE name = 'Masala Tea'), 2, 50.00, 100.00, 'completed'),
    (order_id_2, (SELECT id FROM menu_items WHERE name = 'Lemon Tea'), 1, 60.00, 60.00, 'completed'),
    (order_id_2, (SELECT id FROM menu_items WHERE name = 'Lemonade'), 1, 100.00, 10.00, 'completed');

    -- Order 3: Lunch special (order_id_3 - ₹580)
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_3, (SELECT id FROM menu_items WHERE name = 'Sambhar Rice'), 2, 180.00, 360.00, 'completed'),
    (order_id_3, (SELECT id FROM menu_items WHERE name = 'Tawa Burger'), 1, 150.00, 150.00, 'completed'),
    (order_id_3, (SELECT id FROM menu_items WHERE name = 'Lemonade'), 1, 100.00, 70.00, 'completed');

    -- Order 4: Snacks order (order_id_4 - ₹320)
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_4, (SELECT id FROM menu_items WHERE name = 'Cheesy Nachos'), 1, 150.00, 150.00, 'ready'),
    (order_id_4, (SELECT id FROM menu_items WHERE name = 'Oreo Shake'), 1, 150.00, 150.00, 'ready'),
    (order_id_4, (SELECT id FROM menu_items WHERE name = 'Masala Tea'), 1, 50.00, 20.00, 'ready');

    -- Order 5: Family order (order_id_5 - ₹450)
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_5, (SELECT id FROM menu_items WHERE name = 'Veggie Maggi'), 2, 120.00, 240.00, 'completed'),
    (order_id_5, (SELECT id FROM menu_items WHERE name = 'BGC Maggi'), 1, 130.00, 130.00, 'completed'),
    (order_id_5, (SELECT id FROM menu_items WHERE name = 'Cold Coffee'), 1, 140.00, 80.00, 'completed');

    -- Order 6: Evening snacks (order_id_6 - ₹380)
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_6, (SELECT id FROM menu_items WHERE name = 'Mushroom Cheese Toast'), 2, 130.00, 260.00, 'preparing'),
    (order_id_6, (SELECT id FROM menu_items WHERE name = 'Nutella Shake'), 1, 160.00, 120.00, 'preparing');

    -- Order 7: Quick bite (order_id_7 - ₹250)
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_7, (SELECT id FROM menu_items WHERE name = 'Plain Maggi'), 2, 80.00, 160.00, 'pending'),
    (order_id_7, (SELECT id FROM menu_items WHERE name = 'Iced Tea'), 1, 120.00, 90.00, 'pending');

    -- Order 8: Yesterday's popular order (order_id_8 - ₹490)
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_8, (SELECT id FROM menu_items WHERE name = 'Paneer Wrap'), 2, 150.00, 300.00, 'completed'),
    (order_id_8, (SELECT id FROM menu_items WHERE name = 'Banana Shake'), 1, 130.00, 130.00, 'completed'),
    (order_id_8, (SELECT id FROM menu_items WHERE name = 'Masala Tea'), 1, 50.00, 60.00, 'completed');

    -- Order 9: Coffee lovers (order_id_9 - ₹340)
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_9, (SELECT id FROM menu_items WHERE name = 'Filter Coffee'), 2, 120.00, 240.00, 'completed'),
    (order_id_9, (SELECT id FROM menu_items WHERE name = 'Hot Coffee'), 1, 100.00, 100.00, 'completed');

    -- Order 10: Variety order (order_id_10 - ₹420)
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_10, (SELECT id FROM menu_items WHERE name = 'Veg Pakode'), 1, 150.00, 150.00, 'completed'),
    (order_id_10, (SELECT id FROM menu_items WHERE name = 'Garlic Bread'), 1, 130.00, 130.00, 'completed'),
    (order_id_10, (SELECT id FROM menu_items WHERE name = 'Cold Coffee'), 1, 140.00, 140.00, 'completed');

    -- Continue with remaining orders (simplified for brevity)
    -- Order 11-20: Add similar diverse order items
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_status) VALUES
    (order_id_11, (SELECT id FROM menu_items WHERE name = 'Tawa Burger'), 1, 150.00, 150.00, 'completed'),
    (order_id_11, (SELECT id FROM menu_items WHERE name = 'Oreo Shake'), 1, 150.00, 150.00, 'completed'),
    (order_id_11, (SELECT id FROM menu_items WHERE name = 'Masala Tea'), 1, 50.00, 80.00, 'completed'),

    (order_id_12, (SELECT id FROM menu_items WHERE name = 'Sambhar Rice'), 1, 180.00, 180.00, 'completed'),
    (order_id_12, (SELECT id FROM menu_items WHERE name = 'Cheesy Nachos'), 1, 150.00, 150.00, 'completed'),
    (order_id_12, (SELECT id FROM menu_items WHERE name = 'Nutella Shake'), 1, 160.00, 160.00, 'completed'),
    (order_id_12, (SELECT id FROM menu_items WHERE name = 'Lemonade'), 1, 100.00, 30.00, 'completed'),

    (order_id_13, (SELECT id FROM menu_items WHERE name = 'BGC Maggi'), 1, 130.00, 130.00, 'completed'),
    (order_id_13, (SELECT id FROM menu_items WHERE name = 'Filter Coffee'), 1, 120.00, 120.00, 'completed'),
    (order_id_13, (SELECT id FROM menu_items WHERE name = 'Hot Tea'), 1, 40.00, 40.00, 'completed'),

    (order_id_14, (SELECT id FROM menu_items WHERE name = 'Paneer Wrap'), 2, 150.00, 300.00, 'completed'),
    (order_id_14, (SELECT id FROM menu_items WHERE name = 'Veggie Wrap'), 1, 130.00, 130.00, 'completed'),
    (order_id_14, (SELECT id FROM menu_items WHERE name = 'Cold Coffee'), 2, 140.00, 180.00, 'completed'),

    (order_id_15, (SELECT id FROM menu_items WHERE name = 'Mushroom Cheese Toast'), 1, 130.00, 130.00, 'completed'),
    (order_id_15, (SELECT id FROM menu_items WHERE name = 'Banana Shake'), 1, 130.00, 130.00, 'completed'),
    (order_id_15, (SELECT id FROM menu_items WHERE name = 'Masala Tea'), 1, 50.00, 90.00, 'completed'),

    (order_id_16, (SELECT id FROM menu_items WHERE name = 'Veggie Sandwich'), 2, 130.00, 260.00, 'completed'),
    (order_id_16, (SELECT id FROM menu_items WHERE name = 'Oreo Shake'), 1, 150.00, 150.00, 'completed'),
    (order_id_16, (SELECT id FROM menu_items WHERE name = 'Lemon Tea'), 1, 60.00, 60.00, 'completed'),

    (order_id_17, (SELECT id FROM menu_items WHERE name = 'Plain Maggi'), 2, 80.00, 160.00, 'completed'),
    (order_id_17, (SELECT id FROM menu_items WHERE name = 'Iced Tea'), 1, 120.00, 120.00, 'completed'),
    (order_id_17, (SELECT id FROM menu_items WHERE name = 'Hot Tea'), 1, 40.00, 40.00, 'completed'),

    (order_id_18, (SELECT id FROM menu_items WHERE name = 'Tawa Burger'), 2, 150.00, 300.00, 'completed'),
    (order_id_18, (SELECT id FROM menu_items WHERE name = 'Cheesy Nachos'), 1, 150.00, 150.00, 'completed'),
    (order_id_18, (SELECT id FROM menu_items WHERE name = 'Nutella Shake'), 1, 160.00, 90.00, 'completed'),

    (order_id_19, (SELECT id FROM menu_items WHERE name = 'Veggie Maggi'), 1, 120.00, 120.00, 'completed'),
    (order_id_19, (SELECT id FROM menu_items WHERE name = 'Filter Coffee'), 1, 120.00, 120.00, 'completed'),
    (order_id_19, (SELECT id FROM menu_items WHERE name = 'Hot Tea'), 1, 40.00, 40.00, 'completed'),

    (order_id_20, (SELECT id FROM menu_items WHERE name = 'Sambhar Rice'), 1, 180.00, 180.00, 'completed'),
    (order_id_20, (SELECT id FROM menu_items WHERE name = 'Veg Pakode'), 1, 150.00, 150.00, 'completed'),
    (order_id_20, (SELECT id FROM menu_items WHERE name = 'Lemonade'), 1, 100.00, 60.00, 'completed');

END $$;

-- Update order numbers for the new orders if the column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_number'
    ) THEN
        -- Update order numbers for new orders
        WITH numbered_orders AS (
            SELECT id, row_number() OVER (ORDER BY created_at) as new_order_number
            FROM orders 
            WHERE order_number IS NULL
        )
        UPDATE orders 
        SET order_number = numbered_orders.new_order_number + COALESCE((SELECT MAX(order_number) FROM orders WHERE order_number IS NOT NULL), 0)
        FROM numbered_orders
        WHERE orders.id = numbered_orders.id;
    END IF;
END $$;

-- Display summary
DO $$
DECLARE
    order_count INTEGER;
    total_revenue DECIMAL(10,2);
BEGIN
    SELECT COUNT(*), SUM(total_amount) INTO order_count, total_revenue FROM orders;
    RAISE NOTICE 'Analytics test data created successfully!';
    RAISE NOTICE 'Total Orders: %, Total Revenue: $%', order_count, total_revenue;
END $$;
