-- ClínicaCRM Database Schema
-- Run this in your Supabase SQL editor

-- Note: JWT secret is managed by Supabase internally
-- No need to set app.jwt_secret manually

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cases table
CREATE TABLE cases (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_to UUID REFERENCES profiles(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  home_phone TEXT,
  cell_phone TEXT,
  email TEXT,
  channel TEXT CHECK (channel IN ('WEB', 'FACEBOOK', 'INFLUENCER')) NOT NULL,
  origin TEXT NOT NULL,
  status TEXT CHECK (status IN ('IN_CORSO', 'CHIUSO', 'APPUNTAMENTO')) DEFAULT 'IN_CORSO',
  disposition TEXT,
  outcome TEXT,
  clinic TEXT NOT NULL,
  treatment TEXT,
  promotion TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  dialer_campaign_tag TEXT
);

-- Create notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  case_id BIGINT REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL
);

-- Create RPC function for dialer integration
CREATE OR REPLACE FUNCTION get_leads_for_dialer(campaign_tag_filter TEXT)
RETURNS TABLE(record_id BIGINT, phone_e164 TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.phone
  FROM cases c
  WHERE c.dialer_campaign_tag = campaign_tag_filter
    AND c.status != 'CHIUSO'
    AND c.follow_up_date IS NOT NULL
    AND c.follow_up_date <= NOW()
  ORDER BY c.follow_up_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for cases
CREATE POLICY "Users can view all cases" ON cases
  FOR SELECT USING (true);

CREATE POLICY "Users can insert cases" ON cases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update cases" ON cases
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete cases" ON cases
  FOR DELETE USING (true);

-- Create RLS policies for notes
CREATE POLICY "Users can view notes for cases they have access to" ON notes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_channel ON cases(channel);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_cases_dialer_campaign_tag ON cases(dialer_campaign_tag);
CREATE INDEX idx_cases_follow_up_date ON cases(follow_up_date);
CREATE INDEX idx_notes_case_id ON notes(case_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for testing using real user ID
INSERT INTO profiles (id, full_name) VALUES 
  ('80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Alejandro Hartoch');

INSERT INTO cases (assigned_to, first_name, last_name, phone, email, channel, origin, status, outcome, clinic, treatment, promotion, follow_up_date, dialer_campaign_tag) VALUES 
  ('80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Mario', 'Rossi', '+39 123 456 7890', 'mario.rossi@email.com', 'WEB', 'Website Contact Form', 'IN_CORSO', 'Interested in LASIK', 'Centro Oculistico Milano', 'LASIK Surgery', 'Spring Special', NOW() + INTERVAL '5 days', 'Q1-Follow-Up'),
  ('80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Anna', 'Bianchi', '+39 987 654 3210', 'anna.bianchi@email.com', 'FACEBOOK', 'Facebook Ad Campaign', 'APPUNTAMENTO', 'Appointment Scheduled', 'Centro Oculistico Roma', 'Cataract Surgery', 'Senior Discount', NOW() + INTERVAL '3 days', 'Q1-Follow-Up'),
  ('80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Luca', 'Verdi', '+39 555 123 4567', 'luca.verdi@email.com', 'INFLUENCER', 'Instagram Influencer', 'CHIUSO', 'Not Interested', 'Centro Oculistico Firenze', 'PRK Surgery', 'Summer Campaign', NULL, 'Q1-Follow-Up'),
  ('80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Sofia', 'Neri', '+39 333 444 5555', 'sofia.neri@email.com', 'WEB', 'Google Ads', 'IN_CORSO', 'Considering treatment options', 'Centro Oculistico Napoli', 'SMILE Surgery', 'New Patient Special', NOW() + INTERVAL '7 days', 'Q1-Follow-Up'),
  ('80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Marco', 'Gialli', '+39 666 777 8888', 'marco.gialli@email.com', 'FACEBOOK', 'Facebook Lead Form', 'APPUNTAMENTO', 'Consultation scheduled', 'Centro Oculistico Torino', 'ICL Surgery', 'Premium Package', NOW() + INTERVAL '2 days', 'Q1-Follow-Up');

INSERT INTO notes (case_id, user_id, content) VALUES 
  (1, '80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Initial contact made. Patient interested in LASIK surgery. Scheduled follow-up call.'),
  (1, '80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Follow-up call completed. Patient has questions about recovery time and costs.'),
  (2, '80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Appointment scheduled for next week. Patient confirmed availability.'),
  (3, '80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Patient decided against surgery after consultation. Case closed.'),
  (4, '80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'New lead from Google Ads. Patient researching different treatment options.'),
  (4, '80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Sent detailed information about SMILE surgery. Patient comparing with LASIK.'),
  (5, '80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Premium consultation scheduled. Patient interested in ICL for high myopia.'); 