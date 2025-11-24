-- ============================================
-- Query: Print/Display Words by Category and Subcategory
-- ============================================

-- ============================================
-- Example 1: Show all words in a specific category
-- ============================================
SELECT 
  id,
  indo,
  english,
  class,
  category,
  subcategory,
  sentence_english,
  sentence_indo
FROM public.vocab_master
WHERE category = 'A1 Oxford'
ORDER BY subcategory, id;

-- ============================================
-- Example 2: Show words by category AND subcategory
-- ============================================
SELECT 
  id,
  indo,
  english,
  class,
  category,
  subcategory,
  sentence_english,
  sentence_indo
FROM public.vocab_master
WHERE category = 'A1 Oxford' 
  AND subcategory = 1
ORDER BY id;

-- ============================================
-- Example 3: Show only words WITHOUT sentences in a category
-- ============================================
SELECT 
  id,
  indo,
  english,
  class,
  category,
  subcategory,
  sentence_english,
  sentence_indo
FROM public.vocab_master
WHERE category = 'A1 Oxford' 
  AND sentence_english IS NULL
ORDER BY subcategory, id;

-- ============================================
-- Example 4: Show words WITH sentences in a category
-- ============================================
SELECT 
  id,
  indo,
  english,
  class,
  category,
  subcategory,
  sentence_english,
  sentence_indo
FROM public.vocab_master
WHERE category = 'A1 Oxford' 
  AND sentence_english IS NOT NULL
ORDER BY subcategory, id;

-- ============================================
-- Example 5: Count words by category and subcategory
-- ============================================
SELECT 
  category,
  subcategory,
  COUNT(*) as total_words,
  COUNT(CASE WHEN sentence_english IS NOT NULL THEN 1 END) as words_with_sentences,
  COUNT(CASE WHEN sentence_english IS NULL THEN 1 END) as words_without_sentences
FROM public.vocab_master
WHERE category = 'A1 Oxford'
GROUP BY category, subcategory
ORDER BY subcategory;

-- ============================================
-- Example 6: Show all categories and subcategories available
-- ============================================
SELECT DISTINCT
  category,
  subcategory,
  COUNT(*) as word_count
FROM public.vocab_master
GROUP BY category, subcategory
ORDER BY category, subcategory;

-- ============================================
-- Example 7: Show specific columns in a formatted way
-- ============================================
SELECT 
  id,
  english,
  indo,
  subcategory as "Part",
  CASE 
    WHEN sentence_english IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as "Has Sentence"
FROM public.vocab_master
WHERE category = 'A1 Oxford'
ORDER BY subcategory, id;

-- ============================================
-- Example 8: Search by partial word
-- ============================================
SELECT 
  id,
  english,
  indo,
  category,
  subcategory
FROM public.vocab_master
WHERE category = 'A1 Oxford'
  AND english ILIKE '%add%'  -- case-insensitive search
ORDER BY id;

-- ============================================
-- USAGE TIPS
-- ============================================
-- 1. Replace 'A1 Oxford' with your category name
-- 2. Replace subcategory number (1, 2, 3, etc.) as needed
-- 3. ILIKE is case-insensitive (good for searching)
-- 4. IS NULL / IS NOT NULL check for empty fields
-- 5. Use ORDER BY to sort results
-- 6. Use LIMIT to restrict number of results

-- Example: Get first 10 words from A1 Oxford Part 1
-- SELECT * FROM public.vocab_master
-- WHERE category = 'A1 Oxford' AND subcategory = 1
-- LIMIT 10;

-- Example: Count how many words don't have sentences
-- SELECT COUNT(*) as words_without_sentences
-- FROM public.vocab_master
-- WHERE category = 'A1 Oxford' AND sentence_english IS NULL;
