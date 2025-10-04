// NFL API implementation using ESPN API
import { Game, Broadcast } from './api'

export async function fetchNFLGamesByDate(date: string): Promise<Game[]> {
  try {
    console.log('NFL API: Fetching games for date:', date)
    
    // ESPN NFL API endpoint
    const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${date.replace(/-/g, '')}`
    console.log('NFL API URL:', apiUrl)
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error(`NFL API fetch failed: ${response.status} ${response.statusText}`)
      throw new Error(`NFL API fetch failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('NFL API response:', data.events?.length || 0, 'events found')
    
    if (!data.events || data.events.length === 0) {
      console.log('No NFL events found for date:', date)
      return []
    }
    
    const games: Game[] = data.events.map((event: any) => {
      const competition = event.competitions?.[0]
      const competitors = competition?.competitors || []
      
      const homeCompetitor = competitors.find((c: any) => c.homeAway === 'home')
      const awayCompetitor = competitors.find((c: any) => c.homeAway === 'away')
      
      // Map ESPN status to our status format
      let status: 'scheduled' | 'live' | 'final' = 'scheduled'
      const espnStatus = competition?.status?.type?.name?.toLowerCase()
      
      if (espnStatus?.includes('final') || espnStatus === 'status_final') {
        status = 'final'
      } else if (espnStatus?.includes('progress') || espnStatus?.includes('live')) {
        status = 'live'
      }
      
      const gameData = {
        id: event.id,
        homeTeam: homeCompetitor?.team?.displayName || 'TBD',
        awayTeam: awayCompetitor?.team?.displayName || 'TBD',
        homeScore: homeCompetitor?.score ? parseInt(homeCompetitor.score) : undefined,
        awayScore: awayCompetitor?.score ? parseInt(awayCompetitor.score) : undefined,
        status,
        startTime: event.date || competition?.date || competition?.startDate || new Date().toISOString(),
        venue: competition?.venue?.fullName,
        // NFL-specific fields
        inning: competition?.status?.period ? `Q${competition.status.period}` : undefined,
        period: competition?.status?.period,
        clock: competition?.status?.displayClock,
        homeRecord: homeCompetitor?.records?.find((r: any) => r.name === 'overall')?.summary,
        awayRecord: awayCompetitor?.records?.find((r: any) => r.name === 'overall')?.summary,
        // Line score (quarter scores)
        lineScore: parseNFLLineScore(homeCompetitor, awayCompetitor),
        league: 'nfl'
      }
      
      console.log('NFL venue for', event.name, ':', competition?.venue?.fullName)
      return gameData
    })
    
    console.log('NFL API: Returning', games.length, 'games')
    return games
    
  } catch (error) {
    console.error('Error fetching NFL games:', error)
    return []
  }
}

