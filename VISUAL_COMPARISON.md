# NFL Broadcast Feature - Visual Comparison

## Before Implementation

### Tab Visibility (MLB Only)
```
Game Detail Modal Tabs:
┌─────────┬──────────┬──────────┬─────────────┐
│ Overview│ Box Score│  Plays   │ Broadcasts* │
└─────────┴──────────┴──────────┴─────────────┘
                                  * Only visible for MLB
```

### Code (Before)
```tsx
// Tab button - MLB only
{selectedLeague === 'mlb' && (
  <button onClick={() => setActiveTab('broadcasts')}>
    Broadcasts
  </button>
)}

// Tab content - MLB only
{activeTab === 'broadcasts' && selectedLeague === 'mlb' && (
  <BroadcastsTab game={displayGame} />
)}

// Component - MLB only
function BroadcastsTab({ game }: { game: Game }) {
  const mlbApi = await import('../lib/mlb-api')
  const broadcasts = await mlbApi.fetchMLBBroadcastsByDate(...)
  // ...
}
```

---

## After Implementation

### Tab Visibility (MLB & NFL)
```
Game Detail Modal Tabs:
┌─────────┬──────────┬──────────┬─────────────┐
│ Overview│ Box Score│  Plays   │ Broadcasts* │
└─────────┴──────────┴──────────┴─────────────┘
                                  * Visible for MLB AND NFL
```

### Code (After)
```tsx
// Tab button - MLB and NFL
{(selectedLeague === 'mlb' || selectedLeague === 'nfl') && (
  <button onClick={() => setActiveTab('broadcasts')}>
    Broadcasts
  </button>
)}

// Tab content - MLB and NFL
{activeTab === 'broadcasts' && (selectedLeague === 'mlb' || selectedLeague === 'nfl') && (
  <BroadcastsTab game={displayGame} league={selectedLeague} />
)}

// Component - League-aware
function BroadcastsTab({ game, league }: { game: Game; league: string }) {
  if (league === 'mlb') {
    const mlbApi = await import('../lib/mlb-api')
    const broadcasts = await mlbApi.fetchMLBBroadcastsByDate(...)
  } else if (league === 'nfl') {
    const nflApi = await import('../lib/nfl-api')
    const broadcasts = await nflApi.fetchNFLBroadcastsByDate(...)
  }
  // ...
}
```

---

## UI Display Example

### NFL Game Broadcast Tab

```
┌─────────────────────────────────────────────────────────────┐
│  🏆 Television Broadcasts                                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ CBS          │  │ FOX          │  │ NBC          │     │
│  │ National     │  │ National     │  │ National     │     │
│  │ EN           │  │ EN           │  │ EN           │     │
│  │              │  │              │  │              │     │
│  │   [CBS Logo] │  │   [FOX Logo] │  │   [NBC Logo] │     │
│  │   or NFLb.png│  │   or NFLb.png│  │   or NFLb.png│     │
│  │              │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  📻 Radio Broadcasts                                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Local Radio  │  │ ESPN Radio   │                        │
│  │ Local        │  │ National     │                        │
│  │ EN           │  │ EN           │                        │
│  │              │  │              │                        │
│  │   [Logo]     │  │   [Logo]     │                        │
│  │   or NFLb.png│  │   or NFLb.png│                        │
│  │              │  │              │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## API Integration Comparison

### MLB Stats API
```
Endpoint: https://statsapi.mlb.com/api/v1/schedule
          ?sportId=1&date=YYYY-MM-DD&hydrate=broadcasts

Response Structure:
{
  dates: [{
    games: [{
      gamePk: "123456",
      broadcasts: [{
        id: 789,
        name: "FOX",
        type: "TV",
        language: "en",
        isNational: true,
        callSign: "FOX",
        // ... more MLB-specific fields
      }]
    }]
  }]
}
```

### ESPN NFL API (New)
```
Endpoint: https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard
          ?dates=YYYYMMDD

