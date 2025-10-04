// Team logo mapping utility
import { getLeagueConfig, DEFAULT_LEAGUE } from './config'

export function getTeamLogo(teamName: string, leagueId: string = DEFAULT_LEAGUE): string {
  const leagueConfig = getLeagueConfig(leagueId)
  if (!leagueConfig) {
    return '/logos/mlb/MLB.png' // Fallback for unknown league
  }

  // Normalize team name to match logo file names
  const normalizedName = normalizeTeamName(teamName, leagueId)
  
  // Return team logo if available, otherwise fallback to league logo
  if (normalizedName) {
    return `${leagueConfig.logoPath}/${normalizedName}.png`
  }
  return leagueConfig.defaultLogo
}

export function getTeamAbbreviation(teamName: string, leagueId: string = DEFAULT_LEAGUE): string {
  if (leagueId === 'mlb') {
    return getMLBAbbreviation(teamName)
  } else if (leagueId === 'nfl') {
    return getNFLAbbreviation(teamName)
  }
  // Add other league abbreviation functions here
  return teamName.substring(0, 3).toUpperCase()
}

function normalizeTeamName(teamName: string, leagueId: string): string {
  if (leagueId === 'mlb') {
    return normalizeMLBTeamName(teamName)
  } else if (leagueId === 'nfl') {
    return normalizeNFLTeamName(teamName)
  }
  // Add other league normalization functions here
  return ''
}

function normalizeMLBTeamName(teamName: string): string {
  // Convert team names to logo file naming convention
  const nameMap: { [key: string]: string } = {
    'Boston Red Sox': 'BOS_RED',
    'New York Yankees': 'NEW_YAN',
    'Detroit Tigers': 'DET_TIG',
    'Cleveland Guardians': 'CLE_GUA',
    'San Diego Padres': 'SAN_PAD',
    'Chicago Cubs': 'CHI_CUB',
    'Houston Astros': 'HOU_AST',
    'Texas Rangers': 'TEX_RAN',
    'Los Angeles Dodgers': 'LOS_DOD',
    'San Francisco Giants': 'SF_GIA',
    'Atlanta Braves': 'ATL_BRA',
    'New York Mets': 'NY_MET',
    'Philadelphia Phillies': 'PHI_PHI',
    'Milwaukee Brewers': 'MIL_BRE',
    'Arizona Diamondbacks': 'ARI_DIA',
    'Colorado Rockies': 'COL_ROC',
    'Miami Marlins': 'MIA_MAR',
    'Washington Nationals': 'WAS_NAT',
    'Pittsburgh Pirates': 'PIT_PIR',
    'Cincinnati Reds': 'CIN_RED',
    'St. Louis Cardinals': 'STL_CAR',
    'Chicago White Sox': 'CHI_WHI',
    'Minnesota Twins': 'MIN_TWI',
    'Kansas City Royals': 'KC_ROY',
    'Oakland Athletics': 'OAK_ATH',
    'Los Angeles Angels': 'LA_ANG',
    'Seattle Mariners': 'SEA_MAR',
    'Baltimore Orioles': 'BAL_ORI',
    'Tampa Bay Rays': 'TB_RAY',
    'Toronto Blue Jays': 'TOR_BLU'
  }
  
  return nameMap[teamName] || ''
}

function getMLBAbbreviation(teamName: string): string {
  const abbreviationMap: { [key: string]: string } = {
    'Boston Red Sox': 'BOS',
    'New York Yankees': 'NYY',
    'Detroit Tigers': 'DET',
    'Cleveland Guardians': 'CLE',
    'San Diego Padres': 'SD',
    'Chicago Cubs': 'CHC',
    'Houston Astros': 'HOU',
    'Texas Rangers': 'TEX',
    'Los Angeles Dodgers': 'LAD',
    'San Francisco Giants': 'SF',
    'Atlanta Braves': 'ATL',
    'New York Mets': 'NYM',
    'Philadelphia Phillies': 'PHI',
    'Milwaukee Brewers': 'MIL',
    'Arizona Diamondbacks': 'ARI',
    'Colorado Rockies': 'COL',
    'Miami Marlins': 'MIA',
    'Washington Nationals': 'WSH',
    'Pittsburgh Pirates': 'PIT',
    'Cincinnati Reds': 'CIN',
    'St. Louis Cardinals': 'STL',
    'Chicago White Sox': 'CWS',
    'Minnesota Twins': 'MIN',
    'Kansas City Royals': 'KC',
    'Oakland Athletics': 'OAK',
    'Los Angeles Angels': 'LAA',
    'Seattle Mariners': 'SEA',
    'Baltimore Orioles': 'BAL',
    'Tampa Bay Rays': 'TB',
    'Toronto Blue Jays': 'TOR'
  }
  
  return abbreviationMap[teamName] || teamName.substring(0, 3).toUpperCase()
}

