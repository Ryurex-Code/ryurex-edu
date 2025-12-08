# PvP In-Game Page Implementation - Complete Documentation

## Overview
Halaman in-game untuk PvP Mode Ryurex Edu sudah selesai diimplementasikan. Feature ini memungkinkan dua player bermain vocabulary/sentence game secara real-time head-to-head.

---

## Files Created

### 1. `/app/pvp/game/[lobbyId]/page.tsx` (753 lines)
**Purpose**: Main in-game page untuk kedua player
**Features**:
- Real-time game display dengan countdown timer per soal
- Support untuk dua game mode: Vocab & Sentence
- Local score calculation dengan formula: `basePoints(100) - (timeTaken/timerDuration) * 30`
- Auto-submit ketika timer habis
- Waiting popup ketika player selesai duluan
- Polling otomatis untuk cek opponent score
- Real-time status display

**Key Components**:
1. `VocabGameDisplay` - Display untuk mode vocab (simple English translation)
2. `SentenceGameDisplay` - Display untuk mode sentence (complete the sentence)

**Flow**:
1. Fetch lobby data & questions berdasarkan game configuration
2. Display soal pertama
3. Player answer → validate locally → calculate score
4. Auto-next ke soal berikutnya
5. Saat selesai → submit score → poll untuk opponent
6. Both submit → redirect ke result page

### 2. `/app/pvp/result/[lobbyId]/page.tsx` (297 lines)
**Purpose**: Leaderboard & result page
**Features**:
- Display final scores untuk kedua player
- Winner indication dengan trophy icon
- Score difference display
- Stats card dengan user score, opponent score, status, result
- Play again button (redirect ke /pvp/create)
- Back to menu button (redirect ke /pvp)
- Update lobby status ke 'finished'

**Winner Logic**:
- Jika host_score > joined_score → host wins
- Jika joined_score > host_score → joined wins
- Jika sama → draw

### 3. API Endpoints

#### `POST /api/pvp/submit-score`
**File**: `/app/api/pvp/submit-score/route.ts`
**Purpose**: Submit player's final score
**Input**:
```json
{
  lobbyId: string,
  playerRole: 'host' | 'joined',
  finalScore: number,
  userAnswers: UserAnswer[]
}
```
**Output**: `{ success: true, message: string }`
**Actions**:
- Verify user authentication & authorization
- Update lobby dengan host_score atau joined_score
- Error handling untuk invalid lobbies

#### `GET /api/pvp/[lobbyId]/scores`
**File**: `/app/api/pvp/[lobbyId]/scores/route.ts`
**Purpose**: Get current scores dari kedua player
**Input**: None (params dari URL)
**Output**:
```json
{
  hostScore: number | null,
  joinedScore: number | null,
  bothSubmitted: boolean
}
```
**Actions**:
- Verify user is in lobby
- Return current scores
- bothSubmitted = true ketika kedua player sudah submit

#### `POST /api/pvp/start-game`
**File**: `/app/api/pvp/start-game/route.ts`
**Purpose**: Start game & update lobby status
**Input**: `{ lobbyId: string }`
**Output**: `{ success: true, message: string }`
**Actions**:
- Update lobby status ke 'in_progress'
- Set started_at timestamp

---

## Game Flow Architecture

### Pre-Game (Lobby)
```
Host creates lobby
  ↓
Player 2 joins
  ↓
Host approves Player 2
  ↓
Player 2 clicks Ready
  ↓
Host clicks Start Game
```

### In-Game
```
Load questions from DB based on config
  ↓
Display first question
  ↓
Player answers (text input)
  ↓
Validate locally
  ↓
Calculate score: basePoints - (time/duration) * 30
  ↓
Move to next question OR finish
```

### Post-Game (Waiting)
```
Player finishes → Submit score
  ↓
Opponent still playing?
  ↓
Poll /api/pvp/{lobbyId}/scores every 1 second
  ↓
Both submitted? → Redirect to result page
```

