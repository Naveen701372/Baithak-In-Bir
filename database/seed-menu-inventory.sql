-- Seed data for menu management and inventory system
-- This script adds sample categories, inventory items, and menu items with inventory requirements

-- Insert sample categories
INSERT INTO categories (name, description, display_order, is_active) VALUES
('Appetizers', 'Start your meal with our delicious appetizers', 1, true),
('Main Course', 'Hearty and satisfying main dishes', 2, true),
('Beverages', 'Refreshing drinks and beverages', 3, true),
('Desserts', 'Sweet treats to end your meal', 4, true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory_items (name, unit, current_stock, minimum_stock, cost_per_unit, supplier) VALUES
('Chicken Breast', 'kg', 50.0, 10.0, 250.00, 'Local Poultry Farm'),
('Basmati Rice', 'kg', 100.0, 20.0, 80.00, 'Rice Supplier Co.'),
('Onions', 'kg', 30.0, 5.0, 25.00, 'Vegetable Market'),
('Tomatoes', 'kg', 25.0, 5.0, 30.00, 'Vegetable Market'),
('Ginger-Garlic Paste', 'kg', 5.0, 1.0, 120.00, 'Spice House'),
('Cooking Oil', 'L', 20.0, 5.0, 150.00, 'Oil Distributor'),
('Salt', 'kg', 10.0, 2.0, 20.00, 'Local Store'),
('Red Chili Powder', 'kg', 3.0, 0.5, 200.00, 'Spice House'),
('Turmeric Powder', 'kg', 2.0, 0.5, 180.00, 'Spice House'),
('Garam Masala', 'kg', 1.5, 0.3, 400.00, 'Spice House'),
('Yogurt', 'kg', 10.0, 2.0, 60.00, 'Dairy Farm'),
('Mint Leaves', 'kg', 2.0, 0.5, 100.00, 'Herb Garden'),
('Coriander Leaves', 'kg', 2.0, 0.5, 80.00, 'Herb Garden'),
('Lemon', 'pieces', 50, 10, 5.00, 'Fruit Vendor'),
('Coca Cola', 'bottles', 100, 20, 25.00, 'Beverage Distributor'),
('Sprite', 'bottles', 80, 15, 25.00, 'Beverage Distributor'),
('Water Bottles', 'bottles', 200, 50, 15.00, 'Water Supplier'),
('Ice Cream', 'L', 10.0, 2.0, 200.00, 'Ice Cream Supplier'),
('Chocolate Sauce', 'L', 3.0, 0.5, 300.00, 'Dessert Supplies'),
('Vanilla Essence', 'ml', 500, 100, 0.50, 'Baking Supplies')
ON CONFLICT (name) DO NOTHING;

-- Get category IDs for menu items
DO $$
DECLARE
    appetizer_id UUID;
    main_course_id UUID;
    beverage_id UUID;
    dessert_id UUID;
BEGIN
    SELECT id INTO appetizer_id FROM categories WHERE name = 'Appetizers';
    SELECT id INTO main_course_id FROM categories WHERE name = 'Main Course';
    SELECT id INTO beverage_id FROM categories WHERE name = 'Beverages';
    SELECT id INTO dessert_id FROM categories WHERE name = 'Desserts';

    -- Insert sample menu items
    INSERT INTO menu_items (category_id, name, description, price, is_available, is_featured, display_order) VALUES
    (appetizer_id, 'Chicken Tikka', 'Tender chicken pieces marinated in yogurt and spices, grilled to perfection', 180.00, true, true, 1),
    (appetizer_id, 'Vegetable Samosa', 'Crispy pastry filled with spiced vegetables', 60.00, true, false, 2),
    (main_course_id, 'Chicken Biryani', 'Aromatic basmati rice cooked with tender chicken and traditional spices', 320.00, true, true, 1),
    (main_course_id, 'Butter Chicken', 'Creamy tomato-based curry with tender chicken pieces', 280.00, true, true, 2),
    (main_course_id, 'Vegetable Fried Rice', 'Wok-tossed rice with fresh vegetables and soy sauce', 180.00, true, false, 3),
    (beverage_id, 'Coca Cola', 'Refreshing cola drink', 40.00, true, false, 1),
    (beverage_id, 'Fresh Lime Water', 'Refreshing lime water with mint', 50.00, true, false, 2),
    (beverage_id, 'Mineral Water', 'Pure drinking water', 20.00, true, false, 3),
    (dessert_id, 'Vanilla Ice Cream', 'Creamy vanilla ice cream with chocolate sauce', 80.00, true, false, 1),
    (dessert_id, 'Kulfi', 'Traditional Indian ice cream', 70.00, true, false, 2)
    ON CONFLICT (name) DO NOTHING;
END $$;

-- Add inventory requirements for menu items
DO $$
DECLARE
    chicken_tikka_id UUID;
    chicken_biryani_id UUID;
    butter_chicken_id UUID;
    veg_fried_rice_id UUID;
    lime_water_id UUID;
    vanilla_ice_cream_id UUID;
    
    chicken_breast_inv_id UUID;
    basmati_rice_inv_id UUID;
    onions_inv_id UUID;
    tomatoes_inv_id UUID;
    ginger_garlic_inv_id UUID;
    cooking_oil_inv_id UUID;
    yogurt_inv_id UUID;
    mint_leaves_inv_id UUID;
    lemon_inv_id UUID;
    ice_cream_inv_id UUID;
    chocolate_sauce_inv_id UUID;
    garam_masala_inv_id UUID;
    turmeric_inv_id UUID;
    chili_powder_inv_id UUID;
BEGIN
    -- Get menu item IDs
    SELECT id INTO chicken_tikka_id FROM menu_items WHERE name = 'Chicken Tikka';
    SELECT id INTO chicken_biryani_id FROM menu_items WHERE name = 'Chicken Biryani';
    SELECT id INTO butter_chicken_id FROM menu_items WHERE name = 'Butter Chicken';
    SELECT id INTO veg_fried_rice_id FROM menu_items WHERE name = 'Vegetable Fried Rice';
    SELECT id INTO lime_water_id FROM menu_items WHERE name = 'Fresh Lime Water';
    SELECT id INTO vanilla_ice_cream_id FROM menu_items WHERE name = 'Vanilla Ice Cream';
    
    -- Get inventory item IDs
    SELECT id INTO chicken_breast_inv_id FROM inventory_items WHERE name = 'Chicken Breast';
    SELECT id INTO basmati_rice_inv_id FROM inventory_items WHERE name = 'Basmati Rice';
    SELECT id INTO onions_inv_id FROM inventory_items WHERE name = 'Onions';
    SELECT id INTO tomatoes_inv_id FROM inventory_items WHERE name = 'Tomatoes';
    SELECT id INTO ginger_garlic_inv_id FROM inventory_items WHERE name = 'Ginger-Garlic Paste';
    SELECT id INTO cooking_oil_inv_id FROM inventory_items WHERE name = 'Cooking Oil';
    SELECT id INTO yogurt_inv_id FROM inventory_items WHERE name = 'Yogurt';
    SELECT id INTO mint_leaves_inv_id FROM inventory_items WHERE name = 'Mint Leaves';
    SELECT id INTO lemon_inv_id FROM inventory_items WHERE name = 'Lemon';
    SELECT id INTO ice_cream_inv_id FROM inventory_items WHERE name = 'Ice Cream';
    SELECT id INTO chocolate_sauce_inv_id FROM inventory_items WHERE name = 'Chocolate Sauce';
    SELECT id INTO garam_masala_inv_id FROM inventory_items WHERE name = 'Garam Masala';
    SELECT id INTO turmeric_inv_id FROM inventory_items WHERE name = 'Turmeric Powder';
    SELECT id INTO chili_powder_inv_id FROM inventory_items WHERE name = 'Red Chili Powder';

    -- Insert inventory requirements for Chicken Tikka
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    (chicken_tikka_id, chicken_breast_inv_id, 0.2),  -- 200g chicken per serving
    (chicken_tikka_id, yogurt_inv_id, 0.05),         -- 50g yogurt
    (chicken_tikka_id, ginger_garlic_inv_id, 0.01),  -- 10g ginger-garlic paste
    (chicken_tikka_id, garam_masala_inv_id, 0.005),  -- 5g garam masala
    (chicken_tikka_id, turmeric_inv_id, 0.002),      -- 2g turmeric
    (chicken_tikka_id, chili_powder_inv_id, 0.003)   -- 3g chili powder
    ON CONFLICT (menu_item_id, inventory_item_id) DO NOTHING;

    -- Insert inventory requirements for Chicken Biryani
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    (chicken_biryani_id, chicken_breast_inv_id, 0.25), -- 250g chicken per serving
    (chicken_biryani_id, basmati_rice_inv_id, 0.15),   -- 150g rice
    (chicken_biryani_id, onions_inv_id, 0.1),          -- 100g onions
    (chicken_biryani_id, ginger_garlic_inv_id, 0.015), -- 15g ginger-garlic paste
    (chicken_biryani_id, cooking_oil_inv_id, 0.03),    -- 30ml oil
    (chicken_biryani_id, garam_masala_inv_id, 0.008),  -- 8g garam masala
    (chicken_biryani_id, turmeric_inv_id, 0.003),      -- 3g turmeric
    (chicken_biryani_id, mint_leaves_inv_id, 0.01)     -- 10g mint leaves
    ON CONFLICT (menu_item_id, inventory_item_id) DO NOTHING;

    -- Insert inventory requirements for Butter Chicken
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    (butter_chicken_id, chicken_breast_inv_id, 0.2),   -- 200g chicken per serving
    (butter_chicken_id, tomatoes_inv_id, 0.15),        -- 150g tomatoes
    (butter_chicken_id, onions_inv_id, 0.08),          -- 80g onions
    (butter_chicken_id, ginger_garlic_inv_id, 0.012),  -- 12g ginger-garlic paste
    (butter_chicken_id, cooking_oil_inv_id, 0.025),    -- 25ml oil
    (butter_chicken_id, garam_masala_inv_id, 0.006),   -- 6g garam masala
    (butter_chicken_id, turmeric_inv_id, 0.002)        -- 2g turmeric
    ON CONFLICT (menu_item_id, inventory_item_id) DO NOTHING;

    -- Insert inventory requirements for Vegetable Fried Rice
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    (veg_fried_rice_id, basmati_rice_inv_id, 0.12),    -- 120g rice
    (veg_fried_rice_id, onions_inv_id, 0.06),          -- 60g onions
    (veg_fried_rice_id, cooking_oil_inv_id, 0.02),     -- 20ml oil
    (veg_fried_rice_id, ginger_garlic_inv_id, 0.008)   -- 8g ginger-garlic paste
    ON CONFLICT (menu_item_id, inventory_item_id) DO NOTHING;

    -- Insert inventory requirements for Fresh Lime Water
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    (lime_water_id, lemon_inv_id, 1),                  -- 1 lemon per serving
    (lime_water_id, mint_leaves_inv_id, 0.005)         -- 5g mint leaves
    ON CONFLICT (menu_item_id, inventory_item_id) DO NOTHING;

    -- Insert inventory requirements for Vanilla Ice Cream
    INSERT INTO menu_item_inventory (menu_item_id, inventory_item_id, quantity_required) VALUES
    (vanilla_ice_cream_id, ice_cream_inv_id, 0.1),     -- 100ml ice cream
    (vanilla_ice_cream_id, chocolate_sauce_inv_id, 0.02) -- 20ml chocolate sauce
    ON CONFLICT (menu_item_id, inventory_item_id) DO NOTHING;

END $$;