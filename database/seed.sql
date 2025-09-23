-- Seed data for Baithak In Bir menu

-- Insert categories
INSERT INTO categories (name, description, display_order) VALUES
('Hot Beverages', 'Freshly brewed teas and coffees to warm your soul', 1),
('Cold Beverages', 'Refreshing drinks to beat the heat', 2),
('Shakes & Smoothies', 'Creamy and delicious blended treats', 3),
('Quick Bites', 'Fast and tasty Maggi varieties', 4),
('Sandwiches & Wraps', 'Hearty sandwiches and wraps made fresh', 5),
('Mains & Snacks', 'Satisfying meals and crispy snacks', 6),
('Today''s Special', 'Chef''s special recommendations', 7);

-- Insert menu items
-- Hot Beverages
INSERT INTO menu_items (category_id, name, description, price, display_order, is_featured) VALUES
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Hot Tea', 'Classic Indian tea brewed to perfection', 40.00, 1, false),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Masala Tea', 'Aromatic spiced tea with traditional Indian spices', 50.00, 2, true),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Black Tea', 'Pure black tea for the purists', 50.00, 3, false),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Lemon Tea', 'Refreshing tea with a zesty lemon twist', 60.00, 4, false),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'GLIH', 'Our signature special blend', 80.00, 5, true),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Hot Coffee', 'Rich and aromatic coffee to kickstart your day', 100.00, 6, false),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Filter Coffee', 'South Indian style filter coffee', 120.00, 7, true),
((SELECT id FROM categories WHERE name = 'Hot Beverages'), 'Black Coffee', 'Strong black coffee for coffee lovers', 80.00, 8, false);

-- Cold Beverages
INSERT INTO menu_items (category_id, name, description, price, display_order) VALUES
((SELECT id FROM categories WHERE name = 'Cold Beverages'), 'Cold Coffee', 'Chilled coffee with a perfect blend of flavors', 140.00, 1),
((SELECT id FROM categories WHERE name = 'Cold Beverages'), 'Iced Tea', 'Cool and refreshing iced tea', 120.00, 2),
((SELECT id FROM categories WHERE name = 'Cold Beverages'), 'Lemonade', 'Fresh lime water to quench your thirst', 100.00, 3);

-- Shakes & Smoothies
INSERT INTO menu_items (category_id, name, description, price, display_order, is_featured) VALUES
((SELECT id FROM categories WHERE name = 'Shakes & Smoothies'), 'Banana Shake', 'Creamy banana shake (Add Peanut Butter +₹20)', 130.00, 1, false),
((SELECT id FROM categories WHERE name = 'Shakes & Smoothies'), 'Oreo Shake', 'Indulgent Oreo cookie shake', 150.00, 2, true),
((SELECT id FROM categories WHERE name = 'Shakes & Smoothies'), 'Nutella Shake', 'Rich and creamy Nutella shake', 160.00, 3, true);

-- Quick Bites
INSERT INTO menu_items (category_id, name, description, price, display_order) VALUES
((SELECT id FROM categories WHERE name = 'Quick Bites'), 'Plain Maggi', 'Simple and classic Maggi noodles', 80.00, 1),
((SELECT id FROM categories WHERE name = 'Quick Bites'), 'Veggie Maggi', 'Maggi loaded with fresh vegetables', 120.00, 2),
((SELECT id FROM categories WHERE name = 'Quick Bites'), 'BGC Maggi', 'Special BGC style Maggi with extra flavors', 130.00, 3);

-- Sandwiches & Wraps
INSERT INTO menu_items (category_id, name, description, price, display_order, is_featured) VALUES
((SELECT id FROM categories WHERE name = 'Sandwiches & Wraps'), 'Veggie Sandwich', 'Fresh vegetable sandwich with herbs', 130.00, 1, false),
((SELECT id FROM categories WHERE name = 'Sandwiches & Wraps'), 'Garlic Bread', 'Crispy garlic bread with herbs and butter', 130.00, 2, false),
((SELECT id FROM categories WHERE name = 'Sandwiches & Wraps'), 'Mushroom Cheese Toast', 'Grilled toast with mushrooms and melted cheese', 130.00, 3, true),
((SELECT id FROM categories WHERE name = 'Sandwiches & Wraps'), 'Veggie Wrap', 'Fresh vegetables wrapped in soft tortilla', 130.00, 4, false),
((SELECT id FROM categories WHERE name = 'Sandwiches & Wraps'), 'Paneer Wrap', 'Grilled paneer wrap with spices and vegetables', 150.00, 5, true);

-- Mains & Snacks
INSERT INTO menu_items (category_id, name, description, price, display_order, is_featured) VALUES
((SELECT id FROM categories WHERE name = 'Mains & Snacks'), 'Tawa Burger', 'Grilled burger with fresh ingredients', 150.00, 1, true),
((SELECT id FROM categories WHERE name = 'Mains & Snacks'), 'Cheesy Nachos', 'Crispy nachos loaded with melted cheese', 150.00, 2, true),
((SELECT id FROM categories WHERE name = 'Mains & Snacks'), 'Veg Pakode', 'Crispy vegetable fritters with chutney', 150.00, 3, false);

-- Today's Special
INSERT INTO menu_items (category_id, name, description, price, display_order, is_featured) VALUES
((SELECT id FROM categories WHERE name = 'Today''s Special'), 'Sambhar Rice', 'Traditional South Indian sambhar with steamed rice', 180.00, 1, true);

-- Update timestamps
UPDATE categories SET updated_at = NOW();
UPDATE menu_items SET updated_at = NOW();