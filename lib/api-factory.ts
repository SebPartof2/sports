// Base API interface for different sports
import { getLeagueConfig, LeagueConfig } from './config'

export interface BaseGame {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  status: 'scheduled' | 'live' | 'final'
  startTime: string
  league: string
}

export interface APIProvider {
  fetchGames(date: string): Promise<BaseGame[]>
  fetchGameDetails(gameId: string): Promise<BaseGame | null>
}

// Factory function to get the appropriate API provider
export function getAPIProvider(leagueId: string): APIProvider {
  const config = getLeagueConfig(leagueId)
  if (!config) {
    throw new Error(`No configuration found for league: ${leagueId}`)
  }

  switch (leagueId) {
    case 'mlb':
      return new MLBAPIProvider(config)
    case 'nba':
      return new NBAAPIProvider(config)
    case 'nfl':
      return new NFLAPIProvider(config)
    default:
      throw new Error(`No API provider implemented for league: ${leagueId}`)
  }
}

// MLB API Provider (existing implementation)
class MLBAPIProvider implements APIProvider {
  constructor(private config: LeagueConfig) {}

  async fetchGames(date: string): Promise<BaseGame[]> {
    // Import existing MLB implementation
    const { fetchGamesByDate } = await import('./mlb-api')
    const games = await fetchGamesByDate(date)
    return games.map((game: any) => ({
      ...game,
      league: 'mlb'
    }))
  }

  async fetchGameDetails(gameId: string): Promise<BaseGame | null> {
    const { fetchGameDetails } = await import('./mlb-api')
    const game = await fetchGameDetails(gameId)
    return game ? { ...game, league: 'mlb' } : null
  }
}

// Placeholder API providers for future sports
class NBAAPIProvider implements APIProvider {
  constructor(private config: LeagueConfig) {}

  async fetchGames(date: string): Promise<BaseGame[]> {
    // TODO: Implement NBA API
    console.log('NBA API not implemented yet')
    return []
  }

  async fetchGameDetails(gameId: string): Promise<BaseGame | null> {
    // TODO: Implement NBA API
    console.log('NBA API not implemented yet')
    return null
  }
}

class NFLAPIProvider implements APIProvider {
  constructor(private config: LeagueConfig) {}

  async fetchGames(date: string): Promise<BaseGame[]> {
    // TODO: Implement NFL API
    console.log('NFL API not implemented yet')
    return []
  }

  async fetchGameDetails(gameId: string): Promise<BaseGame | null> {
    // TODO: Implement NFL API
    console.log('NFL API not implemented yet')
    return null
  }
}