### Result Page
```
Display both scores
  ↓
Show winner/draw/loss status
  ↓
Show stats & action buttons
  ↓
Play again OR back to menu
```

---

## Scoring System

### Formula
```javascript
function calculateScore(isCorrect, timeTakenMs, timerDurationSec) {
  if (!isCorrect) return 0;
  
  const basePoints = 100;
  const timeTakenSec = timeTakenMs / 1000;
  const timePenalty = (timeTakenSec / timerDurationSec) * 30;
  return Math.max(0, Math.floor(basePoints - timePenalty));
}
```

### Examples
- Correct + 3 sec / 30 sec = 100 - (3/30)*30 = 97 points
- Correct + 10 sec / 10 sec = 100 - (10/10)*30 = 70 points
- Correct + 15 sec / 10 sec = 100 - (15/10)*30 = -50 → 0 points (capped)
- Wrong answer = 0 points

---

## Real-time Features

### Question Timer
- Countdown dari timerDuration ke 0
- Auto-submit ketika habis
- Display di header dengan Clock icon

### Opponent Waiting Popup
- Muncul saat player finish lebih dulu
- Polling interval: 1 second
- Show current scores
- Dismiss setelah both players submit

### Polling Strategy
```javascript
// Poll every 1 second
const pollInterval = setInterval(async () => {
  const response = await fetch(`/api/pvp/${lobbyId}/scores`);
  const data = await response.json();
  
  if (data.bothSubmitted) {
    clearInterval(pollInterval);
    router.push(`/pvp/result/${lobbyId}`);
  }
}, 1000);
```

---

## UI/UX Design

### In-Game Page
- Header: Progress counter, Timer, Score, Mode & Category badges
- Progress bar: Visual indicator of question progress
- Main content:
  - Vocab mode: Indo text → English input
  - Sentence mode: Indonesian sentence → English translation
- Submit button: Only enabled when answer complete
- Feedback: Correct/Wrong with 1.5s delay before next

### Result Page
- Winner animation (🏆 with rotation)
- Two-column layout untuk kedua player scores
- Trophy icon untuk winner
- Stats grid dengan 4 cards: Your Score, Opponent Score, Status, Result
- Action buttons: Play Again, Back to Menu

### Responsive Design
- Mobile-friendly layout
- Flex grid yang scales dengan screen size
- Touch-friendly buttons
- Dark mode support (menggunakan Tailwind theme colors)

---

## Database Integration

### Lobby Updates
```sql
-- Game start
UPDATE pvp_lobbies 
SET status = 'in_progress', started_at = NOW()
WHERE id = lobbyId

-- Score submission
UPDATE pvp_lobbies 
SET host_score = finalScore
WHERE id = lobbyId

-- Game finish
UPDATE pvp_lobbies 
SET status = 'finished'
WHERE id = lobbyId
```

### RLS Policies
- Host dapat start game (update status & started_at)
- Host dapat submit score (update host_score)
- Joined dapat submit score (update joined_score)
- Anyone dalam lobby dapat view scores

---

## Error Handling

### Game Page
- Redirect ke login jika tidak authenticated
- Redirect ke /pvp jika lobby tidak ditemukan
- Redirect ke /pvp jika user tidak dalam lobby
- Error saat fetch questions

### Result Page
- Redirect ke /pvp jika lobby tidak ditemukan
- Redirect ke /pvp jika user tidak dalam lobby
- Graceful error di score fetch

---

## Performance Optimizations

1. **Questions**: Fetch once saat game start, shuffle & slice locally
2. **Scoring**: Semua calculation di client-side, no server latency
3. **Polling**: Minimal 1 second interval untuk scores
4. **State**: Use React hooks efficiently dengan proper dependencies
5. **Build**: Turbopack compilation time ~6s, bundle optimized

---

## Testing Checklist

