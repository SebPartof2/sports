// API utilities for fetching MLB data
// Replace these functions with your actual API implementation

// Utility function to get local date as YYYY-MM-DD string
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface Game {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  status: 'scheduled' | 'live' | 'final'
  inning?: string
  startTime: string
  venue?: string
  venueCity?: string
  venueState?: string
  venueCountry?: string
  weather?: string
  temperature?: string
  wind?: string
  homeRecord?: string
  awayRecord?: string
  // NFL-specific fields
  period?: number
  clock?: string
  // Generic fields for both sports
  probablePitchers?: {
    home?: string
    away?: string
  }
  lineScore?: {
    innings?: Array<{
      home?: number
      away?: number
    }>
    quarters?: Array<{
      home?: number
      away?: number
    }>
    totals: {
      runs?: { home?: number; away?: number }
      hits?: { home?: number; away?: number }
      errors?: { home?: number; away?: number }
      home?: number
      away?: number
    }
  }
  livePlays?: Array<{
    id?: string
    period?: number
    clock?: string
    down?: number
    distance?: number
    yardLine?: string
    description: string
    type?: string
  }>
  lastPlay?: string
  attendance?: number
  boxScore?: {
    teams: {
      home: TeamStats
      away: TeamStats
    }
  }
  liveData?: {
    plays?: PlayByPlay[]
    currentPlay?: string
    inningState?: string
    balls?: number
    strikes?: number
    outs?: number
  }
  league?: string
  broadcasts?: Broadcast[]
}

export interface Broadcast {
  id?: number | string
  name: string
  type: string  // 'TV', 'AM', 'FM', etc.
  language?: string
  isNational?: boolean
  callSign?: string
  market?: string
  // NFL-specific fields from ESPN
  media?: {
    shortName?: string
  }
  // MLB-specific fields
  videoResolution?: {
    code: string
    resolutionShort: string
    resolutionFull: string
  }
  availability?: {
    availabilityId: number
    availabilityCode: string
    availabilityText: string
  }
  mediaState?: {
    mediaStateId: number
    mediaStateCode: string
    mediaStateText: string
  }
  broadcastDate?: string
  mediaId?: string
  colorSpace?: {
    code: string
    colorSpaceFull: string
  }
  gameDateBroadcastGuid?: string
  homeAway?: string
  freeGame?: boolean
  availableForStreaming?: boolean
  postGameShow?: boolean
  mvpdAuthRequired?: boolean
  freeGameStatus?: boolean
}

export interface TeamStats {
  teamName: string
  battingOrder: PlayerStats[]
  pitchers: PitcherStats[]
  teamTotals: {
    runs: number
    hits: number
    errors: number
    leftOnBase: number
  }
  // NFL-specific stats (optional)
  nflStats?: {
    totalYards: number
    passingYards: number
    rushingYards: number
    turnovers: number
    penalties: number
    timeOfPossession: string
  }
}

export interface PlayerStats {
  id: string
  name: string
  position: string
  battingOrder?: number
  atBats: number
  runs: number
  hits: number
  rbi: number
  baseOnBalls: number
  strikeOuts: number
  avg: string
  ops: string
  plateAppearances: number
}

export interface PitcherStats {
  id: string
  name: string
  inningsPitched: string
  hits: number
  runs: number
  earnedRuns: number
  baseOnBalls: number
  strikeOuts: number
  homeRuns: number
  era: string
  pitches: number
  strikes: number
  gameScore?: number
  isCurrentPitcher?: boolean
}

export interface PlayByPlay {
  // Baseball fields
  inning?: number
  halfInning?: string
  balls?: number
  strikes?: number
  outs?: number
  
  // NFL fields
  quarter?: number
  time?: string
  down?: number
  distance?: number
  yardLine?: string
  
  // Common fields
  description: string
  result?: string
}

// Example function to fetch today's games
export async function fetchTodaysGames(): Promise<Game[]> {
  // Get today's date in local timezone
  const todayString = getLocalDateString()
  return fetchGamesByDate(todayString)
}

