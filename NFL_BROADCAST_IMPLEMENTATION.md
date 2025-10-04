# NFL Broadcast Feature Implementation

## Summary of Changes

### 1. Core Implementation
- ✅ Added `Broadcast` interface to `lib/api.ts` (shared between MLB and NFL)
- ✅ Added `fetchNFLBroadcastsByDate()` function to `lib/nfl-api.ts` to fetch broadcast data from ESPN API
- ✅ Updated `Game` interface in `lib/api.ts` to include `broadcasts?: Broadcast[]`
- ✅ Updated "Broadcasts" tab to support both MLB and NFL games

### 2. UI Improvements
- ✅ **League-Agnostic Design**: Updated BroadcastsTab component to work with both MLB and NFL
- ✅ **Dynamic Colors**: Icon colors change based on league (blue for NFL, mlb-blue for MLB)
- ✅ **Responsive Grid**: Maintains responsive 1-4 column layout for both leagues
- ✅ **Smart Fallbacks**: Uses NFLb.png as fallback for NFL, MLBb.png for MLB
- ✅ **Market Information**: Displays broadcast market info (National/Local) for both leagues

### 3. Configuration System
- ✅ Updated `lib/broadcast-config.ts` to support NFL fallback logos
- ✅ Created `/public/logos/broadcasts/generic/NFLb.png` fallback logo
- ✅ Added NFLb-placeholder.md with guidelines for NFL broadcast logos

### 4. Features
- **TV Broadcasts**: Displays all TV networks broadcasting NFL games
- **Radio Broadcasts**: Displays radio stations (if available in ESPN API)
- **Smart Grouping**: Separates TV and Radio into distinct sections
- **Responsive Design**: 1-4 columns based on screen size
- **Fallback Handling**: Shows NFLb logo or call sign if specific logo fails to load
- **Market Type**: Shows National vs Local market information

### 5. Data Source
Uses ESPN NFL API endpoint:
```
https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=YYYYMMDD
```

The API provides broadcast information in the `competitions[0].broadcasts` array, including:
- Network names (e.g., CBS, FOX, NBC, ESPN)
- Market type (National or Local)
- Broadcast type (TV, Radio, etc.)

### 6. Directory Structure Updates
```
public/
└── logos/
    └── broadcasts/
        ├── tv/           # TV network logos (shared MLB/NFL)
        ├── radio/        # Radio station logos (shared MLB/NFL)
        └── generic/      
            ├── MLBb.png      # MLB fallback logo
            └── NFLb.png      # NFL fallback logo (NEW)
lib/
├── api.ts              # Broadcast interface (updated)
├── nfl-api.ts          # fetchNFLBroadcastsByDate() (NEW)
└── broadcast-config.ts # NFL support added
```

## Implementation Details

### NFL Broadcast Data Mapping
The ESPN API provides broadcasts in a different format than MLB Stats API:
- **name**: Mapped from `broadcast.market.type` or `broadcast.media.shortName`
- **type**: Mapped from `broadcast.type.shortName` or `broadcast.type`
- **callSign**: Mapped from `broadcast.media.shortName` or `broadcast.names[0]`
- **isNational**: Determined by `broadcast.market.type === 'National'`
- **language**: Defaults to 'en' if not provided

### Tab Visibility Logic
The Broadcasts tab now appears for both MLB and NFL games:
```typescript
{(selectedLeague === 'mlb' || selectedLeague === 'nfl') && (
  <button onClick={() => setActiveTab('broadcasts')}>
    Broadcasts
  </button>
)}
```

### BroadcastsTab Component Updates
- Added `league` parameter to component
- Conditional API fetching based on league
- League-specific styling and fallback logos
- Safe handling of optional broadcast fields (language, callSign, etc.)

## Next Steps
1. Add actual NFL network logo files (CBS, FOX, NBC, ESPN, NFL Network, etc.)
2. Test with live NFL games during season
3. Consider adding streaming service information (Prime Video, Peacock, etc.)
4. Add filters for national vs local broadcasts

## Usage
The broadcast tab appears automatically for both MLB and NFL games when broadcast data is available from their respective APIs.

## Testing Notes
- ESPN NFL API provides broadcast information in `competitions[0].broadcasts`
- Network blocking may prevent full API testing in sandboxed environments
- TypeScript compilation passes with no errors
- Component is designed to gracefully handle missing or incomplete broadcast data
