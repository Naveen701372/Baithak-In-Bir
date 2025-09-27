# Real-Time Order Management System

## Overview
This document describes the real-time order management system implemented for the restaurant platform. The system ensures that orders placed by customers automatically appear in the admin dashboard and kitchen view without requiring page refreshes.

## Architecture

### 1. Server-Sent Events (SSE) API Route
**File:** `src/app/api/orders/realtime/route.ts`

- Establishes persistent connection with clients
- Listens to Supabase real-time changes on `orders` and `order_items` tables
- Sends formatted events to connected clients
- Includes heartbeat mechanism for connection health
- Handles automatic reconnection

### 2. Real-Time Hook
**File:** `src/hooks/useRealTimeOrders.ts`

- Manages EventSource connection to SSE endpoint
- Handles connection states (connected, error, reconnecting)
- Implements exponential backoff for reconnection attempts
- Provides clean connection lifecycle management

### 3. Enhanced Orders Hook
**File:** `src/hooks/useOrders.ts` (Enhanced)

- Integrates real-time updates with existing order management
- Handles different event types (INSERT, UPDATE, DELETE)
- Provides audio notifications for new orders
- Manages optimistic UI updates
- Maintains connection status

### 4. UI Components

#### New Order Notification
**File:** `src/components/admin/NewOrderNotification.tsx`
- Animated popup for new orders
- Shows order details and customer info
- Auto-dismisses after 5 seconds
- Includes pulsing animation for attention

#### Connection Status Indicator
**File:** `src/components/admin/ConnectionStatus.tsx`
- Shows real-time connection status
- Visual indicators for connected/disconnected/error states
- Fixed position for constant visibility

#### Test Order Button
**File:** `src/components/admin/TestOrderButton.tsx`
- Creates test orders for system verification
- Useful for testing real-time functionality

## How It Works

### Order Placement Flow
1. Customer places order via cart page
2. `orderAPI.createOrder()` inserts order into Supabase
3. Supabase triggers real-time event
4. SSE route receives event and fetches complete order data
5. Event is broadcast to all connected admin clients
6. Admin UI receives event and updates order list
7. New order notification appears with sound alert

### Real-Time Event Types

#### `order_update`
- Triggered on INSERT/UPDATE of orders table
- Contains complete order data with items
- Used for new orders and status changes

#### `order_item_update`
- Triggered on INSERT/UPDATE/DELETE of order_items table
- Contains complete order data with updated items
- Used for kitchen item status changes

#### `order_delete`
- Triggered on DELETE of orders table
- Contains only the deleted order ID
- Removes order from UI

#### `connected`
- Initial connection confirmation
- Sent when SSE connection is established

#### `heartbeat`
- Keep-alive signal every 30 seconds
- Maintains connection health

## Features

### 🔄 Real-Time Updates
- Orders appear instantly when placed
- Status changes reflect immediately
- Kitchen item updates sync across views

### 🔊 Audio Notifications
- Sound alert for new orders
- Web Audio API implementation
- Graceful fallback if audio fails

### 🔌 Connection Management
- Automatic reconnection with exponential backoff
- Visual connection status indicator
- Error handling and recovery

### 📱 Responsive Design
- Works on desktop and mobile
- Optimized for restaurant workflows
- Touch-friendly interfaces

### 🎯 Optimistic Updates
- Local state updates for immediate feedback
- Server reconciliation for consistency
- Smooth user experience

## Testing

### Manual Testing
1. Open admin dashboard in one browser tab
2. Open customer menu in another tab/device
3. Place an order from customer view
4. Verify order appears instantly in admin dashboard
5. Test status updates in kitchen view
6. Verify notifications and sounds work

### Test Order Button
- Use the "Create Test Order" button in admin dashboard
- Generates random test orders for system verification
- Useful for load testing and UI validation

## Configuration

### Environment Variables
No additional environment variables required. Uses existing Supabase configuration.

### Database Requirements
- Supabase real-time enabled on `orders` and `order_items` tables
- Proper RLS policies for data access
- Indexes for performance optimization

## Performance Considerations

### Connection Limits
- Each admin user maintains one SSE connection
- Supabase handles multiple concurrent connections
- Consider connection pooling for high-traffic scenarios

### Data Transfer
- Only changed orders are transmitted
- Complete order data sent to avoid additional queries
- Heartbeat messages are minimal JSON

### Browser Compatibility
- EventSource supported in all modern browsers
- Graceful degradation to polling if needed
- Mobile browser compatibility verified

## Troubleshooting

### Connection Issues
1. Check browser console for EventSource errors
2. Verify Supabase real-time is enabled
3. Check network connectivity
4. Look for CORS issues in development

### Missing Updates
1. Verify database triggers are working
2. Check Supabase real-time logs
3. Ensure proper table permissions
4. Test with manual database inserts

### Performance Issues
1. Monitor connection count
2. Check for memory leaks in long-running sessions
3. Verify proper cleanup on page unload
4. Consider implementing connection throttling

## Future Enhancements

### Planned Features
- Push notifications for mobile devices
- Order priority system with visual indicators
- Kitchen display optimization
- Analytics dashboard integration
- Multi-location support

### Scalability Improvements
- Connection pooling and load balancing
- Redis for session management
- WebSocket upgrade option
- Horizontal scaling support

## Security Considerations

### Data Protection
- No sensitive customer data in real-time events
- Proper authentication for admin access
- Rate limiting on SSE connections
- Input validation on all endpoints

### Access Control
- Role-based real-time subscriptions
- Secure WebSocket upgrade paths
- Audit logging for real-time events
- CSRF protection on API routes