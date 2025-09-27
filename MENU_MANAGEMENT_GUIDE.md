# Menu Management & Inventory System Guide

This guide covers the comprehensive menu management and inventory tracking system implemented for Baithak In Bir restaurant.

## Features Overview

### 🍽️ Menu Management
- **Complete CRUD Operations**: Add, edit, delete, and manage menu items
- **Category Organization**: Organize menu items into categories (Appetizers, Main Course, etc.)
- **Image Upload**: Upload and manage menu item images via Supabase Storage
- **Availability Control**: Toggle item availability and featured status
- **Pricing Management**: Set and update item prices
- **Display Order**: Control the order items appear in the menu

### 📦 Inventory Management
- **Inventory Items**: Manage raw materials and ingredients
- **Stock Tracking**: Track current stock levels and minimum thresholds
- **Low Stock Alerts**: Automatic alerts when items fall below minimum levels
- **Supplier Management**: Track supplier information for each inventory item
- **Cost Tracking**: Monitor cost per unit for inventory items
- **Restock Functionality**: Easy restocking with automatic timestamp updates

### 🔗 Menu-Inventory Integration
- **Recipe Management**: Link menu items to required inventory ingredients
- **Quantity Requirements**: Specify exact quantities needed for each menu item
- **Automatic Deduction**: Inventory automatically reduces when orders are placed
- **Stock Validation**: Prevent orders when insufficient inventory is available

### 📊 Real-time Features
- **Live Updates**: Real-time inventory updates across all admin interfaces
- **Instant Alerts**: Immediate notifications for low stock situations
- **Dashboard Integration**: Inventory alerts displayed on admin dashboard

## System Architecture

### Database Schema

#### Categories Table
```sql
categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Menu Items Table
```sql
menu_items (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Inventory Items Table
```sql
inventory_items (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  current_stock DECIMAL(10,2) DEFAULT 0,
  minimum_stock DECIMAL(10,2) DEFAULT 0,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  supplier VARCHAR(200),
  last_restocked TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Menu Item Inventory (Junction Table)
```sql
menu_item_inventory (
  id UUID PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id),
  inventory_item_id UUID REFERENCES inventory_items(id),
  quantity_required DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP
)
```

### File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── menu/
│   │       └── page.tsx                 # Main menu management page
│   └── api/
│       └── inventory/
│           └── deduct/
│               └── route.ts             # Inventory deduction API
├── components/
│   ├── admin/
│   │   ├── MenuManagement.tsx           # Main menu management component
│   │   ├── MenuItemForm.tsx             # Menu item creation/editing form
│   │   ├── CategoryManagement.tsx       # Category management modal
│   │   ├── InventoryManagement.tsx      # Inventory management component
│   │   ├── InventoryItemForm.tsx        # Inventory item form
│   │   └── InventoryAlerts.tsx          # Real-time inventory alerts
│   └── ui/
│       └── tabs.tsx                     # Reusable tabs component
├── hooks/
│   └── useInventory.ts                  # Inventory management hook
└── lib/
    ├── supabase.ts                      # Updated with inventory deduction
    └── utils.ts                         # Utility functions
```

## Usage Guide

### Accessing Menu Management

1. **Login to Admin Panel**: Navigate to `/admin/login` and authenticate
2. **Access Menu Management**: Click "Menu" in the admin sidebar or go to `/admin/menu`
3. **Switch Between Tabs**: Use the tabs to switch between "Menu Items" and "Inventory"

### Managing Categories

1. **Open Category Management**: Click "Manage Categories" button
2. **Add New Category**: Click "Add Category" and fill in the form
3. **Edit Category**: Click the edit icon next to any category
4. **Toggle Status**: Activate/deactivate categories as needed
5. **Delete Category**: Click delete icon (will affect associated menu items)

### Managing Menu Items

#### Adding a New Menu Item

1. **Click "Add Menu Item"** button
2. **Fill Basic Information**:
   - Item Name (required)
   - Description
   - Price (required)
   - Category selection
   - Display order
3. **Upload Image**: Click "Choose Image" to upload item photo
4. **Set Availability**: Toggle available/featured status
5. **Add Inventory Requirements**:
   - Click "Add Requirement"
   - Select inventory item from dropdown
   - Enter quantity required per serving
   - Add multiple requirements as needed
6. **Save**: Click "Create Item"

#### Editing Menu Items

1. **Click Edit Icon** on any menu item card
2. **Modify Information**: Update any fields as needed
3. **Update Inventory Requirements**: Add, remove, or modify ingredient requirements
4. **Save Changes**: Click "Update Item"

#### Managing Availability

- **Toggle Availability**: Click the eye icon to make items available/unavailable
- **Toggle Featured**: Click the star icon to feature/unfeature items
- **Bulk Actions**: Use filters to manage multiple items

### Managing Inventory

#### Adding Inventory Items

1. **Switch to Inventory Tab**
2. **Click "Add Inventory Item"**
3. **Fill Required Information**:
   - Item Name (required)
   - Unit of measurement (kg, L, pieces, etc.)
   - Current Stock (required)
   - Minimum Stock threshold (required)
   - Cost per Unit (required)
   - Supplier (optional)
4. **Save**: Click "Create Item"

#### Restocking Items

**Method 1: Quick Restock**
1. Click the green arrow icon in the inventory table
2. Enter quantity to add
3. Confirm to update stock

