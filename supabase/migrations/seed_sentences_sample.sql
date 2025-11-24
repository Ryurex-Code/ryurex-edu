-- ============================================
-- Seed Sentence Data for Existing Vocabulary
-- Add sentences to vocab_master records
-- ============================================

-- ============================================
-- ANIMALS Category Sentences
-- ============================================

UPDATE vocab_master 
SET 
  sentence_english = 'The cat sat on the mat',
  sentence_indo = 'Kucing itu duduk di atas tikar'
WHERE english = 'cat' AND category = 'animal' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'A dog is running in the park',
  sentence_indo = 'Seekor anjing sedang berlari di taman'
WHERE english = 'dog' AND category = 'animal' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'The bird is flying in the sky',
  sentence_indo = 'Burung itu sedang terbang di langit'
WHERE english = 'bird' AND category = 'animal' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'The fish swims in the water',
  sentence_indo = 'Ikan itu berenang di air'
WHERE english = 'fish' AND category = 'animal' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'The elephant is very big',
  sentence_indo = 'Gajah itu sangat besar'
WHERE english = 'elephant' AND category = 'animal' AND sentence_english IS NULL;

-- ============================================
-- FOOD Category Sentences
-- ============================================

UPDATE vocab_master 
SET 
  sentence_english = 'I like to eat apple for breakfast',
  sentence_indo = 'Saya suka makan apel untuk sarapan'
WHERE english = 'apple' AND category = 'food' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'She is drinking a cup of coffee',
  sentence_indo = 'Dia sedang minum secangkir kopi'
WHERE english = 'coffee' AND category = 'food' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'I eat bread with butter every morning',
  sentence_indo = 'Saya makan roti dengan mentega setiap pagi'
WHERE english = 'bread' AND category = 'food' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'Do you like eating rice',
  sentence_indo = 'Apakah kamu suka makan nasi'
WHERE english = 'rice' AND category = 'food' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'This milk is cold and fresh',
  sentence_indo = 'Susu ini dingin dan segar'
WHERE english = 'milk' AND category = 'food' AND sentence_english IS NULL;

-- ============================================
-- COLORS Category Sentences
-- ============================================

UPDATE vocab_master 
SET 
  sentence_english = 'The sky is blue',
  sentence_indo = 'Langit itu biru'
WHERE english = 'blue' AND category = 'color' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'I like the red color',
  sentence_indo = 'Saya suka warna merah'
WHERE english = 'red' AND category = 'color' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'The grass is green',
  sentence_indo = 'Rumput itu hijau'
WHERE english = 'green' AND category = 'color' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'The sun is yellow',
  sentence_indo = 'Matahari itu kuning'
WHERE english = 'yellow' AND category = 'color' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'The night is black',
  sentence_indo = 'Malam itu hitam'
WHERE english = 'black' AND category = 'color' AND sentence_english IS NULL;

-- ============================================
-- FAMILY Category Sentences
-- ============================================

UPDATE vocab_master 
SET 
  sentence_english = 'My mother is cooking in the kitchen',
  sentence_indo = 'Ibu saya sedang memasak di dapur'
WHERE english = 'mother' AND category = 'family' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'My father works in an office',
  sentence_indo = 'Ayah saya bekerja di kantor'
WHERE english = 'father' AND category = 'family' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'My sister is studying at school',
  sentence_indo = 'Kakak perempuan saya sedang belajar di sekolah'
WHERE english = 'sister' AND category = 'family' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'My brother plays football every weekend',
  sentence_indo = 'Kakak laki-laki saya bermain sepak bola setiap akhir pekan'
WHERE english = 'brother' AND category = 'family' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'My grandmother tells me stories',
  sentence_indo = 'Nenek saya menceritakan cerita kepada saya'
WHERE english = 'grandmother' AND category = 'family' AND sentence_english IS NULL;

-- ============================================
-- BODY PARTS Category Sentences
-- ============================================

UPDATE vocab_master 
SET 
  sentence_english = 'I see you with my eyes',
  sentence_indo = 'Saya melihat Anda dengan mata saya'
WHERE english = 'eye' AND category = 'body_parts' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'She has a beautiful smile',
  sentence_indo = 'Dia memiliki senyuman yang indah'
WHERE english = 'mouth' AND category = 'body_parts' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'He walks with his legs',
  sentence_indo = 'Dia berjalan dengan kakinya'
WHERE english = 'leg' AND category = 'body_parts' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'I use my hands to write',
  sentence_indo = 'Saya menggunakan tangan saya untuk menulis'
WHERE english = 'hand' AND category = 'body_parts' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'I hear sound with my ears',
  sentence_indo = 'Saya mendengar suara dengan telinga saya'