Response Structure:
{
  events: [{
    id: "401547438",
    competitions: [{
      broadcasts: [{
        market: { type: "National" },
        media: { shortName: "CBS" },
        type: { shortName: "TV" },
        lang: "en"
      }]
    }]
  }]
}

Mapped To Shared Interface:
{
  "401547438": [{
    name: "CBS",                    // from media.shortName
    type: "TV",                     // from type.shortName
    language: "en",                 // from lang
    isNational: true,              // from market.type
    callSign: "CBS",               // from media.shortName
    market: "National"             // from market.type
  }]
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (app/page.tsx)             │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │        GameDetailModal Component               │         │
│  │  ┌──────────────────────────────────────────┐ │         │
│  │  │  Tabs: Overview | BoxScore | Plays |    │ │         │
│  │  │        Broadcasts (MLB & NFL)             │ │         │
│  │  └──────────────────────────────────────────┘ │         │
│  │                                                │         │
│  │  ┌──────────────────────────────────────────┐ │         │
│  │  │      BroadcastsTab Component             │ │         │
│  │  │  - Accepts: game, league                 │ │         │
│  │  │  - Renders: TV & Radio broadcasts        │ │         │
│  │  │  - Styling: League-specific colors       │ │         │
│  │  └──────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─── if league === 'mlb'
                            │         │
                            │         ▼
                  ┌─────────────────────────┐
                  │  lib/mlb-api.ts         │
                  │  fetchMLBBroadcasts...  │
                  │         │               │
                  │         ▼               │
                  │  MLB Stats API          │
                  └─────────────────────────┘
                            │
                            ├─── if league === 'nfl'
                            │         │
                            │         ▼
                  ┌─────────────────────────┐
                  │  lib/nfl-api.ts (NEW)   │
                  │  fetchNFLBroadcasts...  │
                  │         │               │
                  │         ▼               │
                  │  ESPN NFL API           │
                  └─────────────────────────┘
                            │
                            ▼
                  ┌─────────────────────────┐
                  │   lib/api.ts            │
                  │   Broadcast Interface   │
                  │   (Shared MLB/NFL)      │
                  └─────────────────────────┘
```

---

## File Structure Changes

```
sports/
├── app/
│   └── page.tsx                    ← Modified: Added NFL support
│
├── lib/
│   ├── api.ts                      ← Modified: Added Broadcast interface
│   ├── mlb-api.ts                  ← Unchanged
│   ├── nfl-api.ts                  ← Modified: Added fetchNFLBroadcasts
│   └── broadcast-config.ts         ← Modified: Added NFL fallback
│
├── public/
│   └── logos/
│       └── broadcasts/
│           ├── tv/                 ← Logo files (network logos)
│           ├── radio/              ← Logo files (radio logos)
│           └── generic/
│               ├── MLBb.png        ← Existing
│               └── NFLb.png        ← NEW
│
└── Documentation/
    ├── BROADCAST_IMPLEMENTATION.md         ← Existing (MLB)
    ├── NFL_BROADCAST_IMPLEMENTATION.md     ← NEW
    ├── IMPLEMENTATION_SUMMARY.md           ← NEW
    └── test-nfl-broadcasts.js              ← NEW
```

---

## Summary of Changes

| Aspect                | Before          | After                  |
|-----------------------|-----------------|------------------------|
| Leagues Supported     | MLB only        | MLB + NFL              |
| API Sources           | MLB Stats API   | MLB Stats + ESPN API   |
| Broadcast Interface   | MLB-specific    | Shared (MLB/NFL)       |
| Tab Visibility        | MLB only        | MLB + NFL              |
| Component Parameters  | game only       | game + league          |
| Fallback Logos        | MLBb.png        | MLBb.png + NFLb.png    |
| Color Scheme          | MLB blue        | League-specific        |
| API Functions         | 1 (MLB)         | 2 (MLB + NFL)          |

---

## Testing Status

✅ **Completed:**
- TypeScript compilation
- Code structure validation
- Documentation
- Backwards compatibility check

⏳ **Pending (Requires Network Access):**
- Live NFL game testing
- ESPN API integration verification
- UI rendering with real data
- Logo loading validation
