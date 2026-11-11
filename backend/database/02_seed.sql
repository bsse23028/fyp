-- =====================================================================
-- KidBuddy database - File 2 of 3: SEED DATA (run after 01_schema.sql)
-- Lookups come from childOptions.js / storyOptions.js / readingData.js.
-- The reading section is GENERATED from modules/english/data/readingTopics.json.
-- =====================================================================
USE kidbuddy;
SET NAMES utf8mb4;

INSERT INTO languages (code, name, native_name, is_rtl) VALUES
 ('en','English','English',0), ('ur','Urdu','اردو',1);

INSERT INTO age_bands (code, label, min_age, max_age, sort_order) VALUES
 ('4-6','4–6 years',4,6,1), ('7-9','7–9 years',7,9,2), ('10-12','10–12 years',10,12,3);

INSERT INTO avatars (code, name, sort_order) VALUES
 ('panda','Panda',1), ('rabbit','Rabbit',2), ('wolf','Wolf',3), ('bear','Bear',4);

INSERT INTO sensors (code, name) VALUES ('mic','Mic'), ('camera','Camera');

INSERT INTO supports (code, name, sort_order) VALUES
 ('reading','Reading',1), ('writing','Writing',2), ('numbers','Numbers',3),
 ('speech-language','Speech and language',4), ('attention-routine','Attention and routine',5),
 ('social-communication','Social communication',6), ('daily-living','Daily living',7);

-- is_available = 1 only for what is really built today (Read-Along).
-- on_by_default = 0 for the two camera-heavy ones (as in the app).
INSERT INTO modules (code, name, sensor_id, is_available, on_by_default, sort_order) VALUES
 ('read-along','Read-Along',(SELECT id FROM sensors WHERE code='mic'),1,1,1),
 ('reading-assist','Reading Assist',NULL,0,1,2),
 ('phonics','Phonics',NULL,0,1,3),
 ('spelling','Spelling',NULL,0,1,4),
 ('handwriting','Handwriting',(SELECT id FROM sensors WHERE code='camera'),0,0,5),
 ('vowel-phoneme','Vowel / Phoneme',(SELECT id FROM sensors WHERE code='mic'),0,1,6),
 ('emotion-trainer','Emotion Trainer',(SELECT id FROM sensors WHERE code='camera'),0,1,7),
 ('number-sense','Number Sense',(SELECT id FROM sensors WHERE code='camera'),0,0,8),
 ('aac-talk-board','AAC Talk Board',NULL,0,1,9),
 ('social-stories','Social Stories',NULL,0,1,10),
 ('routines-attention','Routines / Attention',NULL,0,1,11);

INSERT INTO module_supports (module_id, support_id)
SELECT m.id, s.id FROM (
  SELECT 'read-along' m,'reading' s UNION ALL SELECT 'reading-assist','reading'
  UNION ALL SELECT 'phonics','reading'
  UNION ALL SELECT 'spelling','reading' UNION ALL SELECT 'spelling','writing'
  UNION ALL SELECT 'handwriting','writing'
  UNION ALL SELECT 'vowel-phoneme','speech-language'
  UNION ALL SELECT 'emotion-trainer','social-communication'
  UNION ALL SELECT 'number-sense','numbers'
  UNION ALL SELECT 'aac-talk-board','speech-language' UNION ALL SELECT 'aac-talk-board','social-communication'
  UNION ALL SELECT 'social-stories','social-communication'
  UNION ALL SELECT 'routines-attention','attention-routine' UNION ALL SELECT 'routines-attention','daily-living'
) x JOIN modules m ON m.code = x.m JOIN supports s ON s.code = x.s;

INSERT INTO relations (code, name, sort_order) VALUES
 ('grandmother','Grandmother',1),('grandfather','Grandfather',2),('aunt','Aunt',3),('uncle','Uncle',4),
 ('cousin','Cousin',5),('friend','Friend',6),('teacher','Teacher',7),('neighbour','Neighbour',8);

