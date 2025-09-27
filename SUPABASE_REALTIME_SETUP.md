# Supabase Real-time Setup Guide

## Problem
Real-time updates are not working because Supabase real-time needs to be explicitly enabled for your tables.

## Quick Test
1. Go to `/admin/debug-realtime` in your admin dashboard
2. Check if both "Supabase Real-time" and "Server-Sent Events" show as "Connected"
3. If either shows "Disconnected", follow the setup steps below

## Method 1: Supabase Dashboard (Recommended)

### Step 1: Enable Real-time in Database Settings
1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. You should see a section called "Publications"
4. Look for the `supabase_realtime` publication
5. Click on it to edit

### Step 2: Add Tables to Real-time Publication
1. In the publication settings, you should see a list of tables
2. Make sure these tables are **enabled**:
   - ✅ `orders`
   - ✅ `order_items`
3. If they're not listed, click "Add table" and select them
4. Save the changes

### Step 3: Alternative UI Method
If the above doesn't work, try this:
1. Go to **Settings** → **API**
2. Scroll down to find "Realtime" section
3. Enable real-time for:
   - `orders` table
   - `order_items` table

## Method 2: SQL Command (If UI doesn't work)

### Step 1: Run SQL Commands
1. Go to **SQL Editor** in your Supabase dashboard
2. Run this SQL script:

```sql
-- Check current realtime tables
SELECT schemaname, tablename, rowfilter 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Add orders table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Add order_items table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- Verify tables were added
SELECT schemaname, tablename, rowfilter 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### Step 2: Check Row Level Security (if needed)
If you get permission errors, run:

```sql
-- Enable RLS (should already be enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Check RLS policies exist
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items');
```

## Method 3: Check Supabase Project Settings

### Step 1: Verify Real-time is Enabled
1. Go to **Settings** → **General**
2. Look for "Realtime" in the project features
3. Make sure it's enabled (should be by default)

### Step 2: Check API Keys
1. Go to **Settings** → **API**
2. Make sure you're using the correct `anon` key in your `.env.local`
3. The key should have real-time permissions

## Verification Steps

### Step 1: Test the Debug Page
1. Go to `/admin/debug-realtime`
2. Both connections should show "Connected"
3. Click "Create Test Order"
4. You should see events appear in both sections

### Step 2: Test Real Application Flow
1. Open `/admin/orders` in one browser tab
2. Open `/menu` in another tab (or different device)
3. Place an order from the menu
4. The order should appear instantly in the admin dashboard
5. You should hear a notification sound

### Step 3: Test Kitchen Updates
1. In the admin dashboard, go to "Kitchen View" tab
2. Change an item status (e.g., mark as "preparing")
3. Switch back to "Order Management" tab
4. The change should be reflected immediately

## Common Issues & Solutions

### Issue 1: "Disconnected" Status
**Solution:** Follow Method 1 or 2 above to enable real-time for the tables.

### Issue 2: Events Not Appearing
**Possible causes:**
- Real-time not enabled for tables
- RLS policies blocking access
- Network/firewall issues
- Browser blocking EventSource connections

**Solutions:**
1. Check browser console for errors
2. Verify RLS policies allow access
3. Test on different network/browser
4. Check Supabase logs in dashboard

### Issue 3: SSE Connection Fails
**Possible causes:**
- CORS issues in development
- Server-side errors in API route
- Network connectivity problems

**Solutions:**
1. Check browser network tab for failed requests
2. Look at server logs for API route errors
3. Test the `/api/orders/realtime` endpoint directly

### Issue 4: Supabase Connection Fails
**Possible causes:**
- Wrong API keys
- Real-time not enabled in project
- Tables not added to publication

**Solutions:**
1. Verify API keys in `.env.local`
2. Check Supabase project settings
3. Run the SQL commands from Method 2

## Testing Checklist

After setup, verify these work:

- [ ] Debug page shows both connections as "Connected"
- [ ] Test order creation shows events in debug page
- [ ] New orders appear instantly in admin dashboard
- [ ] Order status changes sync between tabs
- [ ] Kitchen item updates reflect in order management
- [ ] Notification sound plays for new orders
- [ ] Connection status indicator works correctly

## Support

If you're still having issues:

1. Check the browser console for JavaScript errors
2. Look at the Network tab for failed requests
3. Check Supabase project logs
4. Verify your database schema matches the expected structure
5. Test with a fresh browser session (clear cache)

The real-time system should work seamlessly once Supabase real-time is properly configured!