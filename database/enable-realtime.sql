-- Enable real-time for orders and order_items tables
-- Run this in your Supabase SQL editor if the UI method doesn't work

-- First, check if realtime is enabled
SELECT schemaname, tablename, rowfilter 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Enable realtime for order_items table  
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- Verify the tables are added
SELECT schemaname, tablename, rowfilter 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- If you get permission errors, you might need to enable RLS first
-- (though this should already be done from our schema)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;