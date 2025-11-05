-- ============================================
-- Seed Data: vocab_master
-- Indonesian-English Vocabulary Database
-- Updated: Added subcategory column
-- Subcategory: Difficulty level (1=easiest/common, higher=harder/rare)
-- Each subcategory contains max 10 words per category
-- ============================================

INSERT INTO public.vocab_master (indo, english, class, category, subcategory) VALUES
-- Emotions (Perasaan) - Subcategory 1 (Common emotions)
('bahagia', 'happy', 'Adjective', 'emotion', 1),
('sedih', 'sad', 'Adjective', 'emotion', 1),
('marah', 'angry', 'Adjective', 'emotion', 1),
('takut', 'afraid', 'Adjective', 'emotion', 1),
('cemas', 'anxious', 'Adjective', 'emotion', 1),
('senang', 'glad', 'Adjective', 'emotion', 1),
('kecewa', 'disappointed', 'Adjective', 'emotion', 1),
('bangga', 'proud', 'Adjective', 'emotion', 1),
('malu', 'embarrassed', 'Adjective', 'emotion', 1),
('bosan', 'bored', 'Adjective', 'emotion', 1),


-- Family (Keluarga) - Subcategory 1 (Immediate family)
('ayah', 'father', 'Noun', 'family', 1),
('ibu', 'mother', 'Noun', 'family', 1),
('kakak', 'older sibling', 'Noun', 'family', 1),
('adik', 'younger sibling', 'Noun', 'family', 1),
('anak', 'child', 'Noun', 'family', 1),
('cucu', 'grandchild', 'Noun', 'family', 1),
('nenek', 'grandmother', 'Noun', 'family', 1),
('kakek', 'grandfather', 'Noun', 'family', 1),
('paman', 'uncle', 'Noun', 'family', 1),
('bibi', 'aunt', 'Noun', 'family', 1),

-- Food (Makanan) - Subcategory 1 (Basic staples)
('nasi', 'rice', 'Noun', 'food', 1),
('roti', 'bread', 'Noun', 'food', 1),
('ayam', 'chicken', 'Noun', 'food', 1),
('ikan', 'fish', 'Noun', 'food', 1),
('sayur', 'vegetable', 'Noun', 'food', 1),
('buah', 'fruit', 'Noun', 'food', 1),
('air', 'water', 'Noun', 'food', 1),
('susu', 'milk', 'Noun', 'food', 1),
('kopi', 'coffee', 'Noun', 'food', 1),
('teh', 'tea', 'Noun', 'food', 1),

-- Actions (Tindakan) - Subcategory 1 (Daily activities)
('makan', 'eat', 'Verb', 'action', 1),
('minum', 'drink', 'Verb', 'action', 1),
('tidur', 'sleep', 'Verb', 'action', 1),
('bangun', 'wake up', 'Verb', 'action', 1),
('berjalan', 'walk', 'Verb', 'action', 1),
('berlari', 'run', 'Verb', 'action', 1),
('membaca', 'read', 'Verb', 'action', 1),
('menulis', 'write', 'Verb', 'action', 1),
('berbicara', 'speak', 'Verb', 'action', 1),
('mendengar', 'listen', 'Verb', 'action', 1),

-- Nature (Alam) - Subcategory 1 (Common natural elements)
('matahari', 'sun', 'Noun', 'nature', 1),
('bulan', 'moon', 'Noun', 'nature', 1),
('bintang', 'star', 'Noun', 'nature', 1),
('langit', 'sky', 'Noun', 'nature', 1),
('awan', 'cloud', 'Noun', 'nature', 1),
('hujan', 'rain', 'Noun', 'nature', 1),
('angin', 'wind', 'Noun', 'nature', 1),
('pohon', 'tree', 'Noun', 'nature', 1),
('bunga', 'flower', 'Noun', 'nature', 1),
('rumput', 'grass', 'Noun', 'nature', 1),

-- Animals (Hewan) - Subcategory 1 (Common/domestic animals)
('kucing', 'cat', 'Noun', 'animal', 1),
('anjing', 'dog', 'Noun', 'animal', 1),
('burung', 'bird', 'Noun', 'animal', 1),
('gajah', 'elephant', 'Noun', 'animal', 1),
('singa', 'lion', 'Noun', 'animal', 1),
('harimau', 'tiger', 'Noun', 'animal', 1),
('monyet', 'monkey', 'Noun', 'animal', 1),
('ular', 'snake', 'Noun', 'animal', 1),
('kuda', 'horse', 'Noun', 'animal', 1),
('kambing', 'goat', 'Noun', 'animal', 1),

