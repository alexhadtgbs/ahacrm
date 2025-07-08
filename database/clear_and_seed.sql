-- Clear and Seed Database
-- Run this in your Supabase SQL editor to reset and populate with fresh test data

-- Clear existing data (in reverse order of dependencies)
DELETE FROM notes;
DELETE FROM cases;
DELETE FROM profiles WHERE id != '80bfa7fb-46fb-43b8-8434-0d087ef0098e';

-- Reset sequences
ALTER SEQUENCE cases_id_seq RESTART WITH 1;
ALTER SEQUENCE notes_id_seq RESTART WITH 1;

-- Now run the seed data
\i database/seed_data.sql 