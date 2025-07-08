-- Seed Data for ClínicaCRM
-- Run this in your Supabase SQL editor to populate with test data

-- First, let's get the user ID for assignments
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Get the first user from profiles (or create one if needed)
    SELECT id INTO user_id FROM profiles LIMIT 1;
    
    -- If no user exists, create one
    IF user_id IS NULL THEN
        INSERT INTO profiles (id, full_name) VALUES 
        ('80bfa7fb-46fb-43b8-8434-0d087ef0098e', 'Alejandro Hartoch')
        ON CONFLICT (id) DO NOTHING;
        user_id := '80bfa7fb-46fb-43b8-8434-0d087ef0098e';
    END IF;

    -- Insert random cases with realistic Italian data
    INSERT INTO cases (
        assigned_to, first_name, last_name, phone, home_phone, cell_phone, email, 
        channel, origin, status, disposition, outcome, clinic, treatment, 
        promotion, follow_up_date, dialer_campaign_tag
    ) VALUES 
    -- Appointments (APPUNTAMENTO)
    (user_id, 'Marco', 'Rossi', '+39 02 1234 5678', '+39 02 1234 5678', '+39 333 123 4567', 'marco.rossi@email.com', 'WEB', 'Website Contact Form', 'APPUNTAMENTO', 'Consultation scheduled', 'Appointment confirmed for next week', 'Centro Oculistico Milano', 'LASIK Surgery', 'Spring Special 20%', NOW() + INTERVAL '3 days', 'Q1-Follow-Up'),
    (user_id, 'Sofia', 'Bianchi', '+39 06 9876 5432', '+39 06 9876 5432', '+39 333 987 6543', 'sofia.bianchi@email.com', 'FACEBOOK', 'Facebook Ad Campaign', 'APPUNTAMENTO', 'Premium consultation booked', 'Patient interested in premium package', 'Centro Oculistico Roma', 'SMILE Surgery', 'Premium Package', NOW() + INTERVAL '5 days', 'Q1-Follow-Up'),
    (user_id, 'Luca', 'Verdi', '+39 055 1111 2222', '+39 055 1111 2222', '+39 333 111 2222', 'luca.verdi@email.com', 'INFLUENCER', 'Instagram Influencer', 'APPUNTAMENTO', 'ICL consultation', 'High myopia patient', 'Centro Oculistico Firenze', 'ICL Surgery', 'Summer Campaign', NOW() + INTERVAL '7 days', 'Q1-Follow-Up'),
    (user_id, 'Giulia', 'Neri', '+39 081 3333 4444', '+39 081 3333 4444', '+39 333 333 4444', 'giulia.neri@email.com', 'WEB', 'Google Ads', 'APPUNTAMENTO', 'PRK evaluation', 'Patient considering PRK', 'Centro Oculistico Napoli', 'PRK Surgery', 'New Patient Special', NOW() + INTERVAL '2 days', 'Q1-Follow-Up'),
    (user_id, 'Alessandro', 'Gialli', '+39 011 5555 6666', '+39 011 5555 6666', '+39 333 555 6666', 'alessandro.gialli@email.com', 'FACEBOOK', 'Facebook Lead Form', 'APPUNTAMENTO', 'Cataract surgery', 'Senior patient', 'Centro Oculistico Torino', 'Cataract Surgery', 'Senior Discount', NOW() + INTERVAL '4 days', 'Q1-Follow-Up'),
    (user_id, 'Valentina', 'Marroni', '+39 02 7777 8888', '+39 02 7777 8888', '+39 333 777 8888', 'valentina.marroni@email.com', 'WEB', 'Website Contact Form', 'APPUNTAMENTO', 'Follow-up consultation', 'Post-surgery check', 'Centro Oculistico Milano', 'LASIK Surgery', 'Spring Special 20%', NOW() + INTERVAL '1 day', 'Q1-Follow-Up'),
    (user_id, 'Matteo', 'Azzurri', '+39 06 9999 0000', '+39 06 9999 0000', '+39 333 999 0000', 'matteo.azzurri@email.com', 'FACEBOOK', 'Facebook Ad Campaign', 'APPUNTAMENTO', 'SMILE consultation', 'Young professional', 'Centro Oculistico Roma', 'SMILE Surgery', 'Premium Package', NOW() + INTERVAL '6 days', 'Q1-Follow-Up'),
    (user_id, 'Chiara', 'Rosa', '+39 055 1111 3333', '+39 055 1111 3333', '+39 333 111 3333', 'chiara.rosa@email.com', 'INFLUENCER', 'Instagram Influencer', 'APPUNTAMENTO', 'ICL evaluation', 'High prescription', 'Centro Oculistico Firenze', 'ICL Surgery', 'Summer Campaign', NOW() + INTERVAL '8 days', 'Q1-Follow-Up'),
    
    -- In Progress (IN_CORSO)
    (user_id, 'Roberto', 'Blu', '+39 081 2222 4444', '+39 081 2222 4444', '+39 333 222 4444', 'roberto.blu@email.com', 'WEB', 'Website Contact Form', 'IN_CORSO', 'Considering options', 'Patient researching treatments', 'Centro Oculistico Napoli', 'LASIK Surgery', 'New Patient Special', NOW() + INTERVAL '10 days', 'Q1-Follow-Up'),
    (user_id, 'Elena', 'Viola', '+39 011 3333 5555', '+39 011 3333 5555', '+39 333 333 5555', 'elena.viola@email.com', 'FACEBOOK', 'Facebook Ad Campaign', 'IN_CORSO', 'Price comparison', 'Comparing clinics', 'Centro Oculistico Torino', 'SMILE Surgery', 'Premium Package', NOW() + INTERVAL '12 days', 'Q1-Follow-Up'),
    (user_id, 'Davide', 'Arancione', '+39 02 4444 6666', '+39 02 4444 6666', '+39 333 444 6666', 'davide.arancione@email.com', 'WEB', 'Google Ads', 'IN_CORSO', 'Insurance verification', 'Checking coverage', 'Centro Oculistico Milano', 'PRK Surgery', 'Spring Special 20%', NOW() + INTERVAL '15 days', 'Q1-Follow-Up'),
    (user_id, 'Federica', 'Verde', '+39 06 5555 7777', '+39 06 5555 7777', '+39 333 555 7777', 'federica.verde@email.com', 'INFLUENCER', 'Instagram Influencer', 'IN_CORSO', 'Schedule coordination', 'Finding suitable time', 'Centro Oculistico Roma', 'ICL Surgery', 'Summer Campaign', NOW() + INTERVAL '9 days', 'Q1-Follow-Up'),
    (user_id, 'Simone', 'Grigio', '+39 055 6666 8888', '+39 055 6666 8888', '+39 333 666 8888', 'simone.grigio@email.com', 'FACEBOOK', 'Facebook Lead Form', 'IN_CORSO', 'Medical history review', 'Pre-screening', 'Centro Oculistico Firenze', 'Cataract Surgery', 'Senior Discount', NOW() + INTERVAL '14 days', 'Q1-Follow-Up'),
    (user_id, 'Laura', 'Marrone', '+39 081 7777 9999', '+39 081 7777 9999', '+39 333 777 9999', 'laura.marrone@email.com', 'WEB', 'Website Contact Form', 'IN_CORSO', 'Treatment consultation', 'Discussing options', 'Centro Oculistico Napoli', 'LASIK Surgery', 'New Patient Special', NOW() + INTERVAL '11 days', 'Q1-Follow-Up'),
    (user_id, 'Andrea', 'Nero', '+39 011 8888 0000', '+39 011 8888 0000', '+39 333 888 0000', 'andrea.nero@email.com', 'FACEBOOK', 'Facebook Ad Campaign', 'IN_CORSO', 'Second opinion', 'Seeking additional consultation', 'Centro Oculistico Torino', 'SMILE Surgery', 'Premium Package', NOW() + INTERVAL '13 days', 'Q1-Follow-Up'),
    (user_id, 'Martina', 'Bianco', '+39 02 9999 1111', '+39 02 9999 1111', '+39 333 999 1111', 'martina.bianco@email.com', 'WEB', 'Google Ads', 'IN_CORSO', 'Family consultation', 'Discussing with family', 'Centro Oculistico Milano', 'PRK Surgery', 'Spring Special 20%', NOW() + INTERVAL '16 days', 'Q1-Follow-Up'),
    
    -- Closed (CHIUSO)
    (user_id, 'Paolo', 'Rosso', '+39 06 0000 2222', '+39 06 0000 2222', '+39 333 000 2222', 'paolo.rosso@email.com', 'WEB', 'Website Contact Form', 'CHIUSO', 'Not interested', 'Patient decided against surgery', 'Centro Oculistico Roma', 'LASIK Surgery', 'Spring Special 20%', NULL, 'Q1-Follow-Up'),
    (user_id, 'Silvia', 'Giallo', '+39 055 1111 3333', '+39 055 1111 3333', '+39 333 111 3333', 'silvia.giallo@email.com', 'FACEBOOK', 'Facebook Ad Campaign', 'CHIUSO', 'Went to competitor', 'Chose different clinic', 'Centro Oculistico Firenze', 'SMILE Surgery', 'Premium Package', NULL, 'Q1-Follow-Up'),
    (user_id, 'Riccardo', 'Verde', '+39 081 2222 4444', '+39 081 2222 4444', '+39 333 222 4444', 'riccardo.verde@email.com', 'INFLUENCER', 'Instagram Influencer', 'CHIUSO', 'Insurance denied', 'Coverage not approved', 'Centro Oculistico Napoli', 'ICL Surgery', 'Summer Campaign', NULL, 'Q1-Follow-Up'),
    (user_id, 'Alessia', 'Blu', '+39 011 3333 5555', '+39 011 3333 5555', '+39 333 333 5555', 'alessia.blu@email.com', 'WEB', 'Google Ads', 'CHIUSO', 'Not eligible', 'Medical contraindications', 'Centro Oculistico Torino', 'PRK Surgery', 'New Patient Special', NULL, 'Q1-Follow-Up'),
    (user_id, 'Giuseppe', 'Viola', '+39 02 4444 6666', '+39 02 4444 6666', '+39 333 444 6666', 'giuseppe.viola@email.com', 'FACEBOOK', 'Facebook Lead Form', 'CHIUSO', 'Price too high', 'Budget constraints', 'Centro Oculistico Milano', 'Cataract Surgery', 'Senior Discount', NULL, 'Q1-Follow-Up');

    -- Insert notes for the cases
    INSERT INTO notes (case_id, user_id, content) VALUES 
    -- Notes for appointments
    (1, user_id, 'Initial contact made. Patient interested in LASIK surgery. Scheduled follow-up call.'),
    (1, user_id, 'Follow-up call completed. Patient has questions about recovery time and costs.'),
    (1, user_id, 'Appointment confirmed for next week. Patient seems very motivated.'),
    
    (2, user_id, 'Patient contacted through Facebook ad. Interested in premium SMILE surgery.'),
    (2, user_id, 'Premium consultation scheduled. Patient has high expectations.'),
    (2, user_id, 'Appointment confirmed. Patient will bring family member for support.'),
    
    (3, user_id, 'Influencer referral. Patient has very high myopia (-8.0).'),
    (3, user_id, 'ICL consultation scheduled. Patient excited about the possibility.'),
    (3, user_id, 'Appointment confirmed. Patient has done extensive research.'),
    
    (4, user_id, 'Google Ads lead. Patient considering PRK vs LASIK.'),
    (4, user_id, 'PRK evaluation scheduled. Patient has thin corneas.'),
    (4, user_id, 'Appointment confirmed. Patient nervous but optimistic.'),
    
    (5, user_id, 'Facebook lead form. Senior patient with cataracts.'),
    (5, user_id, 'Cataract surgery consultation scheduled. Patient has family support.'),
    (5, user_id, 'Appointment confirmed. Patient very grateful for senior discount.'),
    
    -- Notes for in-progress cases
    (9, user_id, 'Patient contacted through website. Researching different treatment options.'),
    (9, user_id, 'Patient comparing LASIK vs SMILE. Needs more information.'),
    (9, user_id, 'Follow-up call scheduled. Patient has many questions.'),
    
    (10, user_id, 'Facebook ad lead. Patient comparing prices between clinics.'),
    (10, user_id, 'Patient requested price comparison with other clinics.'),
    (10, user_id, 'Follow-up needed to discuss value proposition.'),
    
    (11, user_id, 'Google Ads lead. Patient checking insurance coverage.'),
    (11, user_id, 'Insurance verification in progress. Patient has good coverage.'),
    (11, user_id, 'Waiting for insurance approval. Patient optimistic.'),
    
    -- Notes for closed cases
    (17, user_id, 'Patient contacted through website. Initially interested in LASIK.'),
    (17, user_id, 'Patient decided against surgery after consultation. Concerns about risks.'),
    (17, user_id, 'Case closed. Patient not interested in proceeding.'),
    
    (18, user_id, 'Facebook ad lead. Patient interested in SMILE surgery.'),
    (18, user_id, 'Patient chose competitor clinic. Price was main factor.'),
    (18, user_id, 'Case closed. Lost to competitor.'),
    
    (19, user_id, 'Influencer referral. Patient with high myopia interested in ICL.'),
    (19, user_id, 'Insurance denied coverage for ICL surgery.'),
    (19, user_id, 'Case closed. Insurance coverage issue.');

END $$;

-- Display summary
SELECT 
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN follow_up_date IS NOT NULL THEN 1 END) as with_follow_up
FROM cases 
GROUP BY status 
ORDER BY status; 