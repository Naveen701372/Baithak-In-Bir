-- Seed data for Baithak In Bir menu
-- This script is idempotent and can be run multiple times safely

-- Insert categories (only if they don't exist)
INSERT INTO categories (name, description, display_order) 
SELECT * FROM (VALUES
('Hot Beverages', 'Freshly brewed teas and coffees to warm your soul', 1),
('Cold Beverages', 'Refreshing drinks to beat the heat', 2),
('Shakes & Smoothies', 'Creamy and delicious blended treats', 3),
('Quick Bites', 'Fast and tasty Maggi varieties', 4),
('Sandwiches & Wraps', 'Hearty sandwiches and wraps made fresh', 5),
('Mains & Snacks', 'Satisfying meals and crispy snacks', 6),
('Today''s Special', 'Chef''s special recommendations', 7)
) AS new_categories(name, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.name = new_categories.name
);

-- Insert menu items (only if they don't exist)
-- Hot Beverages
INSERT INTO menu_items (category_id, name, description, price, display_order, is_featured) 
SELECT category_id, name, description, price, display_order, is_featured
FROM (VALUES
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Hot Tea', 'Classic Indian tea brewed to perfection', 40.00, 1, false),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Masala Tea', 'Aromatic spiced tea with traditional Indian spices', 50.00, 2, true),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Black Tea', 'Pure black tea for the purists', 50.00, 3, false),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Lemon Tea', 'Refreshing tea with a zesty lemon twist', 60.00, 4, false),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'GLIH', 'Our signature special blend', 80.00, 5, true),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Hot Coffee', 'Rich and aromatic coffee to kickstart your day', 100.00, 6, false),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Filter Coffee', 'South Indian style filter coffee', 120.00, 7, true),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Black Coffee', 'Strong black coffee for coffee lovers', 80.00, 8, false)
) AS new_items(category_id, name, description, price, display_order, is_featured)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name = new_items.name
);

-- Cold Beverages
INSERT INTO menu_items (category_id, name, description, price, display_order) 
SELECT category_id, name, description, price, display_order
FROM (VALUES
((SELECT id FROM categories WHERE name = 'Cold Beverages'), 'Cold Coffee', 'Chilled coffee with a perfect blend of flavors', 140.00, 1),
((SELECT id FROM categories WHERE name = 'Cold Beverages'), 'Iced Tea', 'Cool and refreshing iced tea', 120.00, 2),
((SELECT id FROM categories WHERE name = 'Cold Beverages'), 'Lemonade', 'Fresh lime water to quench your thirst', 100.00, 3)
) AS new_items(category_id, name, description, price, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name = new_items.name
);

-- Shakes & Smoothies
INSERT INTO menu_items (category_id, name, description, price, display_order, is_featured) 
SELECT category_id, name, description, price, display_order, is_featured
FROM (VALUES
((SELECT id FROM categories WHERE name = 'Shakes & Smoothies'), 'Banana Shake', 'Creamy banana shake (Add Peanut Butter +₹20)', 130.00, 1, false),
((SELECT id FROM categories WHERE name = 'Shakes & Smoothies'), 'Oreo Shake', 'Indulgent Oreo cookie shake', 150.00, 2, true),
((SELECT id FROM categories WHERE name = 'Shakes & Smoothies'), 'Nutella Shake', 'Rich and creamy Nutella shake', 160.00, 3, true)
) AS new_items(category_id, name, description, price, display_order, is_featured)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name = new_items.name
);

-- Quick Bites
INSERT INTO menu_items (category_id, name, description, price, display_order) 
SELECT category_id, name, description, price, display_order
FROM (VALUES
((SELECT id FROM categories WHERE name = 'Quick Bites'), 'Plain Maggi', 'Simple and classic Maggi noodles', 80.00, 1),
((SELECT id FROM categories WHERE name = 'Quick Bites'), 'Veggie Maggi', 'Maggi loaded with fresh vegetables', 120.00, 2),
((SELECT id FROM categories WHERE name = 'Quick Bites'), 'BGC Maggi', 'Special BGC style Maggi with extra flavors', 130.00, 3)
) AS new_items(category_id, name, description, price, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name = new_items.name
);

