// NFL API implementation using ESPN API
import { Game } from './api'

// Utility function to get local date as YYYY-MM-DD string
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function fetchNFLGamesByDate(date: string): Promise<Game[]> {
  try {
    console.log('Fetching NFL games for date:', date)
    
    // ESPN NFL API endpoint
    const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${date.replace(/-/g, '')}`
    console.log('NFL API URL:', apiUrl)
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error(`NFL API fetch failed: ${response.status} ${response.statusText}`)
      throw new Error(`NFL API fetch failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('NFL API response structure:', {
      hasEvents: !!data.events,
      eventsCount: data.events?.length || 0,
      sampleEvent: data.events?.[0]
    })
    
    const events = data.events || []
    console.log('NFL events found:', events.length)
    
    const games: Game[] = events.map((event: any) => {
      const competition = event.competitions?.[0]
      const competitors = competition?.competitors || []
      
      console.log('Processing NFL event:', {
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        competitors: competitors.length,
        homeTeam: competitors.find((c: any) => c.homeAway === 'home')?.team?.displayName,
        awayTeam: competitors.find((c: any) => c.homeAway === 'away')?.team?.displayName
      })
      
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
        homeRecord: homeCompetitor?.records?.find((r: any) => r.name === 'overall')?.summary,
        awayRecord: awayCompetitor?.records?.find((r: any) => r.name === 'overall')?.summary,
        league: 'nfl'
      }
      
      console.log('Processed NFL game data:', gameData)
      return gameData
    })
    
    console.log('Processed NFL games:', games)
    return games
    
  } catch (error) {
    console.error('Error fetching NFL games:', error)
    return []
  }
}

export async function fetchNFLGameDetails(gameId: string): Promise<Game | null> {
  try {
    console.log('Fetching NFL game details for:', gameId)
    
    // Use the summary endpoint for game details (not game endpoint)
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`)
    
    if (!response.ok) {
      console.error(`NFL game details fetch failed: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    console.log('NFL game details API response:', data)
    
    // Extract game data from the game endpoint structure
    const gameInfo = data.gamepackageJSON || data
    const header = gameInfo.header || data.header
    const competition = header?.competition || header?.competitions?.[0]
    const competitors = competition?.competitors || []
    
    const homeCompetitor = competitors.find((c: any) => c.homeAway === 'home')
    const awayCompetitor = competitors.find((c: any) => c.homeAway === 'away')
    
    let status: 'scheduled' | 'live' | 'final' = 'scheduled'
    const espnStatus = competition?.status?.type?.name?.toLowerCase()
    
    if (espnStatus?.includes('final') || espnStatus === 'status_final') {
      status = 'final'
    } else if (espnStatus?.includes('progress') || espnStatus?.includes('live')) {
      status = 'live'
    }
    
    // Get proper start time
    const gameDate = competition?.date || 
                    competition?.startDate || 
                    header?.timeValid || 
                    new Date().toISOString()
    
    // Parse box score data
    const boxScore = parseNFLBoxScore(data.boxscore)
    
    // Parse live plays data
    const liveData = parseNFLLivePlays(data.drives)
    
    // Parse line score (quarters instead of innings)
    const lineScore = parseNFLLineScore(homeCompetitor, awayCompetitor)
    
    return {
      id: gameId,
      homeTeam: homeCompetitor?.team?.displayName || 'TBD',
      awayTeam: awayCompetitor?.team?.displayName || 'TBD',
      homeScore: homeCompetitor?.score ? parseInt(homeCompetitor.score) : undefined,
      awayScore: awayCompetitor?.score ? parseInt(awayCompetitor.score) : undefined,
      status,
      startTime: gameDate,
      venue: gameInfo?.venue?.fullName,
      inning: competition?.status?.period ? `Q${competition.status.period}` : undefined,
      homeRecord: homeCompetitor?.records?.find((r: any) => r.name === 'overall')?.summary,
      awayRecord: awayCompetitor?.records?.find((r: any) => r.name === 'overall')?.summary,
      league: 'nfl',
      // Add additional details that might be available from the summary endpoint
      attendance: competition?.attendance,
      weather: gameInfo.weather?.temperature ? `${gameInfo.weather.temperature}°F` : undefined,
      wind: gameInfo.weather?.wind,
      boxScore,
      liveData,
      lineScore,
      lastPlay: liveData?.currentPlay
    }
    
  } catch (error) {
    console.error('Error fetching NFL game details:', error)
    return null
  }
}