**Method 2: From Alerts**
1. Click "Quick Restock" on any alert
2. Enter quantity to add
3. Stock updates automatically

#### Monitoring Stock Levels

- **Dashboard Alerts**: View critical alerts on the main dashboard
- **Inventory Table**: See all items with color-coded status indicators
- **Filter Options**: Filter by "Low Stock" or "Out of Stock"
- **Real-time Updates**: Stock levels update automatically across all interfaces

### Understanding Inventory Deduction

#### Automatic Process

When a customer places an order:

1. **Order Creation**: Order and order items are saved to database
2. **Inventory Calculation**: System calculates total ingredient requirements
3. **Stock Validation**: Checks if sufficient inventory is available
4. **Automatic Deduction**: Reduces inventory quantities automatically
5. **Alert Generation**: Creates alerts if items fall below minimum levels

#### Manual Override

If automatic deduction fails:
- Order is still created (customer experience preserved)
- Warning is logged for admin review
- Manual inventory adjustment may be needed

## API Endpoints

### Inventory Deduction API

**Endpoint**: `POST /api/inventory/deduct`

**Request Body**:
```json
{
  "orderId": "uuid-string"
}
```

**Response Success**:
```json
{
  "success": true,
  "message": "Inventory deducted successfully",
  "deductions": {
    "inventory-item-id": 2.5,
    "another-item-id": 1.0
  }
}
```

**Response Error**:
```json
{
  "error": "Insufficient stock",
  "details": [
    "Chicken Breast (need 5, have 2)",
    "Basmati Rice (need 3, have 1)"
  ]
}
```

## Best Practices

### Menu Management

1. **Consistent Naming**: Use clear, consistent naming for menu items
2. **Quality Images**: Upload high-quality images (recommended: 400x300px)
3. **Accurate Descriptions**: Write clear, appetizing descriptions
4. **Regular Updates**: Keep prices and availability current
5. **Category Organization**: Group similar items logically

### Inventory Management

1. **Accurate Units**: Use consistent units of measurement
2. **Realistic Minimums**: Set minimum stock levels based on usage patterns
3. **Regular Audits**: Periodically verify physical stock matches system
4. **Supplier Information**: Maintain accurate supplier details
5. **Cost Tracking**: Update costs regularly for accurate reporting

### Recipe Management

1. **Precise Quantities**: Specify exact ingredient quantities needed
2. **Complete Recipes**: Include all ingredients, even small amounts
3. **Regular Review**: Update recipes when preparation methods change
4. **Portion Control**: Ensure quantities match actual serving sizes

## Troubleshooting

### Common Issues

**Menu Item Not Saving**
- Check all required fields are filled
- Verify image file size is under 2MB
- Ensure category is selected

**Inventory Not Deducting**
- Check if menu item has inventory requirements defined
- Verify inventory items exist and have sufficient stock
- Review browser console for API errors

**Images Not Uploading**
- Ensure Supabase storage bucket is configured
- Check file format (JPG, PNG, WebP supported)
- Verify file size is reasonable (< 2MB recommended)

**Stock Alerts Not Showing**
- Check minimum stock levels are set correctly
- Verify current stock is below minimum threshold
- Ensure real-time subscriptions are working

### Database Maintenance

**Reset Inventory**:
```sql
UPDATE inventory_items SET current_stock = 100 WHERE current_stock < minimum_stock;
```

**Clear Old Orders** (if needed):
```sql
DELETE FROM orders WHERE created_at < NOW() - INTERVAL '30 days';
```

## Security Considerations

1. **Authentication Required**: All admin functions require authentication
2. **Role-Based Access**: Different permission levels for different roles
3. **Input Validation**: All forms validate input on client and server
4. **File Upload Security**: Images are validated and stored securely
5. **SQL Injection Prevention**: All queries use parameterized statements

## Performance Optimization

1. **Image Optimization**: Images are served via CDN
2. **Database Indexing**: Key fields are indexed for fast queries
3. **Real-time Efficiency**: Subscriptions are scoped to relevant data only
4. **Caching**: Frequently accessed data is cached appropriately
5. **Lazy Loading**: Components load data as needed

## Future Enhancements

### Planned Features

1. **Batch Operations**: Bulk edit multiple menu items
2. **Recipe Costing**: Automatic cost calculation based on ingredients
3. **Waste Tracking**: Track and report food waste
4. **Supplier Integration**: Direct ordering from suppliers
5. **Nutritional Information**: Add nutritional data to menu items
6. **Seasonal Menus**: Time-based menu availability
7. **Multi-location Support**: Support for multiple restaurant locations

### Integration Possibilities

1. **POS Systems**: Integration with point-of-sale systems
2. **Accounting Software**: Export data to accounting platforms
3. **Delivery Platforms**: Sync with food delivery services
4. **Analytics Tools**: Advanced reporting and analytics
5. **Mobile Apps**: Dedicated mobile apps for staff

## Support

For technical support or questions about the menu management system:

1. **Check Documentation**: Review this guide and code comments
2. **Console Logs**: Check browser console for error messages
3. **Database Logs**: Review Supabase logs for backend issues
4. **Test Environment**: Use development environment for testing changes

## Conclusion

The menu management and inventory system provides a comprehensive solution for restaurant operations. It combines ease of use with powerful features, ensuring efficient management of both menu items and inventory while maintaining data integrity and providing real-time insights.

The system is designed to scale with the business and can be extended with additional features as needed. Regular maintenance and following best practices will ensure optimal performance and reliability.