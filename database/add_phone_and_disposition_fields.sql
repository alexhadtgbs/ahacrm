-- Migration: Add home_phone, cell_phone, and disposition fields to cases table
-- Run this in your Supabase SQL editor

-- Add new columns to cases table
ALTER TABLE cases 
ADD COLUMN home_phone TEXT,
ADD COLUMN cell_phone TEXT,
ADD COLUMN disposition TEXT;

-- Update existing records to move phone data to appropriate fields
-- This assumes existing phone data should go to cell_phone (most common case)
UPDATE cases 
SET cell_phone = phone 
WHERE phone IS NOT NULL AND cell_phone IS NULL;

-- Add comment to explain the phone field structure
COMMENT ON COLUMN cases.phone IS 'Legacy phone field - use home_phone or cell_phone instead';
COMMENT ON COLUMN cases.home_phone IS 'Home phone number';
COMMENT ON COLUMN cases.cell_phone IS 'Mobile/cell phone number';
COMMENT ON COLUMN cases.disposition IS 'Case disposition - can be updated by user or CCaaS application';

-- Create index for disposition field for better query performance
CREATE INDEX idx_cases_disposition ON cases(disposition); 