-- Sandwiches & Wraps
INSERT INTO menu_items (category_id, name, description, price, display_order, is_featured) 
SELECT category_id, name, description, price, display_order, is_featured
FROM (VALUES
((SELECT id FROM categories WHERE name = 'Sandwiches & Wraps'), 'Veggie Sandwich', 'Fresh vegetable sandwich with herbs', 130.00, 1, false),
((SELECT id FROM categories WHERE name = 'Sandwiches & Wraps'), 'Garlic Bread', 'Crispy garlic bread with herbs and butter', 130.00, 2, false),
((SELECT id FROM categories WHERE name = 'Sandwiches & Wraps'), 'Mushroom Cheese Toast', 'Grilled toast with mushrooms and melted cheese', 130.00, 3, true),
((SELECT id FROM categories WHERE name = 'Sandwiches & Wraps'), 'Veggie Wrap', 'Fresh vegetables wrapped in soft tortilla', 130.00, 4, false),
((SELECT id FROM categories WHERE name = 'Sandwiches & Wraps'), 'Paneer Wrap', 'Grilled paneer wrap with spices and vegetables', 150.00, 5, true)
) AS new_items(category_id, name, description, price, display_order, is_featured)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name = new_items.name
);

-- Mains & Snacks
INSERT INTO menu_items (category_id, name, description, price, display_order, is_featured) 
SELECT category_id, name, description, price, display_order, is_featured
FROM (VALUES
((SELECT id FROM categories WHERE name = 'Mains & Snacks'), 'Tawa Burger', 'Grilled burger with fresh ingredients', 150.00, 1, true),
((SELECT id FROM categories WHERE name = 'Mains & Snacks'), 'Cheesy Nachos', 'Crispy nachos loaded with melted cheese', 150.00, 2, true),
((SELECT id FROM categories WHERE name = 'Mains & Snacks'), 'Veg Pakode', 'Crispy vegetable fritters with chutney', 150.00, 3, false)
) AS new_items(category_id, name, description, price, display_order, is_featured)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name = new_items.name
);

-- Today's Special
INSERT INTO menu_items (category_id, name, description, price, display_order, is_featured) 
SELECT category_id, name, description, price, display_order, is_featured
FROM (VALUES
((SELECT id FROM categories WHERE name = 'Today''s Special'), 'Sambhar Rice', 'Traditional South Indian sambhar with steamed rice', 180.00, 1, true)
) AS new_items(category_id, name, description, price, display_order, is_featured)
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items 
  WHERE menu_items.category_id = new_items.category_id 
  AND menu_items.name = new_items.name
);

-- Insert default admin user (only if it doesn't exist)
-- Note: In production, you should create this user through Supabase Auth first
-- This is a placeholder - the actual user creation will be done through the admin interface
-- Skip user creation if the table structure doesn't match our schema
DO $$
BEGIN
  -- Check if our custom users table exists with the expected structure
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'full_name'
    AND table_schema = 'public'
  ) THEN
    -- Insert admin user only if it doesn't exist and table has correct structure
    INSERT INTO users (id, email, full_name, role, permissions, is_active) 
    SELECT '00000000-0000-0000-0000-000000000001', 'baithakinbir@gmail.com', 'Restaurant Owner', 'owner', 
    '{"dashboard": true, "orders": true, "menu": true, "inventory": true, "analytics": true, "users": true, "settings": true}', 
    true
    WHERE NOT EXISTS (
      SELECT 1 FROM users WHERE email = 'baithakinbir@gmail.com'
    );
  ELSE
    -- Log that user creation was skipped
    RAISE NOTICE 'Skipping admin user creation - users table does not have expected structure. Please run schema.sql first or create user manually.';
  END IF;
END $$;