WHERE english = 'ear' AND category = 'body_parts' AND sentence_english IS NULL;

-- ============================================
-- SCHOOL Category Sentences
-- ============================================

UPDATE vocab_master 
SET 
  sentence_english = 'I go to school every day',
  sentence_indo = 'Saya pergi ke sekolah setiap hari'
WHERE english = 'school' AND category = 'school' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'The teacher is teaching math',
  sentence_indo = 'Guru sedang mengajar matematika'
WHERE english = 'teacher' AND category = 'school' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'I study hard to get good grades',
  sentence_indo = 'Saya belajar keras untuk mendapatkan nilai bagus'
WHERE english = 'study' AND category = 'school' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'I write my homework in a book',
  sentence_indo = 'Saya menulis pekerjaan rumah saya dalam buku'
WHERE english = 'book' AND category = 'school' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'We sit at desks in the classroom',
  sentence_indo = 'Kami duduk di meja di ruang kelas'
WHERE english = 'desk' AND category = 'school' AND sentence_english IS NULL;

-- ============================================
-- SPORTS Category Sentences
-- ============================================

UPDATE vocab_master 
SET 
  sentence_english = 'I play football with my friends',
  sentence_indo = 'Saya bermain sepak bola dengan teman-teman saya'
WHERE english = 'football' AND category = 'sports' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'Basketball is an exciting sport',
  sentence_indo = 'Bola basket adalah olahraga yang menyenangkan'
WHERE english = 'basketball' AND category = 'sports' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'I enjoy swimming in the pool',
  sentence_indo = 'Saya menikmati berenang di kolam'
WHERE english = 'swimming' AND category = 'sports' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'Tennis is played with a racket',
  sentence_indo = 'Tenis dimainkan dengan raket'
WHERE english = 'tennis' AND category = 'sports' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'I run in the morning for exercise',
  sentence_indo = 'Saya lari di pagi hari untuk olahraga'
WHERE english = 'running' AND category = 'sports' AND sentence_english IS NULL;

-- ============================================
-- CLOTHING Category Sentences
-- ============================================

UPDATE vocab_master 
SET 
  sentence_english = 'I wear a shirt to work',
  sentence_indo = 'Saya memakai kemeja ke kantor'
WHERE english = 'shirt' AND category = 'clothing' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'She wore a beautiful dress to the party',
  sentence_indo = 'Dia mengenakan gaun cantik ke pesta'
WHERE english = 'dress' AND category = 'clothing' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'I put on my shoes before going out',
  sentence_indo = 'Saya mengenakan sepatu saya sebelum pergi'
WHERE english = 'shoe' AND category = 'clothing' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'He wears pants to school',
  sentence_indo = 'Dia memakai celana ke sekolah'
WHERE english = 'pants' AND category = 'clothing' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'I wear a hat in sunny weather',
  sentence_indo = 'Saya memakai topi saat cuaca cerah'
WHERE english = 'hat' AND category = 'clothing' AND sentence_english IS NULL;

-- ============================================
-- WEATHER Category Sentences
-- ============================================

UPDATE vocab_master 
SET 
  sentence_english = 'It is raining outside',
  sentence_indo = 'Hujan di luar'
WHERE english = 'rain' AND category = 'weather' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'The sun is shining brightly',
  sentence_indo = 'Matahari bersinar terang'
WHERE english = 'sun' AND category = 'weather' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'It is very cold in winter',
  sentence_indo = 'Sangat dingin di musim dingin'
WHERE english = 'cold' AND category = 'weather' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'The wind is blowing hard',
  sentence_indo = 'Angin sedang bertiup kuat'
WHERE english = 'wind' AND category = 'weather' AND sentence_english IS NULL;

UPDATE vocab_master 
SET 
  sentence_english = 'There are white clouds in the sky',
  sentence_indo = 'Ada awan putih di langit'
WHERE english = 'cloud' AND category = 'weather' AND sentence_english IS NULL;

-- ============================================
-- SUMMARY
-- ============================================
-- This script adds example sentences to existing vocabulary words
-- Each UPDATE statement:
-- 1. Targets words that don't have sentences yet (sentence_english IS NULL)
-- 2. Pairs English sentence with Indonesian translation
-- 3. Uses WHERE clause to match specific word + category

-- To add more sentences:
-- 1. Find the word in vocab_master
-- 2. Create a sentence using the word
-- 3. Create Indonesian translation
-- 4. Use UPDATE statement following the pattern above

-- Tips for good sentences:
-- - Use natural, everyday language
-- - Include the vocabulary word naturally in context
-- - Keep sentences simple and clear
-- - Provide accurate Indonesian translations
-- - Use varied sentence structures
