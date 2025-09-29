-- Fix order number sequence synchronization
-- This fixes the issue where the sequence is out of sync with existing order numbers
-- causing "duplicate key value violates unique constraint" errors

DO $$ 
DECLARE
    max_order_num INTEGER;
    new_seq_value INTEGER;
BEGIN
    -- Check if the sequence exists
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'order_number_seq') THEN
        -- Get the maximum order number
        SELECT COALESCE(MAX(order_number), 0) INTO max_order_num FROM orders;
        new_seq_value := max_order_num + 1;
        
        -- Set the sequence to the next value after the maximum order number
        PERFORM setval('order_number_seq', new_seq_value, false);
        
        RAISE NOTICE 'Successfully synchronized order_number_seq with existing data';
        RAISE NOTICE 'Maximum order number in table: %', max_order_num;
        RAISE NOTICE 'Sequence next value set to: %', new_seq_value;
    ELSE
        RAISE NOTICE 'order_number_seq sequence does not exist';
    END IF;
    
EXCEPTION 
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;