export async function fetchNFLGameDetails(gameId: string): Promise<Game | null> {
  try {
    console.log('NFL API: Fetching game details for:', gameId)
    
    // Use the summary endpoint for detailed game data
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`)
    
    if (!response.ok) {
      console.error(`NFL game details fetch failed: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    // ESPN summary endpoint structure is different
    const boxscore = data.boxscore
    const gameInfo = data.gameInfo
    const header = data.header
    
    // Try to get competition data from different possible locations
    let competition = header?.competition
    if (!competition && header?.competitions) {
      competition = header.competitions[0]
    }
    if (!competition && boxscore?.teams) {
      // Construct competition-like object from boxscore
      const teams = boxscore.teams
      competition = {
        competitors: teams.map((team: any) => ({
          homeAway: team.homeAway,
          team: team.team,
          score: team.statistics?.find((stat: any) => stat.name === 'totalPoints')?.displayValue || '0',
          records: team.records,
          linescores: team.linescores
        })),
        status: header?.competition?.status || { type: { name: 'STATUS_SCHEDULED' } },
        date: gameInfo?.date || new Date().toISOString()
      }
    }
    
    if (!competition) {
      console.error('No competition data found in NFL game details')
      console.log('Available data structure:', Object.keys(data))
      return null
    }
    
    const competitors = competition.competitors || []
    const homeCompetitor = competitors.find((c: any) => c.homeAway === 'home')
    const awayCompetitor = competitors.find((c: any) => c.homeAway === 'away')
    
    // Map status
    let status: 'scheduled' | 'live' | 'final' = 'scheduled'
    const espnStatus = competition.status?.type?.name?.toLowerCase()
    
    if (espnStatus?.includes('final')) {
      status = 'final'
    } else if (espnStatus?.includes('progress') || espnStatus?.includes('live')) {
      status = 'live'
    }
    
    // Parse live plays from drives data
    let livePlays: any[] = []
    if (data.drives?.previous) {
      // Get plays from the most recent drives
      const recentDrives = data.drives.previous.slice(-3) // Last 3 drives
      livePlays = []
      recentDrives.forEach((drive: any) => {
        if (drive.plays) {
          livePlays.push(...drive.plays.slice(-5)) // Last 5 plays per drive
        }
      })
      livePlays = parseNFLLivePlays(livePlays)
    }
    
    return {
      id: gameId,
      homeTeam: homeCompetitor?.team?.displayName || 'TBD',
      awayTeam: awayCompetitor?.team?.displayName || 'TBD',
      homeScore: homeCompetitor?.score ? parseInt(homeCompetitor.score) : undefined,
      awayScore: awayCompetitor?.score ? parseInt(awayCompetitor.score) : undefined,
      status,
      startTime: competition.date || new Date().toISOString(),
      venue: gameInfo?.venue?.fullName,
      period: competition.status?.period,
      clock: competition.status?.displayClock,
      homeRecord: homeCompetitor?.records?.find((r: any) => r.name === 'overall')?.summary,
      awayRecord: awayCompetitor?.records?.find((r: any) => r.name === 'overall')?.summary,
      lineScore: parseNFLLineScore(homeCompetitor, awayCompetitor),
      livePlays,
      league: 'nfl',
      // Add boxScore data structure for compatibility with BoxScore component
      boxScore: boxscore && boxscore.teams ? {
        teams: {
          home: {
            teamName: homeCompetitor?.team?.displayName || 'TBD',
            battingOrder: [], // NFL doesn't have batting order
            pitchers: [], // NFL doesn't have pitchers
            teamTotals: {
              runs: homeCompetitor?.score ? parseInt(homeCompetitor.score) : 0,
              hits: 0, // NFL doesn't track hits
              errors: 0, // NFL doesn't track errors like baseball
              leftOnBase: 0 // NFL doesn't track this
            },
            nflStats: {
              totalYards: findStatValue(homeCompetitor?.statistics, 'totalYards') || 0,
              passingYards: findStatValue(homeCompetitor?.statistics, 'passingYards') || 0,
              rushingYards: findStatValue(homeCompetitor?.statistics, 'rushingYards') || 0,
              turnovers: findStatValue(homeCompetitor?.statistics, 'turnovers') || 0,
              penalties: findStatValue(homeCompetitor?.statistics, 'penalties') || 0,
              timeOfPossession: findStatDisplayValue(homeCompetitor?.statistics, 'possessionTime') || '00:00'
            }
          },
          away: {
            teamName: awayCompetitor?.team?.displayName || 'TBD',
            battingOrder: [],
            pitchers: [],
            teamTotals: {
              runs: awayCompetitor?.score ? parseInt(awayCompetitor.score) : 0,
              hits: 0,
              errors: 0,
              leftOnBase: 0
            },
            nflStats: {
              totalYards: findStatValue(awayCompetitor?.statistics, 'totalYards') || 0,
              passingYards: findStatValue(awayCompetitor?.statistics, 'passingYards') || 0,
              rushingYards: findStatValue(awayCompetitor?.statistics, 'rushingYards') || 0,
              turnovers: findStatValue(awayCompetitor?.statistics, 'turnovers') || 0,
              penalties: findStatValue(awayCompetitor?.statistics, 'penalties') || 0,
              timeOfPossession: findStatDisplayValue(awayCompetitor?.statistics, 'possessionTime') || '00:00'
            }
          }
        }
      } : undefined,
      // Add liveData structure for compatibility with LivePlaysTab component
      liveData: livePlays.length > 0 ? {
        plays: livePlays,
        currentPlay: livePlays[0]?.description
      } : undefined
    }
    
  } catch (error) {
    console.error('Error fetching NFL game details:', error)
    return null
  }
}