-- The questions of "Personalize my child's stories". is_multi / has_relation drive the API rules.
INSERT INTO story_fields (code, section, label, is_multi, has_relation, sort_order) VALUES
 ('preferred_name','people','Preferred name',0,0,1),
 ('mother','people','Mother',0,0,2),
 ('father','people','Father',0,0,3),
 ('sibling','people','Sibling',1,0,4),
 ('other_person','people','Other person',1,1,5),
 ('fav_animal','favourites','Favourite animal',0,0,6),
 ('fav_toy','favourites','Favourite toy',0,0,7),
 ('fav_food','favourites','Favourite food',0,0,8),
 ('fav_colour','favourites','Favourite colour',0,0,9),
 ('fav_character','favourites','Favourite character',0,0,10),
 ('fav_game','favourites','Favourite game',0,0,11),
 ('hobby','interests','Hobby',1,0,12),
 ('fav_place','interests','Favourite place',0,0,13),
 ('story_type','interests','Story type',1,0,14),
 ('hometown','everyday','Hometown',0,0,15),
 ('everyday_activity','everyday','Everyday activity',0,0,16),
 ('familiar_place','everyday','Familiar place',1,0,17),
 ('routine','everyday','Routine',0,0,18),
 ('notes','notes','Special instructions',0,0,19);

INSERT INTO reading_levels (code, label, stars, tint, color, sort_order) VALUES
 ('easy','Easy',1,'sagePale','sage',1),
 ('medium','Medium',2,'yellowPale','yellow',2),
 ('hard','Hard',3,'coralPale','coral',3);

