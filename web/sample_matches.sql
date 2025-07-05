-- Insert sample matches
INSERT INTO matches (title, match_type, skill_level, court_id, date, time, duration_minutes, max_players, status, description) VALUES
('Morning Doubles', 'Doubles', 'Intermediate', (SELECT id FROM courts LIMIT 1), '2024-12-04', '09:00', 90, 4, 'scheduled', 'Casual doubles match for intermediate players'),
('Advanced Singles', 'Singles', 'Advanced', (SELECT id FROM courts LIMIT 1 OFFSET 1), '2024-12-04', '11:00', 60, 2, 'scheduled', 'Competitive singles match'),
('Mixed Doubles Tournament', 'Mixed Doubles', 'Mixed', (SELECT id FROM courts LIMIT 1), '2024-12-04', '14:00', 120, 4, 'in_progress', 'Tournament style mixed doubles'),
('Beginner Practice', 'Doubles', 'Beginner', (SELECT id FROM courts LIMIT 1 OFFSET 2), '2024-12-05', '10:00', 90, 4, 'scheduled', 'Practice session for new players'),
('Evening Match', 'Doubles', 'Intermediate', (SELECT id FROM courts LIMIT 1), '2024-12-05', '18:00', 90, 4, 'scheduled', 'Evening doubles match');
