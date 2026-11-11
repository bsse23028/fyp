-- =====================================================================
-- KidBuddy database  (MySQL 8 / MariaDB 10.4+, XAMPP, InnoDB, utf8mb4)
-- File 1 of 3: SCHEMA.  Run 02_seed.sql after this one.
--
-- RULES USED EVERYWHERE
--  * Every id is BIGINT UNSIGNED AUTO_INCREMENT (small lookup tables use SMALLINT UNSIGNED).
--  * Times are stored in UTC (the API sets the connection time zone to +00:00).
--  * Anything that belongs to a child is ON DELETE CASCADE ("delete child for good").
--  * Things that can grow later (modules, supports, languages, avatars, age bands,
--    story questions) are ROWS in lookup tables, not ENUMs, so adding one is an INSERT,
--    not an ALTER TABLE.
--  * No JSON columns for real data: sentences are stored word by word (3NF).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS kidbuddy
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kidbuddy;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS
  struggle_words, child_daily_progress, reading_session_details, activity_sessions,
  sentence_words, sentence_translations, reading_sentences, topic_levels,
  reading_topics, reading_levels,
  child_story_answers, story_fields, relations,
  child_modules, module_supports, modules, sensors,
  child_supports, supports, children, avatars, age_bands, languages,
  verification_codes, parent_pins, user_sessions, user_passwords, users;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. LOOKUPS shared by many tables