-- ---------- READING CONTENT (generated from readingTopics.json) ----------
INSERT INTO reading_topics (code, title, icon, tint, sort_order) VALUES ('animals','Animals','🐶','bluePale',1);
SET @topic := LAST_INSERT_ID();
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='easy'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'The'),(@tr,2,'cat'),(@tr,3,'sat'),(@tr,4,'on'),(@tr,5,'the'),(@tr,6,'mat.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',1);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'بلی'),(@tr,2,'چٹائی'),(@tr,3,'پر'),(@tr,4,'بیٹھی۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'A'),(@tr,2,'dog'),(@tr,3,'can'),(@tr,4,'run'),(@tr,5,'fast.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',1);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'کتا'),(@tr,2,'تیز'),(@tr,3,'دوڑ'),(@tr,4,'سکتا'),(@tr,5,'ہے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'I'),(@tr,2,'see'),(@tr,3,'a'),(@tr,4,'red'),(@tr,5,'bird.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'مجھے'),(@tr,2,'ایک'),(@tr,3,'سرخ'),(@tr,4,'چڑیا'),(@tr,5,'نظر'),(@tr,6,'آتی'),(@tr,7,'ہے۔');
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='medium'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',7);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'The'),(@tr,2,'fluffy'),(@tr,3,'cat'),(@tr,4,'sat'),(@tr,5,'on'),(@tr,6,'the'),(@tr,7,'soft'),(@tr,8,'mat.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'پیاری'),(@tr,2,'بلی'),(@tr,3,'نرم'),(@tr,4,'چٹائی'),(@tr,5,'پر'),(@tr,6,'بیٹھی۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',7);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'A'),(@tr,2,'happy'),(@tr,3,'dog'),(@tr,4,'ran'),(@tr,5,'to'),(@tr,6,'the'),(@tr,7,'big'),(@tr,8,'park.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ایک'),(@tr,2,'خوش'),(@tr,3,'کتا'),(@tr,4,'بڑے'),(@tr,5,'پارک'),(@tr,6,'کی'),(@tr,7,'طرف'),(@tr,8,'بھاگا۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'We'),(@tr,2,'see'),(@tr,3,'a'),(@tr,4,'red'),(@tr,5,'bird'),(@tr,6,'in'),(@tr,7,'the'),(@tr,8,'tree.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ہم'),(@tr,2,'درخت'),(@tr,3,'میں'),(@tr,4,'ایک'),(@tr,5,'سرخ'),(@tr,6,'چڑیا'),(@tr,7,'دیکھتے'),(@tr,8,'ہیں۔');
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='hard'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'The'),(@tr,2,'little'),(@tr,3,'rabbit'),(@tr,4,'hopped'),(@tr,5,'quickly'),(@tr,6,'across'),(@tr,7,'the'),(@tr,8,'green'),(@tr,9,'meadow.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'چھوٹا'),(@tr,2,'خرگوش'),(@tr,3,'تیزی'),(@tr,4,'سے'),(@tr,5,'ہرے'),(@tr,6,'میدان'),(@tr,7,'میں'),(@tr,8,'کودتا'),(@tr,9,'رہا۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'A'),(@tr,2,'friendly'),(@tr,3,'elephant'),(@tr,4,'splashed'),(@tr,5,'water'),(@tr,6,'over'),(@tr,7,'its'),(@tr,8,'enormous'),(@tr,9,'back.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ایک'),(@tr,2,'دوستانہ'),(@tr,3,'ہاتھی'),(@tr,4,'نے'),(@tr,5,'اپنی'),(@tr,6,'بڑی'),(@tr,7,'پیٹھ'),(@tr,8,'پر'),(@tr,9,'پانی'),(@tr,10,'چھڑکا۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'Two'),(@tr,2,'yellow'),(@tr,3,'butterflies'),(@tr,4,'danced'),(@tr,5,'around'),(@tr,6,'the'),(@tr,7,'beautiful'),(@tr,8,'flower.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'دو'),(@tr,2,'پیلی'),(@tr,3,'تتلیاں'),(@tr,4,'خوبصورت'),(@tr,5,'پھول'),(@tr,6,'کے'),(@tr,7,'گرد'),(@tr,8,'ناچ'),(@tr,9,'رہی'),(@tr,10,'تھیں۔');
INSERT INTO reading_topics (code, title, icon, tint, sort_order) VALUES ('food','Food','🍎','sagePale',2);
SET @topic := LAST_INSERT_ID();
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='easy'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'I'),(@tr,2,'like'),(@tr,3,'red'),(@tr,4,'apples.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'مجھے'),(@tr,2,'سرخ'),(@tr,3,'سیب'),(@tr,4,'پسند'),(@tr,5,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',1);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'Milk'),(@tr,2,'is'),(@tr,3,'good'),(@tr,4,'for'),(@tr,5,'me.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',1);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'دودھ'),(@tr,2,'میرے'),(@tr,3,'لیے'),(@tr,4,'اچھا'),(@tr,5,'ہے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'We'),(@tr,2,'eat'),(@tr,3,'rice'),(@tr,4,'and'),(@tr,5,'fish.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ہم'),(@tr,2,'چاول'),(@tr,3,'اور'),(@tr,4,'مچھلی'),(@tr,5,'کھاتے'),(@tr,6,'ہیں۔');
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='medium'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'Mom'),(@tr,2,'cuts'),(@tr,3,'the'),(@tr,4,'sweet'),(@tr,5,'mango'),(@tr,6,'into'),(@tr,7,'small'),(@tr,8,'pieces.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'امی'),(@tr,2,'میٹھے'),(@tr,3,'آم'),(@tr,4,'کو'),(@tr,5,'چھوٹے'),(@tr,6,'ٹکڑوں'),(@tr,7,'میں'),(@tr,8,'کاٹتی'),(@tr,9,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'We'),(@tr,2,'drink'),(@tr,3,'warm'),(@tr,4,'milk'),(@tr,5,'before'),(@tr,6,'we'),(@tr,7,'go'),(@tr,8,'to'),(@tr,9,'bed.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ہم'),(@tr,2,'سونے'),(@tr,3,'سے'),(@tr,4,'پہلے'),(@tr,5,'گرم'),(@tr,6,'دودھ'),(@tr,7,'پیتے'),(@tr,8,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'The'),(@tr,2,'baker'),(@tr,3,'puts'),(@tr,4,'fresh'),(@tr,5,'bread'),(@tr,6,'on'),(@tr,7,'the'),(@tr,8,'shelf.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'نانبائی'),(@tr,2,'تازہ'),(@tr,3,'روٹی'),(@tr,4,'شیلف'),(@tr,5,'پر'),(@tr,6,'رکھتا'),(@tr,7,'ہے۔');
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='hard'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'Grandma'),(@tr,2,'stirred'),(@tr,3,'the'),(@tr,4,'hot'),(@tr,5,'vegetable'),(@tr,6,'soup'),(@tr,7,'with'),(@tr,8,'a'),(@tr,9,'wooden'),(@tr,10,'spoon.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',8);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'دادی'),(@tr,2,'نے'),(@tr,3,'لکڑی'),(@tr,4,'کے'),(@tr,5,'چمچ'),(@tr,6,'سے'),(@tr,7,'گرم'),(@tr,8,'سبزیوں'),(@tr,9,'کا'),(@tr,10,'سوپ'),(@tr,11,'ہلایا۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'My'),(@tr,2,'favourite'),(@tr,3,'breakfast'),(@tr,4,'is'),(@tr,5,'a'),(@tr,6,'golden'),(@tr,7,'pancake'),(@tr,8,'with'),(@tr,9,'strawberry'),(@tr,10,'jam.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'میرا'),(@tr,2,'پسندیدہ'),(@tr,3,'ناشتہ'),(@tr,4,'اسٹرابیری'),(@tr,5,'جیم'),(@tr,6,'کے'),(@tr,7,'ساتھ'),(@tr,8,'سنہری'),(@tr,9,'پینکیک'),(@tr,10,'ہے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',6);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'We'),(@tr,2,'should'),(@tr,3,'wash'),(@tr,4,'every'),(@tr,5,'vegetable'),(@tr,6,'carefully'),(@tr,7,'before'),(@tr,8,'we'),(@tr,9,'cook'),(@tr,10,'dinner.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',8);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'کھانا'),(@tr,2,'پکانے'),(@tr,3,'سے'),(@tr,4,'پہلے'),(@tr,5,'ہمیں'),(@tr,6,'ہر'),(@tr,7,'سبزی'),(@tr,8,'احتیاط'),(@tr,9,'سے'),(@tr,10,'دھونی'),(@tr,11,'چاہیے۔');
INSERT INTO reading_topics (code, title, icon, tint, sort_order) VALUES ('family','My Family','👨‍👩‍👧','yellowPale',3);
SET @topic := LAST_INSERT_ID();
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='easy'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'I'),(@tr,2,'love'),(@tr,3,'my'),(@tr,4,'mom.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'مجھے'),(@tr,2,'اپنی'),(@tr,3,'امی'),(@tr,4,'سے'),(@tr,5,'پیار'),(@tr,6,'ہے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'My'),(@tr,2,'dad'),(@tr,3,'can'),(@tr,4,'cook.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'میرے'),(@tr,2,'ابو'),(@tr,3,'کھانا'),(@tr,4,'پکا'),(@tr,5,'سکتے'),(@tr,6,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'We'),(@tr,2,'play'),(@tr,3,'with'),(@tr,4,'my'),(@tr,5,'sister.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ہم'),(@tr,2,'اپنی'),(@tr,3,'بہن'),(@tr,4,'کے'),(@tr,5,'ساتھ'),(@tr,6,'کھیلتے'),(@tr,7,'ہیں۔');
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='medium'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'My'),(@tr,2,'grandpa'),(@tr,3,'tells'),(@tr,4,'us'),(@tr,5,'funny'),(@tr,6,'stories'),(@tr,7,'at'),(@tr,8,'night.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',8);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'میرے'),(@tr,2,'دادا'),(@tr,3,'رات'),(@tr,4,'کو'),(@tr,5,'ہمیں'),(@tr,6,'مزے'),(@tr,7,'کی'),(@tr,8,'کہانیاں'),(@tr,9,'سناتے'),(@tr,10,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'My'),(@tr,2,'brother'),(@tr,3,'helps'),(@tr,4,'me'),(@tr,5,'tie'),(@tr,6,'my'),(@tr,7,'shoes.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'میرا'),(@tr,2,'بھائی'),(@tr,3,'جوتوں'),(@tr,4,'کے'),(@tr,5,'تسمے'),(@tr,6,'باندھنے'),(@tr,7,'میں'),(@tr,8,'میری'),(@tr,9,'مدد'),(@tr,10,'کرتا'),(@tr,11,'ہے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',6);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'Our'),(@tr,2,'whole'),(@tr,3,'family'),(@tr,4,'eats'),(@tr,5,'dinner'),(@tr,6,'together'),(@tr,7,'every'),(@tr,8,'evening.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',6);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ہمارا'),(@tr,2,'پورا'),(@tr,3,'خاندان'),(@tr,4,'ہر'),(@tr,5,'شام'),(@tr,6,'اکٹھے'),(@tr,7,'کھانا'),(@tr,8,'کھاتا'),(@tr,9,'ہے۔');
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='hard'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'On'),(@tr,2,'Sundays,'),(@tr,3,'my'),(@tr,4,'cousins'),(@tr,5,'visit'),(@tr,6,'us'),(@tr,7,'and'),(@tr,8,'we'),(@tr,9,'play'),(@tr,10,'hide'),(@tr,11,'and'),(@tr,12,'seek.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'اتوار'),(@tr,2,'کو'),(@tr,3,'میرے'),(@tr,4,'کزن'),(@tr,5,'ہم'),(@tr,6,'سے'),(@tr,7,'ملنے'),(@tr,8,'آتے'),(@tr,9,'ہیں'),(@tr,10,'اور'),(@tr,11,'ہم'),(@tr,12,'چھپن'),(@tr,13,'چھپائی'),(@tr,14,'کھیلتے'),(@tr,15,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'My'),(@tr,2,'grandmother'),(@tr,3,'knits'),(@tr,4,'colourful'),(@tr,5,'scarves'),(@tr,6,'for'),(@tr,7,'everyone'),(@tr,8,'in'),(@tr,9,'the'),(@tr,10,'family.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',11);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'میری'),(@tr,2,'دادی'),(@tr,3,'خاندان'),(@tr,4,'کے'),(@tr,5,'ہر'),(@tr,6,'فرد'),(@tr,7,'کے'),(@tr,8,'لیے'),(@tr,9,'رنگ'),(@tr,10,'برنگے'),(@tr,11,'مفلر'),(@tr,12,'بنتی'),(@tr,13,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',10);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'When'),(@tr,2,'I'),(@tr,3,'feel'),(@tr,4,'sad,'),(@tr,5,'my'),(@tr,6,'parents'),(@tr,7,'give'),(@tr,8,'me'),(@tr,9,'a'),(@tr,10,'gentle'),(@tr,11,'hug.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',11);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'جب'),(@tr,2,'مجھے'),(@tr,3,'اداسی'),(@tr,4,'محسوس'),(@tr,5,'ہوتی'),(@tr,6,'ہے'),(@tr,7,'تو'),(@tr,8,'میرے'),(@tr,9,'والدین'),(@tr,10,'مجھے'),(@tr,11,'نرمی'),(@tr,12,'سے'),(@tr,13,'گلے'),(@tr,14,'لگاتے'),(@tr,15,'ہیں۔');
INSERT INTO reading_topics (code, title, icon, tint, sort_order) VALUES ('weather','Weather','🌦️','purplePale',4);
SET @topic := LAST_INSERT_ID();
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='easy'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'The'),(@tr,2,'sun'),(@tr,3,'is'),(@tr,4,'hot.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',1);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'سورج'),(@tr,2,'گرم'),(@tr,3,'ہے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'I'),(@tr,2,'see'),(@tr,3,'a'),(@tr,4,'big'),(@tr,5,'cloud.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'مجھے'),(@tr,2,'ایک'),(@tr,3,'بڑا'),(@tr,4,'بادل'),(@tr,5,'نظر'),(@tr,6,'آتا'),(@tr,7,'ہے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'It'),(@tr,2,'is'),(@tr,3,'a'),(@tr,4,'rainy'),(@tr,5,'day.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'آج'),(@tr,2,'بارش'),(@tr,3,'کا'),(@tr,4,'دن'),(@tr,5,'ہے۔');
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='medium'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'We'),(@tr,2,'wear'),(@tr,3,'warm'),(@tr,4,'coats'),(@tr,5,'when'),(@tr,6,'the'),(@tr,7,'wind'),(@tr,8,'is'),(@tr,9,'cold.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',7);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'جب'),(@tr,2,'ہوا'),(@tr,3,'ٹھنڈی'),(@tr,4,'ہو'),(@tr,5,'تو'),(@tr,6,'ہم'),(@tr,7,'گرم'),(@tr,8,'کوٹ'),(@tr,9,'پہنتے'),(@tr,10,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'A'),(@tr,2,'bright'),(@tr,3,'rainbow'),(@tr,4,'appeared'),(@tr,5,'after'),(@tr,6,'the'),(@tr,7,'rain'),(@tr,8,'stopped.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',7);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'بارش'),(@tr,2,'رکنے'),(@tr,3,'کے'),(@tr,4,'بعد'),(@tr,5,'ایک'),(@tr,6,'روشن'),(@tr,7,'قوس'),(@tr,8,'قزح'),(@tr,9,'نکل'),(@tr,10,'آئی۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'The'),(@tr,2,'snowman'),(@tr,3,'melted'),(@tr,4,'in'),(@tr,5,'the'),(@tr,6,'warm'),(@tr,7,'afternoon'),(@tr,8,'sun.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',9);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'برف'),(@tr,2,'کا'),(@tr,3,'آدمی'),(@tr,4,'گرم'),(@tr,5,'دوپہر'),(@tr,6,'کی'),(@tr,7,'دھوپ'),(@tr,8,'میں'),(@tr,9,'پگھل'),(@tr,10,'گیا۔');
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='hard'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'Thunder'),(@tr,2,'rumbled'),(@tr,3,'loudly'),(@tr,4,'while'),(@tr,5,'lightning'),(@tr,6,'flashed'),(@tr,7,'across'),(@tr,8,'the'),(@tr,9,'dark'),(@tr,10,'sky.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'اندھیرے'),(@tr,2,'آسمان'),(@tr,3,'میں'),(@tr,4,'بجلی'),(@tr,5,'چمکی'),(@tr,6,'اور'),(@tr,7,'بادل'),(@tr,8,'زور'),(@tr,9,'سے'),(@tr,10,'گرجے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'In'),(@tr,2,'autumn,'),(@tr,3,'the'),(@tr,4,'colourful'),(@tr,5,'leaves'),(@tr,6,'fall'),(@tr,7,'gently'),(@tr,8,'from'),(@tr,9,'the'),(@tr,10,'tall'),(@tr,11,'trees.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'خزاں'),(@tr,2,'میں'),(@tr,3,'رنگ'),(@tr,4,'برنگے'),(@tr,5,'پتے'),(@tr,6,'اونچے'),(@tr,7,'درختوں'),(@tr,8,'سے'),(@tr,9,'آہستہ'),(@tr,10,'آہستہ'),(@tr,11,'گرتے'),(@tr,12,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'Because'),(@tr,2,'it'),(@tr,3,'was'),(@tr,4,'freezing'),(@tr,5,'outside,'),(@tr,6,'we'),(@tr,7,'stayed'),(@tr,8,'home'),(@tr,9,'and'),(@tr,10,'drank'),(@tr,11,'hot'),(@tr,12,'chocolate.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',3);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'باہر'),(@tr,2,'بہت'),(@tr,3,'ٹھنڈ'),(@tr,4,'تھی'),(@tr,5,'اس'),(@tr,6,'لیے'),(@tr,7,'ہم'),(@tr,8,'گھر'),(@tr,9,'پر'),(@tr,10,'رہے'),(@tr,11,'اور'),(@tr,12,'گرم'),(@tr,13,'چاکلیٹ'),(@tr,14,'پی۔');
INSERT INTO reading_topics (code, title, icon, tint, sort_order) VALUES ('school','At School','🎒','orangePale',5);
SET @topic := LAST_INSERT_ID();
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='easy'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'We'),(@tr,2,'read'),(@tr,3,'a'),(@tr,4,'book.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ہم'),(@tr,2,'کتاب'),(@tr,3,'پڑھتے'),(@tr,4,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'My'),(@tr,2,'bag'),(@tr,3,'is'),(@tr,4,'blue.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'میرا'),(@tr,2,'بستہ'),(@tr,3,'نیلا'),(@tr,4,'ہے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'The'),(@tr,2,'teacher'),(@tr,3,'says'),(@tr,4,'hello.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',1);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ٹیچر'),(@tr,2,'سلام'),(@tr,3,'کہتی'),(@tr,4,'ہیں۔');
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='medium'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',4);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'We'),(@tr,2,'draw'),(@tr,3,'a'),(@tr,4,'colourful'),(@tr,5,'picture'),(@tr,6,'with'),(@tr,7,'our'),(@tr,8,'crayons.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ہم'),(@tr,2,'اپنے'),(@tr,3,'کریونز'),(@tr,4,'سے'),(@tr,5,'رنگین'),(@tr,6,'تصویر'),(@tr,7,'بناتے'),(@tr,8,'ہیں۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',2);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'The'),(@tr,2,'class'),(@tr,3,'sings'),(@tr,4,'a'),(@tr,5,'happy'),(@tr,6,'song'),(@tr,7,'every'),(@tr,8,'morning.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',7);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'کلاس'),(@tr,2,'ہر'),(@tr,3,'صبح'),(@tr,4,'ایک'),(@tr,5,'خوشی'),(@tr,6,'کا'),(@tr,7,'گیت'),(@tr,8,'گاتی'),(@tr,9,'ہے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',5);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'At'),(@tr,2,'lunch'),(@tr,3,'time,'),(@tr,4,'we'),(@tr,5,'share'),(@tr,6,'our'),(@tr,7,'food'),(@tr,8,'with'),(@tr,9,'our'),(@tr,10,'friends.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',10);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'لنچ'),(@tr,2,'کے'),(@tr,3,'وقت'),(@tr,4,'ہم'),(@tr,5,'اپنے'),(@tr,6,'دوستوں'),(@tr,7,'کے'),(@tr,8,'ساتھ'),(@tr,9,'کھانا'),(@tr,10,'بانٹتے'),(@tr,11,'ہیں۔');
INSERT INTO topic_levels (topic_id, level_id) VALUES (@topic,(SELECT id FROM reading_levels WHERE code='hard'));
SET @tl := LAST_INSERT_ID();
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,1);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',7);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'Our'),(@tr,2,'teacher'),(@tr,3,'showed'),(@tr,4,'us'),(@tr,5,'how'),(@tr,6,'a'),(@tr,7,'caterpillar'),(@tr,8,'becomes'),(@tr,9,'a'),(@tr,10,'beautiful'),(@tr,11,'butterfly.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',7);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'ہماری'),(@tr,2,'ٹیچر'),(@tr,3,'نے'),(@tr,4,'ہمیں'),(@tr,5,'دکھایا'),(@tr,6,'کہ'),(@tr,7,'سنڈی'),(@tr,8,'کیسے'),(@tr,9,'خوبصورت'),(@tr,10,'تتلی'),(@tr,11,'بن'),(@tr,12,'جاتی'),(@tr,13,'ہے۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,2);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',6);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'During'),(@tr,2,'the'),(@tr,3,'science'),(@tr,4,'lesson,'),(@tr,5,'we'),(@tr,6,'measured'),(@tr,7,'the'),(@tr,8,'length'),(@tr,9,'of'),(@tr,10,'the'),(@tr,11,'classroom.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',11);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'سائنس'),(@tr,2,'کے'),(@tr,3,'سبق'),(@tr,4,'کے'),(@tr,5,'دوران'),(@tr,6,'ہم'),(@tr,7,'نے'),(@tr,8,'کلاس'),(@tr,9,'روم'),(@tr,10,'کی'),(@tr,11,'لمبائی'),(@tr,12,'ناپی۔');
INSERT INTO reading_sentences (topic_level_id, position) VALUES (@tl,3);
SET @sent := LAST_INSERT_ID();
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'en',7);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'After'),(@tr,2,'school,'),(@tr,3,'we'),(@tr,4,'always'),(@tr,5,'finish'),(@tr,6,'our'),(@tr,7,'homework'),(@tr,8,'before'),(@tr,9,'we'),(@tr,10,'play'),(@tr,11,'outside.');
INSERT INTO sentence_translations (sentence_id, language_code, focus_position) VALUES (@sent,'ur',11);
SET @tr := LAST_INSERT_ID();
INSERT INTO sentence_words (translation_id, position, word) VALUES (@tr,1,'اسکول'),(@tr,2,'کے'),(@tr,3,'بعد'),(@tr,4,'ہم'),(@tr,5,'باہر'),(@tr,6,'کھیلنے'),(@tr,7,'سے'),(@tr,8,'پہلے'),(@tr,9,'ہمیشہ'),(@tr,10,'اپنا'),(@tr,11,'ہوم'),(@tr,12,'ورک'),(@tr,13,'مکمل'),(@tr,14,'کرتے'),(@tr,15,'ہیں۔');
