-- Intake section DEM (Demographic Information): hide from client interview script by default.
-- `loadIntakeScriptQuestions` filters `is_visible`; family profile holds structured demographics.
-- Admin may set is_visible true per question if those prompts should appear in intake again.

UPDATE questions
SET is_visible = FALSE
WHERE section_id = '00000000-0000-0000-0001-000000000002';