-- ---------------------------------------------------------------------
CREATE TABLE languages (
  code        CHAR(2)      NOT NULL PRIMARY KEY,          -- 'en', 'ur'
  name        VARCHAR(40)  NOT NULL,                      -- 'English'
  native_name VARCHAR(40)  NOT NULL,                      -- 'اردو'
  is_rtl      TINYINT(1)   NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE age_bands (
  id         SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(10) NOT NULL UNIQUE,                 -- '4-6'
  label      VARCHAR(30) NOT NULL,                        -- '4–6 years'
  min_age    TINYINT UNSIGNED NOT NULL,
  max_age    TINYINT UNSIGNED NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE avatars (
  id         SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(20) NOT NULL UNIQUE,                 -- 'rabbit'
  name       VARCHAR(40) NOT NULL,
  is_active  TINYINT(1)  NOT NULL DEFAULT 1,
  sort_order SMALLINT    NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE sensors (                                    -- Mic / Camera badge on an activity
  id   SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(40) NOT NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. ACCOUNT AND SECURITY  (replaces AuthContext + kidbuddy_users / kidbuddy_session)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(190) NOT NULL,                -- stored lowercase by the API
  status            ENUM('pending','active','disabled') NOT NULL DEFAULT 'pending',
  email_verified_at DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- current + old passwords ("choose a password you have not used before")
-- is_current is 1 for the current row and NULL for old rows, so UNIQUE(user_id,is_current)
-- allows exactly ONE current password per user but any number of old ones.
CREATE TABLE user_passwords (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,
  password_hash VARCHAR(255) NOT NULL,                    -- bcrypt / argon2, never plain text
  is_current    TINYINT(1) NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_current_password (user_id, is_current),
  KEY ix_user_passwords_user (user_id),
  CONSTRAINT fk_user_passwords_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE user_sessions (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id            BIGINT UNSIGNED NOT NULL,
  refresh_token_hash CHAR(64) NOT NULL,                   -- SHA-256 hex of the refresh token
  device_name        VARCHAR(100) NULL,
  platform           VARCHAR(20)  NULL,                   -- 'android', 'ios'
  last_used_at       DATETIME NULL,
  expires_at         DATETIME NOT NULL,
  revoked_at         DATETIME NULL,                       -- set on logout
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sessions_token (refresh_token_hash),
  KEY ix_sessions_user (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE parent_pins (                                -- 1:1 with users
  user_id         BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  pin_hash        VARCHAR(255) NOT NULL,
  failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until    DATETIME NULL,                          -- brute-force guard (4 digits is weak)
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE verification_codes (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  purpose     ENUM('signup','reset_password','change_password','change_pin') NOT NULL,
  code_hash   CHAR(64) NOT NULL,
  expires_at  DATETIME NOT NULL,
  attempts    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  consumed_at DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_codes_lookup (user_id, purpose, consumed_at),
  CONSTRAINT fk_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. CHILDREN
-- ---------------------------------------------------------------------
CREATE TABLE children (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id          BIGINT UNSIGNED NOT NULL,
  name             VARCHAR(60) NOT NULL,
  age_band_id      SMALLINT UNSIGNED NOT NULL,
  avatar_id        SMALLINT UNSIGNED NOT NULL,
  language_code    CHAR(2) NOT NULL DEFAULT 'en',
  last_selected_at DATETIME NULL,                         -- replaces activeId (latest = active)
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_children_user (user_id),
  CONSTRAINT fk_children_user     FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_children_age_band FOREIGN KEY (age_band_id)   REFERENCES age_bands(id),
  CONSTRAINT fk_children_avatar   FOREIGN KEY (avatar_id)     REFERENCES avatars(id),
  CONSTRAINT fk_children_language FOREIGN KEY (language_code) REFERENCES languages(code)
) ENGINE=InnoDB;

-- Areas of support (Reading, Writing ...)
CREATE TABLE supports (
  id         SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(40) NOT NULL UNIQUE,
  name       VARCHAR(60) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE child_supports (
  child_id   BIGINT UNSIGNED NOT NULL,
  support_id SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (child_id, support_id),
  CONSTRAINT fk_cs_child   FOREIGN KEY (child_id)   REFERENCES children(id) ON DELETE CASCADE,
  CONSTRAINT fk_cs_support FOREIGN KEY (support_id) REFERENCES supports(id)
) ENGINE=InnoDB;

-- Activities (Read-Along, Phonics ...)
CREATE TABLE modules (
  id           SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(40) NOT NULL UNIQUE,               -- 'read-along'
  name         VARCHAR(60) NOT NULL,                      -- 'Read-Along'
  sensor_id    SMALLINT UNSIGNED NULL,                    -- Mic / Camera / none
  is_available TINYINT(1) NOT NULL DEFAULT 0,             -- 0 = "Coming soon"
  on_by_default TINYINT(1) NOT NULL DEFAULT 1,            -- switched on for a NEW child
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT fk_modules_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id)
) ENGINE=InnoDB;

-- Which areas of support SUGGEST which activity ("Suggest from areas of support")
CREATE TABLE module_supports (
  module_id  SMALLINT UNSIGNED NOT NULL,
  support_id SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (module_id, support_id),
  CONSTRAINT fk_ms_module  FOREIGN KEY (module_id)  REFERENCES modules(id)  ON DELETE CASCADE,
  CONSTRAINT fk_ms_support FOREIGN KEY (support_id) REFERENCES supports(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- A row here = the activity is switched ON for that child
CREATE TABLE child_modules (
  child_id  BIGINT UNSIGNED NOT NULL,
  module_id SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (child_id, module_id),
  CONSTRAINT fk_cm_child  FOREIGN KEY (child_id)  REFERENCES children(id) ON DELETE CASCADE,
  CONSTRAINT fk_cm_module FOREIGN KEY (module_id) REFERENCES modules(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. PERSONALIZE STORIES
--    One generic table instead of 20 columns: adding a new question later
--    is one INSERT into story_fields, no ALTER TABLE.
-- ---------------------------------------------------------------------
CREATE TABLE relations (                                  -- Grandmother, Teacher ...
  id         SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(30) NOT NULL UNIQUE,
  name       VARCHAR(40) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE story_fields (
  id          SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(40) NOT NULL UNIQUE,                -- 'fav_animal', 'sibling', 'other_person'
  section     VARCHAR(20) NOT NULL,                       -- people | favourites | interests | everyday | notes
  label       VARCHAR(80) NOT NULL,
  is_multi    TINYINT(1) NOT NULL DEFAULT 0,              -- many values allowed (hobbies, siblings ...)
  has_relation TINYINT(1) NOT NULL DEFAULT 0,             -- value also needs a relation (other_person)
  sort_order  SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE child_story_answers (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  child_id    BIGINT UNSIGNED NOT NULL,
  field_id    SMALLINT UNSIGNED NOT NULL,
  value       VARCHAR(1000) NOT NULL,                     -- always saved in English (as the app does)
  relation_id SMALLINT UNSIGNED NULL,                     -- only when story_fields.has_relation = 1
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_answers_child (child_id, field_id),
  CONSTRAINT fk_answers_child    FOREIGN KEY (child_id)    REFERENCES children(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_field    FOREIGN KEY (field_id)    REFERENCES story_fields(id),
  CONSTRAINT fk_answers_relation FOREIGN KEY (relation_id) REFERENCES relations(id)
) ENGINE=InnoDB;
-- Rule enforced by the API: a single-value field (is_multi = 0) has at most ONE row per child.

-- ---------------------------------------------------------------------
-- 5. READ-ALONG CONTENT  (replaces readingTopics.json + LEVELS)
-- ---------------------------------------------------------------------
CREATE TABLE reading_levels (
  id         SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(10) NOT NULL UNIQUE,                 -- easy | medium | hard
  label      VARCHAR(20) NOT NULL,
  stars      TINYINT UNSIGNED NOT NULL,
  tint       VARCHAR(20) NOT NULL,
  color      VARCHAR(20) NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE reading_topics (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(60) NOT NULL UNIQUE,             -- 'animals'; custom: 'custom-<uuid>'
  title          VARCHAR(80) NOT NULL,
  icon           VARCHAR(16) NULL,                        -- emoji
  tint           VARCHAR(20) NULL,
  owner_child_id BIGINT UNSIGNED NULL,                    -- NULL = built-in, else made for ONE child
  sort_order     SMALLINT NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_topics_owner (owner_child_id),
  CONSTRAINT fk_topics_child FOREIGN KEY (owner_child_id) REFERENCES children(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE topic_levels (
  id       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  topic_id BIGINT UNSIGNED NOT NULL,
  level_id SMALLINT UNSIGNED NOT NULL,
  UNIQUE KEY uq_topic_level (topic_id, level_id),
  CONSTRAINT fk_tl_topic FOREIGN KEY (topic_id) REFERENCES reading_topics(id) ON DELETE CASCADE,
  CONSTRAINT fk_tl_level FOREIGN KEY (level_id) REFERENCES reading_levels(id)
) ENGINE=InnoDB;

CREATE TABLE reading_sentences (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  topic_level_id BIGINT UNSIGNED NOT NULL,
  position       SMALLINT UNSIGNED NOT NULL,              -- 1, 2, 3 (the app's index + 1)
  UNIQUE KEY uq_sentence_pos (topic_level_id, position),
  CONSTRAINT fk_sent_tl FOREIGN KEY (topic_level_id) REFERENCES topic_levels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- one row per sentence per language; focus_position = the glowing word (1 = first word)
CREATE TABLE sentence_translations (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sentence_id    BIGINT UNSIGNED NOT NULL,
  language_code  CHAR(2) NOT NULL,
  focus_position SMALLINT UNSIGNED NULL,
  UNIQUE KEY uq_sent_lang (sentence_id, language_code),
  CONSTRAINT fk_st_sentence FOREIGN KEY (sentence_id)   REFERENCES reading_sentences(id) ON DELETE CASCADE,
  CONSTRAINT fk_st_language FOREIGN KEY (language_code) REFERENCES languages(code)
) ENGINE=InnoDB;

CREATE TABLE sentence_words (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  translation_id BIGINT UNSIGNED NOT NULL,
  position       SMALLINT UNSIGNED NOT NULL,              -- 1 = first word (right-most in Urdu)
  word           VARCHAR(80) NOT NULL,                    -- punctuation stays attached, e.g. 'mat.'
  UNIQUE KEY uq_word_pos (translation_id, position),
  CONSTRAINT fk_sw_translation FOREIGN KEY (translation_id) REFERENCES sentence_translations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. PROGRESS  (generic for every module, not only reading)
-- ---------------------------------------------------------------------
CREATE TABLE activity_sessions (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  child_id          BIGINT UNSIGNED NOT NULL,
  module_id         SMALLINT UNSIGNED NOT NULL,
  language_code     CHAR(2) NOT NULL,
  stars_earned      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  session_date      DATE NOT NULL,                        -- the CHILD's local day (streaks, time zones)
  completed_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  client_session_id CHAR(36) NOT NULL,                    -- the app makes a UUID, so a retry cannot double the stars
  UNIQUE KEY uq_session_client (child_id, client_session_id),
  KEY ix_sessions_child_date (child_id, session_date),
  CONSTRAINT fk_as_child    FOREIGN KEY (child_id)      REFERENCES children(id) ON DELETE CASCADE,
  CONSTRAINT fk_as_module   FOREIGN KEY (module_id)     REFERENCES modules(id),
  CONSTRAINT fk_as_language FOREIGN KEY (language_code) REFERENCES languages(code)
) ENGINE=InnoDB;

-- extra details that only a reading session has (1:1). Numbers etc. get their own detail table.
CREATE TABLE reading_session_details (
  session_id     BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  topic_level_id BIGINT UNSIGNED NOT NULL,
  CONSTRAINT fk_rsd_session FOREIGN KEY (session_id)     REFERENCES activity_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_rsd_tl      FOREIGN KEY (topic_level_id) REFERENCES topic_levels(id)
) ENGINE=InnoDB;

-- Roll-up (the old `activity` map). The API updates it in the SAME transaction as the session insert.
-- Parent Home / Progress read this; if you prefer, drop it and SUM(activity_sessions) instead.
CREATE TABLE child_daily_progress (
  child_id      BIGINT UNSIGNED NOT NULL,
  module_id     SMALLINT UNSIGNED NOT NULL,
  activity_date DATE NOT NULL,
  sessions      INT UNSIGNED NOT NULL DEFAULT 0,
  stars         INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (child_id, activity_date, module_id),
  CONSTRAINT fk_cdp_child  FOREIGN KEY (child_id)  REFERENCES children(id) ON DELETE CASCADE,
  CONSTRAINT fk_cdp_module FOREIGN KEY (module_id) REFERENCES modules(id)
) ENGINE=InnoDB;

CREATE TABLE struggle_words (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  child_id        BIGINT UNSIGNED NOT NULL,
  language_code   CHAR(2) NOT NULL DEFAULT 'en',
  word            VARCHAR(80) NOT NULL,                   -- case-insensitive collation = the app's lowercase match
  topic_id        BIGINT UNSIGNED NULL,
  miss_count      INT UNSIGNED NOT NULL DEFAULT 1,
  first_missed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_missed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_struggle (child_id, language_code, word),
  CONSTRAINT fk_sw2_child    FOREIGN KEY (child_id)      REFERENCES children(id) ON DELETE CASCADE,
  CONSTRAINT fk_sw2_language FOREIGN KEY (language_code) REFERENCES languages(code),
  CONSTRAINT fk_sw2_topic    FOREIGN KEY (topic_id)      REFERENCES reading_topics(id) ON DELETE SET NULL
) ENGINE=InnoDB;
