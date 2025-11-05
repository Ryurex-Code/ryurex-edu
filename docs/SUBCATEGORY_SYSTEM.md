# Subcategory System Documentation

## 📊 Overview

Sistem **subcategory** adalah fitur untuk mengelompokkan kata berdasarkan tingkat kesulitan dalam setiap kategori.

### 🎯 Konsep:
- **Subcategory 1**: Kata-kata paling mudah / paling umum
- **Subcategory 2**: Kata-kata dengan kesulitan menengah
- **Subcategory 3+**: Kata-kata semakin sulit / jarang digunakan
- Setiap subcategory **maksimal 10 kata**

## 🗂️ Struktur Database

### Schema Update:
```sql
ALTER TABLE public.vocab_master 
ADD COLUMN subcategory smallint DEFAULT 1;

CREATE INDEX idx_vocab_subcategory 
ON public.vocab_master(category, subcategory);
```

### Data Example:
```sql
-- Category: emotion, Subcategory 1 (Common emotions)
('bahagia', 'happy', 'Adjective', 'emotion', 1),
('sedih', 'sad', 'Adjective', 'emotion', 1),
...

-- Category: emotion, Subcategory 2 (Less common emotions)
('gembira', 'joyful', 'Adjective', 'emotion', 2),
('melankolis', 'melancholic', 'Adjective', 'emotion', 2),
...
```

## 📦 Current Data Distribution

### All Categories (Subcategory 1 only):
| Category | Subcategory | Words | Difficulty |
|----------|-------------|-------|------------|
| emotion  | 1           | 10    | Easy (common emotions) |
| family   | 1           | 10    | Easy (immediate family) |
| food     | 1           | 10    | Easy (basic staples) |
| action   | 1           | 10    | Easy (daily activities) |
| nature   | 1           | 10    | Easy (common elements) |
| animal   | 1           | 10    | Easy (common/domestic) |
| color    | 1           | 10    | Easy (primary colors) |
| body     | 1           | 10    | Easy (main body parts) |
| time     | 1           | 10    | Easy (basic time units) |
| place    | 1           | 10    | Easy (common places) |
| object   | 1           | 10    | Easy (common objects) |

**Total**: 110 words (11 categories × 10 words each)

## 🚀 API Usage

### Get Words by Category & Subcategory:

#### Example 1: All words in "emotion" category
```
GET /api/getBatch?category=emotion
```
Returns: All emotion words (subcategory 1, 2, 3...)

#### Example 2: Only subcategory 1 in "emotion"
```
GET /api/getBatch?category=emotion&subcategory=1
```
Returns: Only common emotion words (subcategory 1)

#### Example 3: Only subcategory 2 across all categories
```
GET /api/getBatch?subcategory=2
```
Returns: Medium difficulty words from all categories

### Query Order:
1. **Priority**: Review words (next_due ≤ today)
2. **New words**: Ordered by `subcategory` ASC, then `id` ASC
   - This ensures users learn easier words first

## 🎮 Game Flow

### Progressive Learning:
1. User starts with subcategory 1 (easiest)
2. After mastering 80%+ of subcategory 1, unlock subcategory 2
3. Continue progression through subcategories

### Example URL:
- `/vocab?category=emotion&subcategory=1` → Common emotions
- `/vocab?category=emotion&subcategory=2` → Advanced emotions

## 📝 Adding New Words

### Rule: Max 10 words per subcategory

#### Example: Adding more "emotion" words

**Subcategory 2 (Medium difficulty):**
```sql
INSERT INTO public.vocab_master (indo, english, class, category, subcategory) VALUES
('gembira', 'joyful', 'Adjective', 'emotion', 2),
('murung', 'gloomy', 'Adjective', 'emotion', 2),
('gelisah', 'restless', 'Adjective', 'emotion', 2),
('puas', 'satisfied', 'Adjective', 'emotion', 2),
('kesal', 'annoyed', 'Adjective', 'emotion', 2),
('terkejut', 'surprised', 'Adjective', 'emotion', 2),
('tenang', 'calm', 'Adjective', 'emotion', 2),
('bingung', 'confused', 'Adjective', 'emotion', 2),
('optimis', 'optimistic', 'Adjective', 'emotion', 2),
('pesimis', 'pessimistic', 'Adjective', 'emotion', 2);
```

