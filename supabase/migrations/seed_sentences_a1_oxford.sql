-- ============================================
-- Seed Sentences for A1 Oxford Category
-- ============================================

-- 1. a (article)
UPDATE public.vocab_master 
SET 
  sentence_english = 'I have a cat',
  sentence_indo = 'Saya memiliki sebuah kucing'
WHERE english = 'a' AND category = 'A1 Oxford' AND sentence_english IS NULL;

-- 2. about (preposition)
UPDATE public.vocab_master 
SET 
  sentence_english = 'Tell me about your day',
  sentence_indo = 'Ceritakan tentang hari Anda'
WHERE english = 'about' AND category = 'A1 Oxford' AND sentence_english IS NULL;

-- 3. above (preposition)
UPDATE public.vocab_master 
SET 
  sentence_english = 'The picture is above the door',
  sentence_indo = 'Gambar itu ada di atas pintu'
WHERE english = 'above' AND category = 'A1 Oxford' AND sentence_english IS NULL;

-- 4. across (preposition)
UPDATE public.vocab_master 
SET 
  sentence_english = 'We walked across the bridge',
  sentence_indo = 'Kami berjalan melintasi jembatan'
WHERE english = 'across' AND category = 'A1 Oxford' AND sentence_english IS NULL;

-- 5. action (noun)
UPDATE public.vocab_master 
SET 
  sentence_english = 'Action is important in life',
  sentence_indo = 'Aksi sangat penting dalam hidup'
WHERE english = 'action' AND category = 'A1 Oxford' AND sentence_english IS NULL;

-- 6. activity (noun)
UPDATE public.vocab_master 
SET 
  sentence_english = 'Swimming is a fun activity',
  sentence_indo = 'Berenang adalah aktivitas yang menyenangkan'
WHERE english = 'activity' AND category = 'A1 Oxford' AND sentence_english IS NULL;

-- 7. actor (noun)
UPDATE public.vocab_master 
SET 
  sentence_english = 'The actor performed brilliantly',
  sentence_indo = 'Aktor itu tampil dengan cemerlang'
WHERE english = 'actor' AND category = 'A1 Oxford' AND sentence_english IS NULL;

-- 8. actress (noun)
UPDATE public.vocab_master 
SET 
  sentence_english = 'The actress won an award',
  sentence_indo = 'Aktris itu memenangkan penghargaan'
WHERE english = 'actress' AND category = 'A1 Oxford' AND sentence_english IS NULL;

-- 9. add (verb)
UPDATE public.vocab_master 
SET 
  sentence_english = 'Please add sugar to the coffee',
  sentence_indo = 'Tolong menambahkan gula ke kopi'
WHERE english = 'add' AND category = 'A1 Oxford' AND sentence_english IS NULL;

-- 10. address (noun)
UPDATE public.vocab_master 
SET 
  sentence_english = 'What is your home address',
  sentence_indo = 'Berapa alamat rumah Anda'
WHERE english = 'address' AND category = 'A1 Oxford' AND sentence_english IS NULL;