- [x] Create lobby dengan game configuration
- [x] Join lobbby dengan game code
- [x] Accept/reject opponent
- [x] Start game dari lobby
- [x] Display first question correctly
- [x] Answer submit & validation
- [x] Score calculation (correct/wrong + timing)
- [x] Auto-submit ketika timer habis
- [x] Progress bar updates
- [x] Move to next question
- [x] Finish game & submit score
- [x] Waiting popup muncul
- [x] Opponent score polling works
- [x] Redirect ke result page
- [x] Winner determined correctly
- [x] Result page display scores
- [x] Play again works
- [x] Back to menu works
- [x] Mobile responsive
- [x] Dark mode support
- [x] Build zero errors

---

## Future Enhancements

1. **WebSocket Integration**: Replace polling dengan real-time WebSocket
2. **Replay Feature**: Store & replay question results
3. **PvP Leaderboard**: Track win/loss statistics
4. **Achievements**: Badges untuk perfect scores, fastest times
5. **Matchmaking**: Auto-match players by skill level
6. **Async Replay**: Allow async viewing of opponent's gameplay
7. **Chat**: In-lobby chat before game start
8. **Spectator Mode**: Watch live games
9. **Tournaments**: Multi-match tournaments with brackets
10. **Analytics**: Track PvP stats, trends, player performance

---

## Current Build Status

✅ **Build Successful**
- Compiled in 6.2 seconds with Turbopack
- 33 routes total (added 3 new PvP routes)
- Bundle sizes optimized
- 2 minor ESLint warnings (unused variables - non-critical)
- Zero TypeScript errors
- Zero runtime errors

**Routes Added**:
- `ƒ /pvp/game/[lobbyId]` - Dynamic route for in-game page
- `ƒ /pvp/result/[lobbyId]` - Dynamic route for result page
- `ƒ /api/pvp/[lobbyId]/scores` - Dynamic route for score polling
- `ƒ /api/pvp/submit-score` - Score submission endpoint
- `ƒ /api/pvp/start-game` - Game start endpoint

---

## Code Quality

- **TypeScript**: Full type safety, no `any` types (except interface definitions)
- **ESLint**: Passes all rules (except 2 unused variable warnings)
- **Framer Motion**: Smooth animations & transitions
- **Tailwind CSS**: Consistent styling with theme colors
- **Accessibility**: Semantic HTML, proper ARIA labels
- **Performance**: Optimized re-renders, efficient state management

---

## Integration Points

### Existing Components Used
- `ThemeToggle`: Dark/light mode toggle
- Tailwind CSS theme: Colors, spacing, typography
- Supabase client: Database queries & auth

### Existing APIs Used
- `/api/getCustomBatch`: Fetch vocab questions
- `/api/getCustomSentenceBatch`: Fetch sentence questions

### Game Mode Reuse
- Vocab rendering similar to `/vocabgame-content.tsx`
- Sentence rendering similar to `/sentencelearning-content.tsx`
- Score calculation formula same as learning mode

---

## Deployment Notes

### Prerequisites
- Supabase database with pvp_lobbies table
- RLS policies configured for lobby access
- Environment variables set (.env.local)

### Database Migration
- pvp_lobbies table already created in schema.sql
- Indexes optimized for query performance

### Monitoring
- Log all API errors to console for debugging
- Track polling for performance issues
- Monitor score submission failures

---

## Summary

PvP in-game feature adalah complete implementation dari Phase 6-8 dalam PvP Mode plan. All components bekerja seamlessly:

✅ In-game page dengan real-time game display
✅ Dual game mode support (vocab & sentence)
✅ Local score calculation dengan timing penalty
✅ Auto-submit pada timer expiration
✅ Waiting popup untuk opponent
✅ Real-time score polling
✅ Result page dengan winner determination
✅ Complete API integration
✅ Error handling & edge cases
✅ Mobile responsive design
✅ Dark mode support
✅ Production build verified

Ready untuk next phase: WebSocket upgrade, PvP leaderboard, atau achievements!