**Subcategory 3 (Hard/rare):**
```sql
INSERT INTO public.vocab_master (indo, english, class, category, subcategory) VALUES
('euforia', 'euphoric', 'Adjective', 'emotion', 3),
('melankolis', 'melancholic', 'Adjective', 'emotion', 3),
('apatis', 'apathetic', 'Adjective', 'emotion', 3),
...
```

## ✅ Migration Steps

### Step 1: Run Migration
```sql
-- Run: supabase/add_subcategory_column.sql
```

### Step 2: Clear Old Data
```sql
DELETE FROM public.vocab_master;
DELETE FROM public.user_vocab_progress;
```

### Step 3: Import New Seed Data
```sql
-- Run: supabase/seed_vocab_data.sql
```

### Step 4: Verify
```sql
-- Check subcategory distribution
SELECT category, subcategory, COUNT(*) as word_count
FROM public.vocab_master
GROUP BY category, subcategory
ORDER BY category, subcategory;
```

Expected output:
```
category | subcategory | word_count
---------|-------------|------------
action   | 1           | 10
animal   | 1           | 10
body     | 1           | 10
color    | 1           | 10
emotion  | 1           | 10
family   | 1           | 10
food     | 1           | 10
nature   | 1           | 10
object   | 1           | 10
place    | 1           | 10
time     | 1           | 10
```

## 🎨 Frontend Integration

### TypeScript Interface:
```typescript
interface VocabWord {
  vocab_id: number;
  indo: string;
  english: string;
  class: string;
  category: string;
  subcategory: number; // ✅ Added
  fluency: number;
}
```

### Display Subcategory Badge:
```tsx
<div className="flex items-center gap-2">
  {/* Class Badge */}
  <span className="px-3 py-1 bg-[#fee801] text-black text-xs font-semibold rounded-full">
    {word.class}
  </span>
  
  {/* Category Badge */}
  <span className="px-3 py-1 bg-[#7c5cff] text-white text-xs rounded-full">
    {word.category}
  </span>
  
  {/* Subcategory Badge */}
  <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
    Level {word.subcategory}
  </span>
</div>
```

## 🔮 Future Enhancements

### Planned Features:
1. **Auto-progression**: Unlock next subcategory after mastering current
2. **Dashboard Stats**: Show progress per subcategory
3. **Difficulty Indicator**: Visual difficulty meter
4. **Smart Recommendations**: Suggest which subcategory to practice

### Example Dashboard Card:
```
┌────────────────────────┐
│ Emotion Category       │
│                        │
│ Level 1: ████████ 80%  │ ← Mastered
│ Level 2: ████░░░░ 40%  │ ← In Progress
│ Level 3: ░░░░░░░░  0%  │ ← Locked
│                        │
│ [Continue Level 2]     │
└────────────────────────┘
```

## 📊 Analytics Queries

### Most practiced subcategories:
```sql
SELECT 
  vm.category,
  vm.subcategory,
  COUNT(DISTINCT uvp.user_id) as users_practicing,
  AVG(uvp.fluency) as avg_fluency
FROM user_vocab_progress uvp
JOIN vocab_master vm ON uvp.vocab_id = vm.id
GROUP BY vm.category, vm.subcategory
ORDER BY users_practicing DESC;
```

### User progress per subcategory:
```sql
SELECT 
  vm.category,
  vm.subcategory,
  COUNT(*) as words_learned,
  AVG(uvp.fluency) as avg_fluency
FROM user_vocab_progress uvp
JOIN vocab_master vm ON uvp.vocab_id = vm.id
WHERE uvp.user_id = 'USER_UUID_HERE'
GROUP BY vm.category, vm.subcategory
ORDER BY vm.category, vm.subcategory;
```

---

## 🚀 Status

✅ Database schema updated with `subcategory` column  
✅ Migration file created  
✅ Seed data updated (all words set to subcategory 1)  
✅ API getBatch supports `subcategory` filter  
✅ TypeScript interface updated  
✅ Index created for performance  
⏳ Frontend UI for subcategory selection (future)  
⏳ Progressive unlock system (future)  

**Ready to deploy!** 🎉