function normalizeNFLTeamName(teamName: string): string {
  // Convert NFL team names to logo file naming convention
  const nameMap: { [key: string]: string } = {
    'Arizona Cardinals': 'ARI_CAR',
    'Atlanta Falcons': 'ATL_FAL',
    'Baltimore Ravens': 'BAL_RAV',
    'Buffalo Bills': 'BUF_BIL',
    'Carolina Panthers': 'CAR_PAN',
    'Chicago Bears': 'CHI_BEA',
    'Cincinnati Bengals': 'CIN_BEN',
    'Cleveland Browns': 'CLE_BRO',
    'Dallas Cowboys': 'DAL_COW',
    'Denver Broncos': 'DEN_BRO',
    'Detroit Lions': 'DET_LIO',
    'Green Bay Packers': 'GRE_PAC',
    'Houston Texans': 'HOU_TEX',
    'Indianapolis Colts': 'IND_COL',
    'Jacksonville Jaguars': 'JAX_JAG',
    'Kansas City Chiefs': 'KC_CHI',
    'Las Vegas Raiders': 'LV_RAI',
    'Los Angeles Chargers': 'LAC_CHA',
    'Los Angeles Rams': 'LAR_RAM',
    'Miami Dolphins': 'MIA_DOL',
    'Minnesota Vikings': 'MIN_VIK',
    'New England Patriots': 'NE_PAT',
    'New Orleans Saints': 'NO_SAI',
    'New York Giants': 'NYG_GIA',
    'New York Jets': 'NEW_JET',
    'Philadelphia Eagles': 'PHI_EAG',
    'Pittsburgh Steelers': 'PIT_STE',
    'San Francisco 49ers': 'SAN_49E',
    'Seattle Seahawks': 'SEA_SEA',
    'Tampa Bay Buccaneers': 'TAM_BUC',
    'Tennessee Titans': 'TEN_TIT',
    'Washington Commanders': 'WAS_COM'
  }
  
  return nameMap[teamName] || ''
}

function getNFLAbbreviation(teamName: string): string {
  const abbreviationMap: { [key: string]: string } = {
    'Arizona Cardinals': 'ARI',
    'Atlanta Falcons': 'ATL',
    'Baltimore Ravens': 'BAL',
    'Buffalo Bills': 'BUF',
    'Carolina Panthers': 'CAR',
    'Chicago Bears': 'CHI',
    'Cincinnati Bengals': 'CIN',
    'Cleveland Browns': 'CLE',
    'Dallas Cowboys': 'DAL',
    'Denver Broncos': 'DEN',
    'Detroit Lions': 'DET',
    'Green Bay Packers': 'GB',
    'Houston Texans': 'HOU',
    'Indianapolis Colts': 'IND',
    'Jacksonville Jaguars': 'JAX',
    'Kansas City Chiefs': 'KC',
    'Las Vegas Raiders': 'LV',
    'Los Angeles Chargers': 'LAC',
    'Los Angeles Rams': 'LAR',
    'Miami Dolphins': 'MIA',
    'Minnesota Vikings': 'MIN',
    'New England Patriots': 'NE',
    'New Orleans Saints': 'NO',
    'New York Giants': 'NYG',
    'New York Jets': 'NYJ',
    'Philadelphia Eagles': 'PHI',
    'Pittsburgh Steelers': 'PIT',
    'San Francisco 49ers': 'SF',
    'Seattle Seahawks': 'SEA',
    'Tampa Bay Buccaneers': 'TB',
    'Tennessee Titans': 'TEN',
    'Washington Commanders': 'WAS'
  }
  
  return abbreviationMap[teamName] || teamName.substring(0, 3).toUpperCase()
}