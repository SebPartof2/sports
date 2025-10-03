// Configuration for different sports and leagues
export interface LeagueConfig {
  id: string
  name: string
  displayName: string
  sport: string
  apiBaseUrl: string
  logoPath: string
  defaultLogo: string
  colors: {
    primary: string
    secondary: string
  }
}

export interface SportConfig {
  id: string
  name: string
  leagues: LeagueConfig[]
}

export const SPORTS_CONFIG: SportConfig[] = [
  {
    id: 'baseball',
    name: 'Baseball',
    leagues: [
      {
        id: 'mlb',
        name: 'mlb',
        displayName: 'Major League Baseball',
        sport: 'baseball',
        apiBaseUrl: 'https://statsapi.mlb.com/api/v1',
        logoPath: '/logos/mlb',
        defaultLogo: '/logos/mlb/MLB.png',
        colors: {
          primary: '#041E42',
          secondary: '#C41E3A'
        }
      }
    ]
  }
  // Additional sports will be added here when requested
]

export function getLeagueConfig(leagueId: string): LeagueConfig | undefined {
  for (const sport of SPORTS_CONFIG) {
    const league = sport.leagues.find(l => l.id === leagueId)
    if (league) return league
  }
  return undefined
}

export function getSportConfig(sportId: string): SportConfig | undefined {
  return SPORTS_CONFIG.find(s => s.id === sportId)
}

export const DEFAULT_LEAGUE = 'mlb'