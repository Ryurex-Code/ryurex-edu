# Category Menu System - Implementation Guide

## 📋 Overview

Sistem **Category Menu** adalah halaman perantara antara Dashboard dan Vocab Game yang memungkinkan user memilih subcategory (Part) sebelum memulai game.

## 🎯 User Flow

### Before (Old Flow):
```
Dashboard → Click Category Card → Vocab Game (all words in category)
```

### After (New Flow):
```
Dashboard → Click Category Card → Category Menu → Select Part → Click Play → Vocab Game (filtered by category & subcategory)
```

## 🎨 UI Design

### Layout Structure:

```
┌─────────────────────────────────────────────────────────┐
│ Navbar: [← Back] [Theme Toggle] [Logout]                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────┐    ┌──────────────────────┐  │
│  │ Choose a Part        │    │  Category Card       │  │
│  │                      │    │  ┌───────────────┐   │  │
│  │ ┌─────────────────┐  │    │  │   [Image]     │   │  │
│  │ │  Part 1          │  │    │  │               │   │  │
│  │ │  10 words        │  │    │  └───────────────┘   │  │
│  │ │  Subcategory 1   │  │    │  Emotion             │  │
│  │ └─────────────────┘  │    │  110 words total     │  │
│  │                      │    │  1 part available    │  │
│  │ ┌─────────────────┐  │    │                      │  │
│  │ │  Part 2          │  │    │ ┌──────────────────┐│  │
│  │ │  10 words        │  │    │ │ Play Vocab Mode  ││  │
│  │ │  Subcategory 2   │  │    │ └──────────────────┘│  │
│  │ └─────────────────┘  │    │ ┌──────────────────┐│  │
│  │                      │    │ │ Play Sentence    ││  │
│  │ ...                  │    │ │ Mode             ││  │
│  │                      │    │ └──────────────────┘│  │
│  └──────────────────────┘    └──────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Design Specifications:

#### Part Cards (Left Side):
- **Default State:**
  - Background: `bg-card`
  - Border: `border-theme` (2px)
  - Text: `text-foreground`
  - Hover: `border-[#fee801]`

- **Selected State:**
  - Background: `bg-[#fee801]` (yellow/kuning)
  - Border: `border-[#fee801]`
  - Text: `text-black` (hitam)
  - Scale: `scale-105`
  - Checkmark icon (black circle, yellow check)

#### Category Card (Right Side):
- Image/Icon area (square, gradient placeholder)
- Category name (capitalized)
- Total words count
- Parts available count

#### Play Buttons:
1. **Play Vocab Mode**
   - Background: `bg-[#fee801]` (yellow/kuning)
   - Text: `text-black` (hitam)
   - Rounded: `rounded-2xl`
   - Disabled when no part selected

2. **Play Sentence Mode**
   - Background: `bg-[#7c5cff]` (purple/ungu)
   - Text: `text-white` (putih)
   - Rounded: `rounded-2xl`
   - "Coming Soon" badge
   - Disabled when no part selected

## 📁 File Structure

```
app/
├── api/
│   └── subcategories/
│       └── route.ts                    # API to get subcategories
├── category-menu/
│   └── [category]/
│       └── page.tsx                    # Category menu page
├── vocab/
│   └── page.tsx                        # Updated with subcategory support
└── dashboard/
    └── page.tsx                        # Updated redirect
```

## 🔧 Implementation Details

### 1. API Endpoint: `/api/subcategories`

**File:** `app/api/subcategories/route.ts`

**Query Params:**
- `category` (required): Category name

**Response:**
```json
{
  "success": true,
  "category": "emotion",
  "total_words": 10,
  "subcategories": [
    { "subcategory": 1, "word_count": 10 }
  ],
  "count": 1
}
```

**Logic:**
1. Validate `category` parameter
2. Query `vocab_master` table filtered by category
3. Group by `subcategory` and count words
4. Return formatted array

### 2. Category Menu Page

**File:** `app/category-menu/[category]/page.tsx`

**Features:**
- Dynamic route with category slug
- Fetch subcategories on mount
- State management for selected subcategory
- Redirect to vocab with category & subcategory params

**State:**
```typescript
const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
const [loading, setLoading] = useState(true);
```

**Navigation:**
- Back button → Dashboard
- Play Vocab → `/vocab?category=X&subcategory=Y`
- Play Sentence → Alert "Coming Soon"

### 3. Updated Vocab Page

**File:** `app/vocab/page.tsx`

**New URL Params:**
- `category` (optional): Filter by category
- `subcategory` (optional): Filter by subcategory

**Example URLs:**
```
/vocab                                    # All words
/vocab?category=emotion                   # All emotion words
/vocab?category=emotion&subcategory=1     # Emotion Part 1 only
```

**Updates:**
1. Added `subcategory` to `useSearchParams()`
2. Updated `fetchWords()` to include subcategory param
3. Updated header badges to show both category & subcategory
4. Updated empty state messages

**Header Badges:**
```tsx
{category && (
  <span className="bg-[#7c5cff] text-white">
    {category}
  </span>
)}
{subcategory && (
  <span className="bg-[#fee801] text-black">
    Part {subcategory}
  </span>
)}
```

### 4. Updated Dashboard

**File:** `app/dashboard/page.tsx`

**Change:**
```tsx
// Before:
<Link href={`/vocab?category=${category.name}`}>

// After:
<Link href={`/category-menu/${category.name}`}>
```

## 🎮 Usage Examples

### Example 1: User selects Emotion category

1. **Dashboard:** Click "Emotion" card
2. **Category Menu:** 
   - URL: `/category-menu/emotion`
   - Shows: Part 1 (10 words)
   - User clicks Part 1 card (turns yellow)
   - User clicks "Play Vocab Mode"
3. **Vocab Game:**
   - URL: `/vocab?category=emotion&subcategory=1`
   - Only shows emotion words from Part 1

### Example 2: Category with multiple parts

If "Family" has 20 words (2 subcategories):

**Category Menu shows:**
- Part 1 (10 words) - Subcategory 1
- Part 2 (10 words) - Subcategory 2

**User can choose:**
- Play Part 1 → `/vocab?category=family&subcategory=1`
- Play Part 2 → `/vocab?category=family&subcategory=2`

## 🔄 Data Flow

### API getBatch with Filters:

```typescript
// Backend: app/api/getBatch/route.ts
const categoryFilter = searchParams.get('category');
const subcategoryFilter = searchParams.get('subcategory');

// Query 1: Review words
progressQuery
  .eq('vocab_master.category', categoryFilter)      // if provided
  .eq('vocab_master.subcategory', subcategoryFilter) // if provided

// Query 2: New words
newWordsQuery
  .eq('category', categoryFilter)                    // if provided
  .eq('subcategory', subcategoryFilter)              // if provided
  .order('subcategory', { ascending: true })         // Easy first
```

## 🎨 Component Highlights

### Part Card Selected Animation:

```tsx
<motion.button
  onClick={() => setSelectedSubcategory(sub.subcategory)}
  className={`${
    selectedSubcategory === sub.subcategory
      ? 'bg-[#fee801] border-[#fee801] text-black scale-105'
      : 'bg-card border-theme text-foreground hover:border-[#fee801]'
  }`}
>
  {/* Checkmark when selected */}
  {selectedSubcategory === sub.subcategory && (
    <div className="w-6 h-6 bg-black rounded-full">
      <svg className="text-[#fee801]">...</svg>
    </div>
  )}
</motion.button>
```

### Disabled State for Play Buttons:

```tsx
<button
  onClick={handlePlayVocab}
  disabled={selectedSubcategory === null}
  className={`${
    selectedSubcategory !== null
      ? 'bg-[#fee801] text-black hover:scale-105'
      : 'bg-card border-theme text-text-secondary/50 cursor-not-allowed'
  }`}
>
  Play Vocab Mode
</button>
```

## 📊 Database Queries

### Get Subcategories:
```sql
SELECT subcategory, COUNT(*) as word_count
FROM vocab_master
WHERE category = 'emotion'
GROUP BY subcategory
ORDER BY subcategory ASC;
```

### Get Words for Game (filtered):
```sql
SELECT vm.* 
FROM vocab_master vm
WHERE vm.category = 'emotion' 
  AND vm.subcategory = 1
ORDER BY vm.id;
```

## 🚀 Features

### Current Features:
✅ Dynamic category menu with subcategory selection
✅ Visual feedback for selected part (yellow highlight)
✅ Disabled state for play buttons until part selected
✅ Category info card with total words & parts count
✅ Responsive layout (mobile, tablet, desktop)
✅ Dark/light mode support
✅ Smooth animations with Framer Motion
✅ Breadcrumb navigation (Back to Dashboard)

### Coming Soon:
⏳ Sentence Mode gameplay
⏳ Progress indicator per part (e.g., "80% mastered")
⏳ Lock/unlock mechanism (must complete Part 1 before Part 2)
⏳ Recommended part based on user progress

## 🐛 Edge Cases Handled

1. **No subcategories:** Redirect to dashboard
2. **Invalid category:** 404 or redirect
3. **No part selected:** Buttons disabled
4. **Empty words:** Show "Great Job" completion message
5. **Coming soon features:** Alert message instead of crash

## 📱 Responsive Design

### Mobile (< 640px):
- Part cards: 1 column
- Category card below (stacked)
- Full-width buttons

### Tablet (640px - 1024px):
- Part cards: 2 columns
- Category card on right
- Side-by-side layout

### Desktop (> 1024px):
- Part cards: 2 columns in left 2/3
- Category card sticky on right 1/3
- Optimal spacing

## 🎯 Testing Checklist

- [ ] Click category card from dashboard → Opens category menu
- [ ] Category menu shows correct parts count
- [ ] Select part → Card turns yellow with checkmark
- [ ] Play buttons disabled when no part selected
- [ ] Play Vocab Mode → Redirects to vocab game with filters
- [ ] Vocab game shows correct category + part badges
- [ ] Vocab game filters words correctly
- [ ] Back button returns to dashboard
- [ ] Logout works from category menu
- [ ] Theme toggle works
- [ ] Responsive on mobile/tablet/desktop
- [ ] Empty state messages show correct category/part

## 📝 Summary

✅ **4 files created/updated:**
1. `app/api/subcategories/route.ts` - New API
2. `app/category-menu/[category]/page.tsx` - New page
3. `app/dashboard/page.tsx` - Updated redirect
4. `app/vocab/page.tsx` - Updated subcategory support

✅ **Features implemented:**
- Subcategory selection UI
- Category info display
- Play mode buttons (Vocab & Sentence)
- URL-based filtering
- State management
- Responsive design
- Dark mode support

✅ **Ready to use!** 🎉