// Helper function to parse NFL box score data
function parseNFLBoxScore(boxscore: any): any {
  if (!boxscore?.teams) return null
  
  try {
    const teams = boxscore.teams
    const homeTeam = teams.find((team: any) => team.homeAway === 'home')
    const awayTeam = teams.find((team: any) => team.homeAway === 'away')
    
    // Convert NFL statistics to a format compatible with our interface
    const parseTeamStats = (team: any) => {
      const stats = team.statistics || []
      
      // NFL key stats
      const totalYards = stats.find((s: any) => s.name === 'totalYards')?.displayValue || '0'
      const passingYards = stats.find((s: any) => s.name === 'netPassingYards')?.displayValue || '0'
      const rushingYards = stats.find((s: any) => s.name === 'rushingYards')?.displayValue || '0'
      const turnovers = stats.find((s: any) => s.name === 'turnovers')?.displayValue || '0'
      const penalties = stats.find((s: any) => s.name === 'penaltyYards')?.displayValue || '0'
      const timeOfPossession = stats.find((s: any) => s.name === 'possessionTime')?.displayValue || '00:00'
      
      return {
        teamName: team.team?.displayName || 'Unknown',
        battingOrder: [], // Not applicable for NFL
        pitchers: [], // Not applicable for NFL
        teamTotals: {
          runs: parseInt(team.score) || 0, // Points for NFL
          hits: parseInt(totalYards) || 0, // Total yards as "hits"
          errors: parseInt(turnovers) || 0, // Turnovers as "errors"
          leftOnBase: parseInt(penalties) || 0 // Penalty yards
        },
        // NFL-specific stats
        nflStats: {
          totalYards: parseInt(totalYards) || 0,
          passingYards: parseInt(passingYards) || 0,
          rushingYards: parseInt(rushingYards) || 0,
          turnovers: parseInt(turnovers) || 0,
          penalties: parseInt(penalties) || 0,
          timeOfPossession
        }
      }
    }
    
    return {
      teams: {
        home: homeTeam ? parseTeamStats(homeTeam) : null,
        away: awayTeam ? parseTeamStats(awayTeam) : null
      }
    }
  } catch (error) {
    console.error('Error parsing NFL box score:', error)
    return null
  }
}

// Helper function to parse NFL line score (quarters)
function parseNFLLineScore(homeCompetitor: any, awayCompetitor: any): any {
  try {
    const homeLinescores = homeCompetitor?.linescores || []
    const awayLinescores = awayCompetitor?.linescores || []
    
    // Convert quarter scores to innings format
    const maxQuarters = Math.max(homeLinescores.length, awayLinescores.length, 4)
    const quarters = []
    
    for (let i = 0; i < maxQuarters; i++) {
      quarters.push({
        home: homeLinescores[i]?.displayValue || homeLinescores[i]?.value || 0,
        away: awayLinescores[i]?.displayValue || awayLinescores[i]?.value || 0
      })
    }
    
    return {
      innings: quarters, // Using "innings" for quarters to match interface
      totals: {
        runs: { 
          home: parseInt(homeCompetitor?.score) || 0, 
          away: parseInt(awayCompetitor?.score) || 0 
        },
        hits: { home: 0, away: 0 }, // Not applicable for NFL
        errors: { home: 0, away: 0 } // Could map to turnovers if available
      }
    }
  } catch (error) {
    console.error('Error parsing NFL line score:', error)
    return null
  }
}

// Helper function to parse NFL live plays/drives
function parseNFLLivePlays(drives: any): any {
  if (!drives?.current && !drives?.previous) return null
  
  try {
    const allDrives = [...(drives.previous || []), ...(drives.current ? [drives.current] : [])]
    const plays: any[] = []
    
    allDrives.forEach((drive: any) => {
      if (drive.plays) {
        drive.plays.forEach((play: any, index: number) => {
          plays.push({
            inning: drive.displayResult ? parseInt(drive.displayResult.split(' ')[0]) || 1 : 1,
            halfInning: drive.team?.displayName || 'Unknown',
            description: play.text || 'No description',
            result: play.statYardage ? `${play.statYardage} yards` : undefined,
            balls: undefined, // Not applicable for NFL
            strikes: undefined, // Not applicable for NFL
            outs: undefined // Not applicable for NFL
          })
        })
      }
    })
    
    // Get current play
    const currentPlay = drives.current?.plays?.slice(-1)[0]?.text || 
                       drives.previous?.slice(-1)[0]?.plays?.slice(-1)[0]?.text
    
    return {
      plays: plays.slice(-10), // Return last 10 plays
      currentPlay,
      inningState: undefined, // Not applicable for NFL
      balls: undefined,
      strikes: undefined,
      outs: undefined
    }
  } catch (error) {
    console.error('Error parsing NFL live plays:', error)
    return null
  }
}

export async function fetchTodaysNFLGames(): Promise<Game[]> {
  const todayString = getLocalDateString()
  return fetchNFLGamesByDate(todayString)
}