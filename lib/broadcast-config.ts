// Configuration for broadcast logos and mappings
export interface BroadcastLogoConfig {
  callSign: string
  displayName: string
  logoPath: string
  type: 'tv' | 'radio'
  fallbackText?: string
}

export const BROADCAST_LOGOS: BroadcastLogoConfig[] = [
  // Television Networks
  {
    callSign: 'FOX',
    displayName: 'FOX',
    logoPath: '/logos/broadcasts/tv/FOX.png',
    type: 'tv'
  },
  {
    callSign: 'TBS',
    displayName: 'TBS',
    logoPath: '/logos/broadcasts/tv/tbs.png',
    type: 'tv'
  },
  {
    callSign: 'ESPN',
    displayName: 'ESPN',
    logoPath: '/logos/broadcasts/tv/espn.png',
    type: 'tv'
  },
  {
    callSign: 'HBO Max',
    displayName: 'HBO Max',
    logoPath: '/logos/broadcasts/tv/hbo-max.png',
    type: 'tv'
  },
  {
    callSign: 'FS1',
    displayName: 'FS1',
    logoPath: '/logos/broadcasts/tv/fs1.png',
    type: 'tv'
  },
  {
    callSign: 'MLB Network',
    displayName: 'MLB Network',
    logoPath: '/logos/broadcasts/tv/mlb-network.png',
    type: 'tv'
  },

  // Radio Stations
  {
    callSign: 'ESPN',
    displayName: 'ESPN Radio',
    logoPath: '/logos/broadcasts/radio/espn-radio.png',
    type: 'radio'
  },
  {
    callSign: 'WFAN',
    displayName: 'WFAN 660/101.9 FM',
    logoPath: '/logos/broadcasts/radio/wfan.png',
    type: 'radio'
  },
  {
    callSign: 'SN590',
    displayName: 'SN590',
    logoPath: '/logos/broadcasts/radio/SN590.png',
    type: 'radio'
  },
  {
    callSign: 'WSCR',
    displayName: '670 The Score',
    logoPath: '/logos/broadcasts/radio/670-the-score.png',
    type: 'radio'
  },
  {
    callSign: 'WTMJ',
    displayName: 'WTMJ 620',
    logoPath: '/logos/broadcasts/radio/wtmj-620.png',
    type: 'radio'
  },
  {
    callSign: 'KLAC AM570',
    displayName: 'Dodgers Radio AM570',
    logoPath: '/logos/broadcasts/radio/klac-am570.png',
    type: 'radio'
  },
  {
    callSign: 'WIP',
    displayName: '94 WIP',
    logoPath: '/logos/broadcasts/radio/94-wip.png',
    type: 'radio'
  },
  {
    callSign: 'KIRO 710AM',
    displayName: 'Seattle Sports (710 AM)',
    logoPath: '/logos/broadcasts/radio/kiro-710.png',
    type: 'radio'
  }
]

export const FALLBACK_LOGOS = {
  tv: '/logos/broadcasts/generic/MLBb.png',
  radio: '/logos/broadcasts/generic/MLBb.png',
  mlb: '/logos/broadcasts/generic/MLBb.png',
  nfl: '/logos/broadcasts/generic/NFLb.png'
}

export function getBroadcastLogo(callSign: string, type: 'tv' | 'radio', sport: string = 'mlb'): string {
  const config = BROADCAST_LOGOS.find(logo => 
    logo.callSign.toLowerCase() === callSign.toLowerCase() && logo.type === type
  )
  
  if (config) {
    return config.logoPath
  }

  // For MLB/NFL broadcasts, use sport-specific fallback
  if (sport === 'mlb') {
    return FALLBACK_LOGOS.mlb
  } else if (sport === 'nfl') {
    return FALLBACK_LOGOS.nfl
  }

  // Generate fallback path based on call sign for other sports
  const sanitizedCallSign = callSign.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  
  return `/logos/broadcasts/${type}/${sanitizedCallSign}.png`
}

export function getBroadcastDisplayName(callSign: string, name: string): string {
  const config = BROADCAST_LOGOS.find(logo => 
    logo.callSign.toLowerCase() === callSign.toLowerCase()
  )
  
  return config?.displayName || name
}