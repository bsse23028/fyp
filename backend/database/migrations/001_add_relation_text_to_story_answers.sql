-- =====================================================================
-- Migration 001: keep relationships the parent TYPED in "Personalize stories".
--
-- WHY: in the app, "Other important people" has a Relationship field where the parent can
-- pick from the list (Grandmother, Teacher ...) OR type their own (e.g. "Nanny", "Coach").
-- child_story_answers.relation_id can only point at a row of `relations`, so a typed
-- relationship had nowhere to go and would be lost.
--
-- WHAT: one new, optional column. A relation from the list is still saved in relation_id;
-- a typed one is saved here. Nothing is deleted or changed in existing rows.
-- =====================================================================

ALTER TABLE child_story_answers
  ADD COLUMN relation_text VARCHAR(40) NULL AFTER relation_id;
