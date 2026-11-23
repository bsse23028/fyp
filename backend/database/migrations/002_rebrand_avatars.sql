-- =====================================================================
-- Migration 002: the rebranded buddies (2026-11-23).
--
-- WHY: the app now has 11 buddies (the 2026-11-20 mascot rebrand), but the server only knew
-- panda, rabbit, wolf and bear, so the picker hid the 8 new ones and saving one was refused
-- ("is not an avatar").
--
-- WHAT:
--   * adds dino, elephant, fox, kitty, koala, lion, penguin, puppy
--   * sets the order and names of all 11 to match the app (src/shared/theme/avatars.js)
--   * switches OFF wolf (is_active = 0): the app has no wolf picture any more. The row stays, so
--     children who already chose the wolf keep working (the app shows them the bunny) - nothing
--     is deleted. A switched-off buddy cannot be chosen again.
--
-- Safe to run on a database that already has some of these rows (it updates them instead).
-- =====================================================================

INSERT INTO avatars (code, name, sort_order, is_active) VALUES
  ('rabbit',   'Bunny',     1, 1),
  ('bear',     'Bear',      2, 1),
  ('panda',    'Panda',     3, 1),
  ('dino',     'Dino',      4, 1),
  ('elephant', 'Elephant',  5, 1),
  ('fox',      'Fox',       6, 1),
  ('kitty',    'Kitty',     7, 1),
  ('koala',    'Koala',     8, 1),
  ('lion',     'Lion',      9, 1),
  ('penguin',  'Penguin',  10, 1),
  ('puppy',    'Puppy',    11, 1),
  ('wolf',     'Wolf',     99, 0)
ON DUPLICATE KEY UPDATE
  name       = VALUES(name),
  sort_order = VALUES(sort_order),
  is_active  = VALUES(is_active);