export async function fetchGamesByDate(date: string): Promise<Game[]> {
  try {
    // Step 1: Get schedule for specified date with cache busting
    const cacheBuster = Date.now()
    
    console.log('Fetching games for date:', date)
    
    const scheduleResponse = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&_=${cacheBuster}`)
    
    if (!scheduleResponse.ok) {
      console.error(`Schedule fetch failed: ${scheduleResponse.status} ${scheduleResponse.statusText}`)
      throw new Error(`Schedule fetch failed: ${scheduleResponse.status}`)
    }
    
    const scheduleData = await scheduleResponse.json()
    console.log('API response dates:', scheduleData.dates?.length || 0)
    console.log('Full API response:', scheduleData)
    
    const scheduleGames = scheduleData.dates?.[0]?.games || []
    console.log('Games found in API:', scheduleGames.length)
    
    if (scheduleGames.length === 0) {
      console.log('No real games scheduled for today')
      return []
    }
    
    // Transform schedule data to real game format
    const realGames: Game[] = scheduleGames.map((game: any) => ({
      id: game.gamePk.toString(),
      homeTeam: game.teams.home.team.name,
      awayTeam: game.teams.away.team.name,
      homeScore: game.teams.home.score,
      awayScore: game.teams.away.score,
      status: mapGameStatus(game.status.statusCode),
      inning: game.status.detailedState.includes('Inning') ? game.status.detailedState : undefined,
      startTime: game.gameDate,
      venue: game.venue?.name,
      homeRecord: game.teams.home.leagueRecord ? `${game.teams.home.leagueRecord.wins}-${game.teams.home.leagueRecord.losses}` : undefined,
      awayRecord: game.teams.away.leagueRecord ? `${game.teams.away.leagueRecord.wins}-${game.teams.away.leagueRecord.losses}` : undefined,
    }))
    
    console.log('API returned real games:', realGames.map(g => `${g.awayTeam} @ ${g.homeTeam} (${g.status})`))
    return realGames
  } catch (error) {
    console.error('Error fetching real games:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    // Return empty array instead of mock data
    return []
  }
}

// Transform detailed game data from MLB API
function transformGameData(gameData: any, basicGame?: Game): Game {
  try {
    const game = gameData.gameData
    const liveData = gameData.liveData
    
    // Get team info
    const homeTeam = game.teams.home
    const awayTeam = game.teams.away
    
    // Get scores - use the scores from the schedule API as backup
    const homeScore = liveData?.linescore?.teams?.home?.runs ?? game.teams?.home?.score ?? basicGame?.homeScore
    const awayScore = liveData?.linescore?.teams?.away?.runs ?? game.teams?.away?.score ?? basicGame?.awayScore
    
    // Get game status
    const status = mapGameStatus(game.status.statusCode)
    
    // Get current inning info
    const currentInning = liveData?.linescore?.currentInning
    const inningState = liveData?.linescore?.inningState
    const inningHalf = liveData?.linescore?.isTopInning ? 'Top' : 'Bot'
    const inning = (currentInning && status === 'live') ? `${inningHalf} ${getOrdinal(currentInning)}` : basicGame?.inning
    
    // Get venue and weather
    const venue = game.venue?.name ?? basicGame?.venue
    const weather = game.weather?.condition
    const temperature = game.weather?.temp ? `${game.weather.temp}°F` : undefined
    const wind = game.weather?.wind
    
    // Get probable pitchers - handle missing stats gracefully
    const probablePitchers = {
      home: game.probablePitchers?.home ? 
        `${game.probablePitchers.home.fullName}` + 
        (game.probablePitchers.home.stats?.[0] ? 
          ` (${game.probablePitchers.home.stats[0].wins || 0}-${game.probablePitchers.home.stats[0].losses || 0}, ${game.probablePitchers.home.stats[0].era || '0.00'} ERA)` 
          : '') 
        : undefined,
      away: game.probablePitchers?.away ? 
        `${game.probablePitchers.away.fullName}` +
        (game.probablePitchers.away.stats?.[0] ? 
          ` (${game.probablePitchers.away.stats[0].wins || 0}-${game.probablePitchers.away.stats[0].losses || 0}, ${game.probablePitchers.away.stats[0].era || '0.00'} ERA)` 
          : '') 
        : undefined
    }
    
    // Get line score
    const lineScore = liveData?.linescore ? {
      innings: liveData.linescore.innings?.map((inning: any) => ({
        home: inning.home?.runs,
        away: inning.away?.runs
      })) || [],
      totals: {
        runs: { 
          home: liveData.linescore.teams?.home?.runs, 
          away: liveData.linescore.teams?.away?.runs 
        },
        hits: { 
          home: liveData.linescore.teams?.home?.hits, 
          away: liveData.linescore.teams?.away?.hits 
        },
        errors: { 
          home: liveData.linescore.teams?.home?.errors, 
          away: liveData.linescore.teams?.away?.errors 
        }
      }
    } : undefined
    
    // Get last play
    const lastPlay = liveData?.plays?.currentPlay?.result?.description
    
    // Get attendance
    const attendance = game.gameInfo?.attendance
    
    // Get team records - use the season record or series record
    const homeRecord = homeTeam.record ? `${homeTeam.record.wins}-${homeTeam.record.losses}` : 
                       game.teams?.home?.leagueRecord ? `${game.teams.home.leagueRecord.wins}-${game.teams.home.leagueRecord.losses}` : 
                       basicGame?.homeRecord
    const awayRecord = awayTeam.record ? `${awayTeam.record.wins}-${awayTeam.record.losses}` : 
                       game.teams?.away?.leagueRecord ? `${game.teams.away.leagueRecord.wins}-${game.teams.away.leagueRecord.losses}` : 
                       basicGame?.awayRecord
    
    return {
      id: game.pk.toString(),
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      homeScore,
      awayScore,
      status,
      inning,
      startTime: game.datetime?.dateTime || game.gameDate || basicGame?.startTime,
      venue,
      weather,
      temperature,
      wind,
      homeRecord,
      awayRecord,
      probablePitchers: (probablePitchers.home || probablePitchers.away) ? probablePitchers : undefined,
      lineScore,
      lastPlay,
      attendance
    }
  } catch (error) {
    console.error('Error transforming game data:', error)
    // Return basic game if transformation fails
    return basicGame || {
      id: 'unknown',
      homeTeam: 'Unknown',
      awayTeam: 'Unknown',
      status: 'scheduled',
      startTime: new Date().toISOString()
    }
  }
}

// Helper function to get ordinal numbers (1st, 2nd, 3rd, etc.)
function getOrdinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

function mapGameStatus(statusCode: string): 'scheduled' | 'live' | 'final' {
  const liveStatuses = ['I', 'IR', 'IT', 'IH', 'IP', 'IS', 'IW', 'ID', 'MA', 'PO', 'Live']
  const finalStatuses = ['F', 'FT', 'FR', 'FG', 'O', 'C', 'Final']
  
  // Handle both status codes and detailed states
  const status = statusCode?.toUpperCase()
  
  if (status?.includes('LIVE') || status?.includes('INNING') || liveStatuses.includes(statusCode)) {
    return 'live'
  }
  if (status?.includes('FINAL') || status?.includes('GAME OVER') || finalStatuses.includes(statusCode)) {
    return 'final'
  }
  return 'scheduled'
}

// Mock data for development/fallback
function getMockGames(): Game[] {
  return [
    {
      id: '1',
      homeTeam: 'New York Yankees',
      awayTeam: 'Boston Red Sox',
      homeScore: 7,
      awayScore: 4,
      status: 'final',
      startTime: new Date().toISOString(),
      venue: 'Yankee Stadium',
      weather: 'Partly Cloudy',
      temperature: '72°F',
      wind: '5 mph SW',
      homeRecord: '95-67',
      awayRecord: '78-84',
      attendance: 47309,
      lineScore: {
        innings: [
          { away: 0, home: 2 },
          { away: 1, home: 0 },
          { away: 0, home: 3 },
          { away: 2, home: 0 },
          { away: 1, home: 2 },
          { away: 0, home: 0 },
          { away: 0, home: 0 },
          { away: 0, home: 0 },
          { away: 0, home: 0 }
        ],
        totals: {
          runs: { away: 4, home: 7 },
          hits: { away: 8, home: 12 },
          errors: { away: 1, home: 0 }
        }
      },
      probablePitchers: {
        home: 'G. Cole (13-8, 3.41 ERA)',
        away: 'B. Kutter (8-12, 4.15 ERA)'
      }
    },
    {
      id: '2',
      homeTeam: 'Los Angeles Dodgers',
      awayTeam: 'San Francisco Giants',
      homeScore: 3,
      awayScore: 2,
      status: 'live',
      inning: 'Bot 7th',
      startTime: new Date().toISOString(),
      venue: 'Dodger Stadium',
      weather: 'Clear',
      temperature: '78°F',
      wind: '8 mph W',
      homeRecord: '100-62',
      awayRecord: '80-82',
      lastPlay: 'M. Betts singles to right field',
      attendance: 52005,
      lineScore: {
        innings: [
          { away: 0, home: 1 },
          { away: 1, home: 0 },
          { away: 0, home: 0 },
          { away: 1, home: 2 },
          { away: 0, home: 0 },
          { away: 0, home: 0 },
          { away: 0, home: 0 }
        ],
        totals: {
          runs: { away: 2, home: 3 },
          hits: { away: 6, home: 8 },
          errors: { away: 0, home: 1 }
        }
      },
      probablePitchers: {
        home: 'W. Buehler (8-4, 2.95 ERA)',
        away: 'L. Webb (11-10, 3.47 ERA)'
      }
    },
    {
      id: '3',
      homeTeam: 'Houston Astros',
      awayTeam: 'Texas Rangers',
      status: 'scheduled',
      startTime: new Date(Date.now() + 3600000).toISOString(),
      venue: 'Minute Maid Park',
      weather: 'Dome',
      temperature: '72°F',
      homeRecord: '88-74',
      awayRecord: '78-84',
      probablePitchers: {
        home: 'F. Valdez (15-7, 2.91 ERA)',
        away: 'N. Eovaldi (12-8, 3.64 ERA)'
      }
    }
  ]
}

// Alternative APIs you can use:

// 1. ESPN API (free)
export async function fetchGamesFromESPN(): Promise<Game[]> {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard')
    const data = await response.json()
    
    return data.events?.map((event: any) => ({
      id: event.id,
      homeTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.team.displayName,
      awayTeam: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.team.displayName,
      homeScore: event.competitions[0].competitors.find((c: any) => c.homeAway === 'home')?.score,
      awayScore: event.competitions[0].competitors.find((c: any) => c.homeAway === 'away')?.score,
      status: event.status.type.completed ? 'final' : event.status.type.state === 'in' ? 'live' : 'scheduled',
      startTime: event.date,
    })) || []
  } catch (error) {
    console.error('Error fetching from ESPN:', error)
    return []
  }
}

// 2. If you have an API key for a premium service, add it here:
export async function fetchGamesWithAPIKey(apiKey: string): Promise<Game[]> {
  try {
    // Example for RapidAPI or similar services
    const response = await fetch('https://api.example.com/mlb/games/today', {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    // Transform according to the API's response format
    return data.games || []
  } catch (error) {
    console.error('Error fetching with API key:', error)
    return []
  }
}

// Enhanced function to fetch comprehensive game details with live stats and box score
export async function fetchGameDetails(gameId: string): Promise<Game | null> {
  try {
    console.log('Fetching detailed game data for:', gameId)
    
    // Fetch comprehensive game feed with all live data
    const feedResponse = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gameId}/feed/live`)
    const feedData = await feedResponse.json()
    
    if (!feedData.gameData) {
      console.warn('No detailed game data found for game:', gameId)
      return null
    }

    const game = feedData.gameData
    const liveData = feedData.liveData || {}
    const boxScore = liveData.boxscore || {}
    const plays = liveData.plays || {}
    
    console.log('Full game data structure keys:', Object.keys(feedData))

    return {
      id: gameId,
      homeTeam: game.teams?.home?.name || 'Home Team',
      awayTeam: game.teams?.away?.name || 'Away Team',
      homeScore: liveData.linescore?.teams?.home?.runs,
      awayScore: liveData.linescore?.teams?.away?.runs,
      status: mapGameStatus(game.status?.statusCode || game.status?.detailedState || ''),
      inning: liveData.linescore && (game.status?.statusCode === 'I' || game.status?.detailedState?.includes('Inning')) ? 
        `${liveData.linescore.inningHalf || 'Top'} ${liveData.linescore.currentInning}` : 
        game.status?.detailedState?.includes('Final') ? undefined : game.status?.detailedState,
      startTime: game.datetime?.dateTime || '',
      venue: game.venue?.name,
      weather: game.weather ? 
        `${game.weather.condition}, ${game.weather.temp}°F` : 
        undefined,
      temperature: game.weather?.temp ? `${game.weather.temp}°F` : undefined,
      wind: game.weather?.wind,
      homeRecord: game.teams?.home?.record ? 
        `${game.teams.home.record.wins}-${game.teams.home.record.losses}` : 
        undefined,
      awayRecord: game.teams?.away?.record ? 
        `${game.teams.away.record.wins}-${game.teams.away.record.losses}` : 
        undefined,
      probablePitchers: {
        home: game.probablePitchers?.home?.fullName,
        away: game.probablePitchers?.away?.fullName
      },
      attendance: game.venue?.capacity,
      lineScore: liveData.linescore ? {
        innings: (liveData.linescore.innings || []).map((inning: any) => ({
          home: inning.home?.runs,
          away: inning.away?.runs
        })),
        totals: {
          runs: {
            home: liveData.linescore.teams?.home?.runs,
            away: liveData.linescore.teams?.away?.runs
          },
          hits: {
            home: liveData.linescore.teams?.home?.hits,
            away: liveData.linescore.teams?.away?.hits
          },
          errors: {
            home: liveData.linescore.teams?.home?.errors,
            away: liveData.linescore.teams?.away?.errors
          }
        }
      } : undefined,
      lastPlay: plays.currentPlay?.result?.description,
      boxScore: boxScore.teams ? {
        teams: {
          home: transformTeamStats(boxScore.teams.home, game.teams?.home?.name || 'Home'),
          away: transformTeamStats(boxScore.teams.away, game.teams?.away?.name || 'Away')
        }
      } : undefined,
      liveData: {
        plays: transformPlays(plays.allPlays || []),
        currentPlay: plays.currentPlay?.result?.description,
        inningState: liveData.linescore?.inningHalf,
        balls: liveData.linescore?.balls,
        strikes: liveData.linescore?.strikes,
        outs: liveData.linescore?.outs
      }
    }
  } catch (error) {
    console.error('Error fetching game details:', error)
    return null
  }
}