// Helper function to parse NFL line score (quarter scores)
function parseNFLLineScore(homeCompetitor: any, awayCompetitor: any): any {
  if (!homeCompetitor?.linescores || !awayCompetitor?.linescores) return null
  
  try {
    const quarters: Array<{ home?: number; away?: number }> = []
    const maxQuarters = Math.max(homeCompetitor.linescores.length, awayCompetitor.linescores.length)
    
    for (let i = 0; i < maxQuarters; i++) {
      quarters.push({
        home: homeCompetitor.linescores[i]?.displayValue ? parseInt(homeCompetitor.linescores[i].displayValue) : undefined,
        away: awayCompetitor.linescores[i]?.displayValue ? parseInt(awayCompetitor.linescores[i].displayValue) : undefined
      })
    }
    
    return {
      quarters,
      totals: {
        home: homeCompetitor.score ? parseInt(homeCompetitor.score) : undefined,
        away: awayCompetitor.score ? parseInt(awayCompetitor.score) : undefined
      }
    }
  } catch (error) {
    console.error('Error parsing NFL line score:', error)
    return null
  }
}

// Helper function to parse NFL live plays
function parseNFLLivePlays(plays: any[]): any[] {
  if (!plays || !Array.isArray(plays)) return []
  
  try {
    return plays.slice(0, 10).map((play: any) => ({
      id: play.id,
      quarter: play.period?.number, // Map period to quarter
      time: play.clock?.displayValue, // Map clock to time
      down: play.start?.down,
      distance: play.start?.distance,
      yardLine: play.start?.yardLine,
      description: play.text,
      type: play.type?.text
    }))
  } catch (error) {
    console.error('Error parsing NFL live plays:', error)
    return []
  }
}

// Helper function to find stat value by name
function findStatValue(statistics: any[], statName: string): number | undefined {
  if (!statistics || !Array.isArray(statistics)) return undefined
  const stat = statistics.find((s: any) => s.name === statName || s.abbreviation === statName)
  return stat?.value ? parseInt(stat.value) : undefined
}

// Helper function to find stat display value by name
function findStatDisplayValue(statistics: any[], statName: string): string | undefined {
  if (!statistics || !Array.isArray(statistics)) return undefined
  const stat = statistics.find((s: any) => s.name === statName || s.abbreviation === statName)
  return stat?.displayValue
}

// Function to fetch broadcast data for NFL games
export async function fetchNFLBroadcastsByDate(date: string): Promise<{ [gameId: string]: Broadcast[] }> {
  try {
    console.log('Fetching NFL broadcasts for date:', date)
    
    // ESPN NFL API endpoint with date
    const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${date.replace(/-/g, '')}`
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error(`NFL broadcast fetch failed: ${response.status} ${response.statusText}`)
      throw new Error(`NFL broadcast fetch failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('NFL Broadcast API response:', data)
    
    const events = data.events || []
    const broadcastData: { [gameId: string]: Broadcast[] } = {}
    
    events.forEach((event: any) => {
      const competition = event.competitions?.[0]
      if (competition?.broadcasts && competition.broadcasts.length > 0) {
        broadcastData[event.id] = competition.broadcasts.map((broadcast: any) => ({
          id: broadcast.type?.id || broadcast.market?.id || Math.random().toString(),
          name: broadcast.market?.type || broadcast.media?.shortName || 'Unknown',
          type: broadcast.type?.shortName || broadcast.type || 'TV',
          language: broadcast.lang || 'en',
          isNational: broadcast.market?.type === 'National' || !broadcast.market?.id,
          callSign: broadcast.media?.shortName || broadcast.names?.[0] || '',
          market: broadcast.market?.type
        }))
      }
    })
    
    return broadcastData
  } catch (error) {
    console.error('Error fetching NFL broadcast data:', error)
    return {}
  }
}