-- Colors (Warna) - Subcategory 1 (Primary & common colors)
('merah', 'red', 'Adjective', 'color', 1),
('biru', 'blue', 'Adjective', 'color', 1),
('hijau', 'green', 'Adjective', 'color', 1),
('kuning', 'yellow', 'Adjective', 'color', 1),
('hitam', 'black', 'Adjective', 'color', 1),
('putih', 'white', 'Adjective', 'color', 1),
('abu-abu', 'gray', 'Adjective', 'color', 1),
('coklat', 'brown', 'Adjective', 'color', 1),
('ungu', 'purple', 'Adjective', 'color', 1),
('oranye', 'orange', 'Adjective', 'color', 1),

-- Body Parts (Bagian Tubuh) - Subcategory 1 (Main body parts)
('kepala', 'head', 'Noun', 'body', 1),
('mata', 'eye', 'Noun', 'body', 1),
('telinga', 'ear', 'Noun', 'body', 1),
('hidung', 'nose', 'Noun', 'body', 1),
('mulut', 'mouth', 'Noun', 'body', 1),
('tangan', 'hand', 'Noun', 'body', 1),
('kaki', 'foot', 'Noun', 'body', 1),
('jari', 'finger', 'Noun', 'body', 1),
('rambut', 'hair', 'Noun', 'body', 1),
('gigi', 'tooth', 'Noun', 'body', 1),

-- Time (Waktu) - Subcategory 1 (Basic time units)
('hari', 'day', 'Noun', 'time', 1),
('malam', 'night', 'Noun', 'time', 1),
('pagi', 'morning', 'Noun', 'time', 1),
('siang', 'noon', 'Noun', 'time', 1),
('sore', 'afternoon', 'Noun', 'time', 1),
('minggu', 'week', 'Noun', 'time', 1),
('bulan', 'month', 'Noun', 'time', 1),
('tahun', 'year', 'Noun', 'time', 1),
('jam', 'hour', 'Noun', 'time', 1),
('menit', 'minute', 'Noun', 'time', 1),

-- Places (Tempat) - Subcategory 1 (Common places)
('rumah', 'house', 'Noun', 'place', 1),
('sekolah', 'school', 'Noun', 'place', 1),
('kantor', 'office', 'Noun', 'place', 1),
('pasar', 'market', 'Noun', 'place', 1),
('toko', 'store', 'Noun', 'place', 1),
('rumah sakit', 'hospital', 'Noun', 'place', 1),
('taman', 'park', 'Noun', 'place', 1),
('pantai', 'beach', 'Noun', 'place', 1),
('gunung', 'mountain', 'Noun', 'place', 1),
('kota', 'city', 'Noun', 'place', 1),

-- Objects (Benda) - Subcategory 1 (Common objects)
('buku', 'book', 'Noun', 'object', 1),
('pensil', 'pencil', 'Noun', 'object', 1),
('pulpen', 'pen', 'Noun', 'object', 1),
('kertas', 'paper', 'Noun', 'object', 1),
('meja', 'table', 'Noun', 'object', 1),
('kursi', 'chair', 'Noun', 'object', 1),
('pintu', 'door', 'Noun', 'object', 1),
('jendela', 'window', 'Noun', 'object', 1),
('tas', 'bag', 'Noun', 'object', 1),
('sepatu', 'shoes', 'Noun', 'object', 1);

-- ============================================
-- Verification Query
-- ============================================
-- Run this to check if data was inserted:
-- SELECT category, class, subcategory, COUNT(*) as count 
-- FROM public.vocab_master 
-- GROUP BY category, class, subcategory
-- ORDER BY category, subcategory;

-- Check class distribution:
-- SELECT class, COUNT(*) as count 
-- FROM public.vocab_master 
-- GROUP BY class 
-- ORDER BY count DESC;
-- Expected: Noun (~90), Verb (~10), Adjective (~20)

-- Check subcategory distribution per category:
-- SELECT category, subcategory, COUNT(*) as word_count
-- FROM public.vocab_master
-- GROUP BY category, subcategory
-- ORDER BY category, subcategory;
-- Expected: Each category has 10 words in subcategory 1

-- Total words:
-- SELECT COUNT(*) as total_words FROM public.vocab_master;
-- Expected: 110 words (11 categories × 10 words each)