-- Insert sample inventory items (only if they don't exist)
INSERT INTO inventory_items (name, unit, current_stock, minimum_stock, cost_per_unit) 
SELECT * FROM (VALUES
('Tea Leaves', 'kg', 5.0, 1.0, 200.00),
('Coffee Beans', 'kg', 3.0, 0.5, 800.00),
('Milk', 'liters', 20.0, 5.0, 60.00),
('Sugar', 'kg', 10.0, 2.0, 45.00),
('Bread Slices', 'packets', 15, 3, 25.00),
('Cheese', 'kg', 2.0, 0.5, 400.00),
('Vegetables Mix', 'kg', 5.0, 1.0, 80.00),
('Maggi Packets', 'pieces', 50, 10, 12.00),
('Paneer', 'kg', 1.5, 0.3, 300.00),
('Mushrooms', 'kg', 2.0, 0.5, 150.00)
) AS new_inventory(name, unit, current_stock, minimum_stock, cost_per_unit)
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_items WHERE inventory_items.name = new_inventory.name
);

-- Link menu items to inventory (sample relationships) - only if they don't exist
-- We'll use a more complex approach to avoid duplicates
DO $$
BEGIN
  -- Hot Tea requires tea leaves, milk, sugar
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Hot Tea' AND i.name = 'Tea Leaves'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Hot Tea'), (SELECT id FROM inventory_items WHERE name = 'Tea Leaves'), 0.01);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Hot Tea' AND i.name = 'Milk'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Hot Tea'), (SELECT id FROM inventory_items WHERE name = 'Milk'), 0.1);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Hot Tea' AND i.name = 'Sugar'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Hot Tea'), (SELECT id FROM inventory_items WHERE name = 'Sugar'), 0.01);
  END IF;

  -- Masala Tea
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Masala Tea' AND i.name = 'Tea Leaves'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Masala Tea'), (SELECT id FROM inventory_items WHERE name = 'Tea Leaves'), 0.015);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Masala Tea' AND i.name = 'Milk'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Masala Tea'), (SELECT id FROM inventory_items WHERE name = 'Milk'), 0.1);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Masala Tea' AND i.name = 'Sugar'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Masala Tea'), (SELECT id FROM inventory_items WHERE name = 'Sugar'), 0.01);
  END IF;

  -- Hot Coffee
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Hot Coffee' AND i.name = 'Coffee Beans'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Hot Coffee'), (SELECT id FROM inventory_items WHERE name = 'Coffee Beans'), 0.02);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Hot Coffee' AND i.name = 'Milk'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Hot Coffee'), (SELECT id FROM inventory_items WHERE name = 'Milk'), 0.1);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Hot Coffee' AND i.name = 'Sugar'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Hot Coffee'), (SELECT id FROM inventory_items WHERE name = 'Sugar'), 0.01);
  END IF;

  -- Plain Maggi
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Plain Maggi' AND i.name = 'Maggi Packets'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Plain Maggi'), (SELECT id FROM inventory_items WHERE name = 'Maggi Packets'), 1);
  END IF;

  -- Veggie Sandwich
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Veggie Sandwich' AND i.name = 'Bread Slices'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Veggie Sandwich'), (SELECT id FROM inventory_items WHERE name = 'Bread Slices'), 2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM menu_item_inventory mi 
    JOIN menu_items m ON mi.menu_item_id = m.id 
    JOIN inventory_items i ON mi.inventory_item_id = i.id 
    WHERE m.name = 'Veggie Sandwich' AND i.name = 'Vegetables Mix'
  ) THEN
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    ((SELECT id FROM menu_items WHERE name = 'Veggie Sandwich'), (SELECT id FROM inventory_items WHERE name = 'Vegetables Mix'), 0.1);
  END IF;
END $$;

-- Update timestamps
UPDATE categories SET updated_at = NOW();
UPDATE menu_items SET updated_at = NOW();
UPDATE inventory_items SET updated_at = NOW();