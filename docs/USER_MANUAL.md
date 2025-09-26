# Restaurant Management Platform - User Manual

## 📖 Complete User Guide

This manual provides step-by-step instructions for using the restaurant management platform effectively.

## 👥 User Roles

### 🍽️ **Customers**
- Browse menu and place orders
- Track order status in real-time
- Receive order confirmations

### 👨‍💼 **Restaurant Staff (Admin)**
- Manage all orders and kitchen operations
- Track payments and order fulfillment
- Access comprehensive dashboard

---

## 🛍️ Customer Guide

### 1. **Browsing the Menu**

#### Accessing the Menu
1. Visit the restaurant website
2. Click "View Menu" or navigate to `/menu`
3. Browse available food categories

#### Menu Features
- **Visual Icons**: Each item has a food icon for easy identification
- **Categories**: Items organized by food type (appetizers, mains, desserts, etc.)
- **Pricing**: Clear price display for each item
- **Descriptions**: Detailed item descriptions
- **Availability**: Only available items are shown

### 2. **Adding Items to Cart**

#### How to Add Items
1. Click on any menu item
2. Select desired quantity using + and - buttons
3. Click "Add to Cart"
4. Cart icon shows item count and total

#### Cart Management
- **View Cart**: Click cart icon to see all items
- **Update Quantities**: Change quantities in cart
- **Remove Items**: Click remove button to delete items
- **Price Updates**: Total updates automatically

### 3. **Placing an Order**

#### Checkout Process
1. Click "Checkout" from cart
2. Fill in customer information:
   - **Name**: Your full name
   - **Phone**: Contact number (required)
   - **Email**: Email address (optional)
3. Add special instructions in notes (optional)
4. Review order summary
5. Click "Place Order"

#### Order Confirmation
- Receive immediate order confirmation
- Get unique order ID for tracking
- Order status shows as "Pending"

### 4. **Order Tracking**

#### Real-time Status Updates
Your order progresses through these stages:
1. **Pending**: Order received, awaiting restaurant confirmation
2. **Confirmed**: Restaurant accepted your order
3. **Preparing**: Kitchen is cooking your food
4. **Ready**: Food is ready for pickup/delivery
5. **Completed**: Order fulfilled

#### Tracking Your Order
- Use the order confirmation link
- Check status updates in real-time
- Estimated completion times provided

---

## 👨‍💼 Restaurant Staff Guide

### 1. **Admin Login**

#### Accessing Admin Dashboard
1. Navigate to `/admin/login`
2. Enter admin credentials:
   - Email address
   - Password
3. Click "Sign In"
4. Redirected to admin dashboard

#### Dashboard Overview
- **Daily Statistics**: Order counts and revenue
- **Quick Actions**: Access to key functions
- **Recent Activity**: Latest orders and updates
- **System Status**: Real-time system health

### 2. **Order Management**

#### Order Management Interface
The order management system has two main tabs:
- **Order Management**: Complete order lifecycle
- **Kitchen View**: Kitchen-focused operations

#### Order Management Tab

**Order Display:**
- Orders shown as individual cards
- Real-time status updates
- Customer information clearly displayed
- Order items with quantities and prices

**Order Actions:**
1. **Confirm Orders**: Accept new pending orders
2. **Update Status**: Progress orders through workflow
3. **Cancel Orders**: Cancel with reason tracking
4. **Payment Management**: Handle payment status

**Filtering and Search:**
- **Status Filters**: Filter by order status
  - All Orders
  - Pending (awaiting confirmation)
  - Confirmed (accepted orders)
  - Preparing (in kitchen)
  - Ready (ready for pickup)
  - Completed (fulfilled)
  - Cancelled (cancelled orders)
- **Search Function**: Search by customer name or phone
- **Date Filters**: Today, This Week, All Time
- **Real-time Counts**: Filter counts update automatically

#### Order Status Workflow

**Step 1: Pending → Confirmed**
1. New orders appear with "Pending" status
2. Review order details and customer information
3. Click "Confirm Order" to accept
4. Order status changes to "Confirmed"

**Step 2: Confirmed → Preparing**
1. When kitchen starts cooking, click "Start Preparing"
2. Order status changes to "Preparing"
3. Kitchen view shows active cooking items

**Step 3: Preparing → Ready**
1. When food is ready, click "Mark as Ready"
2. Order status changes to "Ready"
3. Customer can be notified for pickup

**Step 4: Ready → Completed**
1. When customer picks up order, click "Complete Order"
2. Order status changes to "Completed"
3. Payment options become available

#### Order Cancellation
1. Click "Cancel Order" button
2. Select cancellation reason:
   - Customer Request
   - Kitchen Issue
   - Payment Problem
   - Other (specify reason)
3. Confirm cancellation
4. Order marked as cancelled with timestamp

### 3. **Kitchen Operations**

#### Kitchen View Tab

**Purpose:**
- Aggregated view of all items across orders
- Focus on cooking tasks, not individual orders
- Priority-based task management

**Kitchen Display Features:**
- **Item Aggregation**: Same menu items combined across orders
- **Priority Sorting**: Oldest orders first, urgent items prioritized
- **Active Items Only**: Completed items automatically hidden
- **Real-time Updates**: Live synchronization across devices

#### Kitchen Workflow