function transformTeamStats(teamData: any, teamName: string): TeamStats {
  const batters = teamData?.players ? Object.values(teamData.players).filter((p: any) => p.stats?.batting) : []
  // Only show pitchers who have actually pitched (have innings pitched > 0)
  const pitchers = teamData?.players ? Object.values(teamData.players).filter((p: any) => 
    p.stats?.pitching && 
    (parseFloat(p.stats.pitching.inningsPitched) > 0 || p.stats.pitching.numberOfPitches > 0)
  ) : []
  
  return {
    teamName,
    battingOrder: batters
      .filter((player: any) => player.battingOrder || player.stats?.batting?.plateAppearances > 0)
      .map((player: any, index: number) => ({
        id: player.person?.id?.toString() || '',
        name: player.person?.fullName || 'Unknown Player',
        position: player.position?.abbreviation || '',
        battingOrder: player.battingOrder || index + 1,
        atBats: player.stats?.batting?.atBats || 0,
        runs: player.stats?.batting?.runs || 0,
        hits: player.stats?.batting?.hits || 0,
        rbi: player.stats?.batting?.rbi || 0,
        baseOnBalls: player.stats?.batting?.baseOnBalls || 0,
        strikeOuts: player.stats?.batting?.strikeOuts || 0,
        avg: player.seasonStats?.batting?.avg || '.000',
        ops: player.seasonStats?.batting?.ops || '.000',
        plateAppearances: player.stats?.batting?.plateAppearances || 0
      })).sort((a, b) => (a.battingOrder || 0) - (b.battingOrder || 0)),
    
    pitchers: pitchers.map((pitcher: any) => ({
      id: pitcher.person?.id?.toString() || '',
      name: pitcher.person?.fullName || 'Unknown Pitcher',
      inningsPitched: pitcher.stats?.pitching?.inningsPitched || '0.0',
      hits: pitcher.stats?.pitching?.hits || 0,
      runs: pitcher.stats?.pitching?.runs || 0,
      earnedRuns: pitcher.stats?.pitching?.earnedRuns || 0,
      baseOnBalls: pitcher.stats?.pitching?.baseOnBalls || 0,
      strikeOuts: pitcher.stats?.pitching?.strikeOuts || 0,
      homeRuns: pitcher.stats?.pitching?.homeRuns || 0,
      era: pitcher.seasonStats?.pitching?.era || '0.00',
      pitches: pitcher.stats?.pitching?.numberOfPitches || 0,
      strikes: pitcher.stats?.pitching?.strikes || 0,
      gameScore: pitcher.stats?.pitching?.gameScore,
      isCurrentPitcher: pitcher.gameStatus?.isCurrentPitcher
    })),
    
    teamTotals: {
      runs: teamData?.teamStats?.batting?.runs || 0,
      hits: teamData?.teamStats?.batting?.hits || 0,
      errors: teamData?.teamStats?.fielding?.errors || 0,
      leftOnBase: teamData?.teamStats?.batting?.leftOnBase || 0
    }
  }
}

function transformPlays(plays: any[]): PlayByPlay[] {
  return plays.slice(-10).map((play: any) => ({
    inning: play.about?.inning || 0,
    halfInning: play.about?.halfInning || '',
    description: play.result?.description || '',
    result: play.result?.type,
    balls: play.count?.balls,
    strikes: play.count?.strikes,
    outs: play.count?.outs
  }))
}