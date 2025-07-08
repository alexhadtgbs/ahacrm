-- Add More Random Data
-- Run this in your Supabase SQL editor to add more test data without clearing existing data

-- Get the user ID for assignments
DO $$
DECLARE
    user_id UUID;
    next_case_id INTEGER;
BEGIN
    -- Get the first user from profiles
    SELECT id INTO user_id FROM profiles LIMIT 1;
    
    -- Get the next case ID
    SELECT COALESCE(MAX(id), 0) + 1 INTO next_case_id FROM cases;

    -- Insert additional random cases
    INSERT INTO cases (
        assigned_to, first_name, last_name, phone, home_phone, cell_phone, email, 
        channel, origin, status, disposition, outcome, clinic, treatment, 
        promotion, follow_up_date, dialer_campaign_tag
    ) VALUES 
    -- More Appointments
    (user_id, 'Francesca', 'Celeste', '+39 02 1111 3333', '+39 02 1111 3333', '+39 333 111 3333', 'francesca.celeste@email.com', 'WEB', 'Website Contact Form', 'APPUNTAMENTO', 'LASIK consultation', 'Young patient excited about surgery', 'Centro Oculistico Milano', 'LASIK Surgery', 'Spring Special 20%', NOW() + INTERVAL '2 days', 'Q1-Follow-Up'),
    (user_id, 'Antonio', 'Dorato', '+39 06 2222 4444', '+39 06 2222 4444', '+39 333 222 4444', 'antonio.dorato@email.com', 'FACEBOOK', 'Facebook Ad Campaign', 'APPUNTAMENTO', 'SMILE evaluation', 'Professional athlete', 'Centro Oculistico Roma', 'SMILE Surgery', 'Premium Package', NOW() + INTERVAL '4 days', 'Q1-Follow-Up'),
    (user_id, 'Isabella', 'Argento', '+39 055 3333 5555', '+39 055 3333 5555', '+39 333 333 5555', 'isabella.argento@email.com', 'INFLUENCER', 'Instagram Influencer', 'APPUNTAMENTO', 'ICL consultation', 'High prescription patient', 'Centro Oculistico Firenze', 'ICL Surgery', 'Summer Campaign', NOW() + INTERVAL '6 days', 'Q1-Follow-Up'),
    
    -- More In Progress
    (user_id, 'Leonardo', 'Bronzo', '+39 081 4444 6666', '+39 081 4444 6666', '+39 333 444 6666', 'leonardo.bronzo@email.com', 'WEB', 'Google Ads', 'IN_CORSO', 'Researching options', 'Patient comparing treatments', 'Centro Oculistico Napoli', 'PRK Surgery', 'New Patient Special', NOW() + INTERVAL '8 days', 'Q1-Follow-Up'),
    (user_id, 'Beatrice', 'Rame', '+39 011 5555 7777', '+39 011 5555 7777', '+39 333 555 7777', 'beatrice.rame@email.com', 'FACEBOOK', 'Facebook Lead Form', 'IN_CORSO', 'Price comparison', 'Budget-conscious patient', 'Centro Oculistico Torino', 'LASIK Surgery', 'Spring Special 20%', NOW() + INTERVAL '10 days', 'Q1-Follow-Up'),
    (user_id, 'Gabriele', 'Platino', '+39 02 6666 8888', '+39 02 6666 8888', '+39 333 666 8888', 'gabriele.platino@email.com', 'WEB', 'Website Contact Form', 'IN_CORSO', 'Insurance check', 'Verifying coverage', 'Centro Oculistico Milano', 'SMILE Surgery', 'Premium Package', NOW() + INTERVAL '12 days', 'Q1-Follow-Up'),
    
    -- More Closed
    (user_id, 'Camilla', 'Oro', '+39 06 7777 9999', '+39 06 7777 9999', '+39 333 777 9999', 'camilla.oro@email.com', 'FACEBOOK', 'Facebook Ad Campaign', 'CHIUSO', 'Not interested', 'Patient decided against surgery', 'Centro Oculistico Roma', 'ICL Surgery', 'Summer Campaign', NULL, 'Q1-Follow-Up'),
    (user_id, 'Tommaso', 'Ferro', '+39 055 8888 0000', '+39 055 8888 0000', '+39 333 888 0000', 'tommaso.ferro@email.com', 'INFLUENCER', 'Instagram Influencer', 'CHIUSO', 'Went to competitor', 'Chose different clinic', 'Centro Oculistico Firenze', 'PRK Surgery', 'New Patient Special', NULL, 'Q1-Follow-Up'),
    (user_id, 'Vittoria', 'Acciaio', '+39 081 9999 1111', '+39 081 9999 1111', '+39 333 999 1111', 'vittoria.acciaio@email.com', 'WEB', 'Google Ads', 'CHIUSO', 'Insurance denied', 'Coverage not approved', 'Centro Oculistico Napoli', 'LASIK Surgery', 'Spring Special 20%', NULL, 'Q1-Follow-Up');

    -- Add notes for new cases
    INSERT INTO notes (case_id, user_id, content) VALUES 
    (next_case_id, user_id, 'New patient contacted through website. Very interested in LASIK surgery.'),
    (next_case_id, user_id, 'Consultation scheduled. Patient has done extensive research.'),
    
    (next_case_id + 1, user_id, 'Facebook ad lead. Professional athlete interested in SMILE surgery.'),
    (next_case_id + 1, user_id, 'Premium consultation scheduled. Patient has specific requirements.'),
    
    (next_case_id + 2, user_id, 'Influencer referral. High prescription patient (-9.0).'),
    (next_case_id + 2, user_id, 'ICL consultation scheduled. Patient excited about the possibility.');

END $$;

-- Display updated summary
SELECT 
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN follow_up_date IS NOT NULL THEN 1 END) as with_follow_up
FROM cases 
GROUP BY status 
ORDER BY status; 