**Starting Items:**
1. Items appear when orders are confirmed
2. Click "Start" to begin cooking
3. Status changes to "Cooking" with flame animation

**Cooking Process:**
1. **Individual Unit Tracking**: Complete items one by one
   - Example: 3 teas can be completed as 1/3, 2/3, 3/3
2. **Progress Tracking**: Real-time completion updates
3. **Visual Indicators**: Animated flame shows active cooking

**Completing Items:**
1. **Individual Completion**: Click green checkmark to complete one unit
2. **Mark Ready**: When all units done, click "Cooking" to mark ready
3. **Pickup**: Click "Pick Up" when customer collects item
4. **Auto-Hide**: Completed items disappear from kitchen view

#### Kitchen Item Status Flow
1. **Start**: Begin cooking (Status: Cooking)
2. **Cooking**: Active preparation with flame animation
3. **Ready**: Food ready for pickup
4. **Picked Up**: Item collected (removed from view)

#### Individual Item Management
- **Unit Completion**: Track individual quantities (1/3, 2/3, 3/3)
- **Partial Completion**: Complete items as they're ready
- **Real-time Updates**: Progress shown on order cards
- **Cross-device Sync**: Updates visible on all devices

### 4. **Payment Management**

#### Payment Status Types
- **Pending**: Payment not received
- **Paid**: Payment completed
- **Refunded**: Payment refunded

#### Payment Workflow
1. **Availability**: Payment options only available after order completion
2. **Update Status**: Click payment status to change
3. **Payment Dialog**: Select new payment status
4. **Confirmation**: Status updates immediately
5. **History**: Track payment changes over time

#### Payment Process
1. Complete the order first
2. Click on payment status (shows "Pending")
3. Select appropriate status:
   - **Paid**: Customer has paid
   - **Refunded**: Payment refunded to customer
4. Confirm the change
5. Status updates across all views

### 5. **Advanced Features**

#### Real-time Synchronization
- **Multi-device Support**: Updates sync across all devices
- **Instant Updates**: Changes appear immediately
- **No Refresh Needed**: Automatic real-time updates
- **Connection Status**: Visual indicators for connection health

#### Search and Filtering
- **Expandable Search**: Click to expand search functionality
- **Multiple Filters**: Combine status and date filters
- **Real-time Results**: Filters update immediately
- **Clear Filters**: Easy filter reset options

#### Order Details
- **Customer Information**: Name, phone, email
- **Order Items**: Detailed item breakdown
- **Timestamps**: Order creation and update times
- **Notes**: Special instructions and order notes
- **Total Amount**: Order value calculation

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **Orders Not Updating**
**Problem**: Order status not changing in real-time

**Solutions:**
- Check internet connection
- Refresh the page
- Verify you're logged in as admin
- Check if multiple tabs are open

#### 2. **Kitchen Items Not Appearing**
**Problem**: Items not showing in kitchen view

**Solutions:**
- Ensure orders are confirmed (not pending)
- Check if items are already completed
- Verify order status is not cancelled
- Refresh kitchen view tab

#### 3. **Payment Options Not Available**
**Problem**: Cannot update payment status

**Solutions:**
- Ensure order is completed first
- Check admin permissions
- Verify order is not cancelled
- Try refreshing the page

#### 4. **Login Issues**
**Problem**: Cannot access admin dashboard

**Solutions:**
- Verify admin credentials
- Check email and password
- Ensure admin account is active
- Contact system administrator

### Best Practices

#### For Efficient Order Management
1. **Confirm Orders Quickly**: Accept orders promptly to start kitchen workflow
2. **Use Kitchen View**: Focus on kitchen tab for cooking operations
3. **Update Status Regularly**: Keep order status current for customer tracking
4. **Complete Items Individually**: Use unit completion for better tracking

#### For Kitchen Operations
1. **Prioritize by Age**: Handle oldest orders first
2. **Use Visual Cues**: Watch for flame animations and status colors
3. **Complete Units Progressively**: Mark individual items as done
4. **Keep Kitchen View Clean**: Completed items auto-hide for focus

#### For Customer Service
1. **Respond to Cancellations**: Handle cancellation requests promptly
2. **Update Payment Status**: Keep payment information current
3. **Use Order Notes**: Check special instructions
4. **Communicate Status**: Inform customers of delays if needed

---

## 📱 Mobile Usage

### Mobile Optimization
- **Responsive Design**: Works on all screen sizes
- **Touch-friendly**: Large buttons for easy tapping
- **Mobile Navigation**: Optimized menu and navigation
- **Fast Loading**: Optimized for mobile networks

### Mobile Best Practices
- **Portrait Mode**: Best experience in portrait orientation
- **Stable Connection**: Ensure good internet connectivity
- **Browser Compatibility**: Use modern mobile browsers
- **Regular Updates**: Keep browser updated for best performance

---

## 🆘 Support

### Getting Help
1. **Check This Manual**: Review relevant sections first
2. **Try Troubleshooting**: Follow troubleshooting steps
3. **Contact Support**: Reach out for technical assistance
4. **Report Issues**: Document any bugs or problems

### Contact Information
- **Technical Support**: [Contact details]
- **Training**: [Training resources]
- **Updates**: [Update notifications]

---

**This user manual covers all aspects of the restaurant management platform. Keep this guide handy for reference during daily operations.**