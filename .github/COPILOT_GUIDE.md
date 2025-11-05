# 🎮 GitHub Copilot Instructions — Phase 3: Dashboard & Vocab Game Interface

## 🎯 Goal
Develop the **main dashboard and core gameplay UI** for the “Ryurex Edu Vocab Game” web app.  
This phase focuses on **vocabulary mode gameplay**, **XP system**, and **fluency-based retrieval logic** using **Supabase** as the database.  

No AI model integration yet — this phase focuses on core mechanics and data logic.

---

## 🪄 Tech Stack
- Framework: **Next.js (App Router, TypeScript)**
- Styling: **Tailwind CSS + Framer Motion**
- Database: **Supabase (PostgreSQL + Auth)**
- Hosting: **Vercel**
- Icon pack: **Lucide React**

---



## 🧩 Components & Behavior

### 🏠 Dashboard (`/dashboard`)
- Displays greeting message: `"Hi, [username]! Ready to train your vocab today?"`
- Shows:
  - XP bar
  - Level
  - Daily streak
  - Count of “words due today”
- Buttons:
  - **Vocab Mode** → link to `/vocab`
  - **Sentence Mode** → link to `/sentence` (placeholder for now)
- Optional leaderboard or daily progress summary section.

---

### 🎮 Vocab Mode (`/vocab`)
Implements the main vocabulary game loop.

#### UI Elements
| Element | Description |
|----------|--------------|
| Progress bar | shows current question number (e.g., `3 / 10`) |
| Timer | starts counting when question appears |
| Question text | Indonesian word to translate, e.g. `"memancing"` |
| Answer input | underscores `_ _ _ _ _` showing letter count; user types English word |
| Hint system | after 10s, first letter auto-shown (`f _ _ _ _`) |
| Submit | user presses **Enter** or clicks “Submit” |
| Feedback | shows “✅ Correct” or “❌ Wrong” with color animation |
| Auto-next | moves to next question after short delay |
| Result Modal | appears after all 10 questions — shows XP gained, accuracy, average time |

---

## 🧠 Fluency & Retrieval Logic

### 1️⃣ Response Evaluation
- `time_taken < 10s` → fast recall → fluency +2  
- `time_taken >= 10s` → slow recall → fluency +1  
- `incorrect` → fluency -2  
- Fluency range: `0 – 10`

### 2️⃣ Next Review Interval
next_due = today + (1.8 ^ fluency) days

sql
Salin kode
- Low fluency → reviewed again soon  
- High fluency → reviewed after several days  

### 3️⃣ Prioritization Algorithm
When fetching vocab batch:
- Sort by `next_due` (earlier = higher priority)
- Then by lowest `fluency`
- Limit result to 10 per session

---

## 🏆 XP & Motivation System

| Action | XP Gained |
|---------|------------|
| Fast correct (<10s) | +10 XP |
| Slow correct (≥10s) | +5 XP |
| Wrong | +1 XP |

**Level Up:** Every +100 XP = +1 Level  
**Streak:** Increases by +1 if user completes ≥1 session/day  

---

## 💾 Database Schema (Supabase)

### Table: `users`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| username | text | user’s name |
| xp | integer | total XP |
| level | integer | current level |
| streak | integer | daily streak count |
| created_at | timestamp | join date |

### Table: `vocab_master`
| Column | Type | Description |
|--------|------|-------------|
| id | integer | PK |
| indo | text | Indonesian word |
| english | text | English translation |
| category | text | e.g. emotion, family, food |

### Table: `user_vocab_progress`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| vocab_id | integer | FK → vocab_master.id |
| fluency | float | recall ability (0–10) |
| next_due | date | next review date |
| last_reviewed | timestamp | last answered |
| response_avg | float | avg response time |
| correct_count | int | total correct |
| wrong_count | int | total wrong |

---

## ⚙️ API Endpoints

### `/api/getBatch`
Fetch 10 vocab items due for review:
```ts
GET /api/getBatch
→ returns 10 words sorted by priority
/api/submit
Record user response:

ts
Salin kode
POST /api/submit
{
  vocab_id,
  correct: boolean,
  time_taken: number
}
→ updates fluency, next_due, and XP
/api/userXP
Handle XP increment & level logic.

🧭 Gameplay Flow
csharp
Salin kode
[Dashboard]
   ↓
[Select Vocab Mode]
   ↓
[Fetch 10 due words from Supabase]
   ↓
[Start game]
   ↓
[User answers → check correctness + timer]
   ↓
[Send result → /api/submit]
   ↓
[Update fluency + XP]
   ↓
[Next question until 10 total]
   ↓
[Show Result Modal + XP gain]
   ↓
[Back to Dashboard]
🎨 UI/UX Guidelines
Dark theme (bg-[#0f1115])

Accent color: soft blue/purple (#7c5cff or #5C7CFF)

Use Framer Motion for fade/slide transitions

Input box → monospace font for _ _ _ _ _ alignment

Responsive layout for mobile (375×667) & desktop (1440×900)

Add subtle glow effect on correct answers ✨

📦 Deliverables Checklist
✅ Task 1: Database schema created (users, vocab_master, user_vocab_progress) with RLS

✅ Task 2: Seed data (120 Indonesian-English words across 10 categories)

✅ Task 3: Dashboard page (XP bar, stats, solid color design, mode selection)

✅ Task 4: /vocab page (functional gameplay UI) - COMPLETE
  - Progress bar showing question number
  - Timer counting from start
  - Indonesian word display with category badge
  - Underscore display matching answer length
  - Answer input with Enter key support
  - Submit button with loading state
  - Feedback animations (✅ correct / ❌ wrong)
  - Auto-advance to next question

✅ Task 5: Timer, hint, underscore input system components - COMPLETE
  - Timer: Real-time countdown display
  - Hint system: First letter revealed after 10 seconds
  - Underscore input: Visual letter placeholders with user input

✅ Task 6: API routes (getBatch, submit, userStats) with game logic

✅ Task 7: XP + level system, streak tracking, fluency calculation

✅ Task 8: Result modal with score summary - COMPLETE
  - XP gained display (yellow highlight)
  - Accuracy percentage
  - Average response time
  - "Play Again" and "Dashboard" buttons
  - Solid color design (no gradients)

⏳ Task 9: Test & polish - responsive design, animations - IN PROGRESS

---

## 📝 Progress Notes
- **Dashboard redesigned**: Solid colors (yellow #fee801, purple #7c5cff), no gradients/glassmorphism
- **Database verified**: User confirmed all setup checks passed
- **Vocab input improved**: User now types directly in underscore display `_ _ _ _ _` (not separate box)
- **Input validation**: Max length enforced, can't type beyond answer length
- **API fixed**: Properly returns `{success, words, count}` object format
- **Word rotation fixed**: System now properly fetches ALL learned words, excludes them from new word query
- **Retrieval priority**: Due words first, then new unlearned words (sequential by ID)
- **NEW STRICTER SYSTEM**: 
  - Fluency 0 stays TODAY (must master before moving on)
  - Fast correct (<10s) +2 fluency, scheduled future
  - Slow correct (≥10s) -1 fluency, stays TODAY (forced practice)
  - Wrong -1 fluency, stays TODAY (forced practice)
  - No more confusion with too many new words!
- **Empty state**: Clear message when all words reviewed for the day
- **Test page created**: `/test-api` for debugging API responses
- **Debug script**: `debug_vocab_system.sql` to verify database state
- **Current**: Vocab game with stricter mastery-based learning system

