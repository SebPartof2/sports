'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Trophy, RefreshCw, X, MapPin, Thermometer, Wind, Users, TrendingUp, Activity, BarChart3, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { fetchTodaysGames, fetchGamesByDate, fetchGameDetails, type Game } from '@/lib/api'
import { getTeamLogo, getTeamAbbreviation } from '@/lib/logos'
import { getLeagueConfig, DEFAULT_LEAGUE, SPORTS_CONFIG } from '@/lib/config'
import BoxScore from '@/components/BoxScore'

// Utility function to get local date as YYYY-MM-DD string
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function GameCard({ game, onClick, selectedLeague }: { game: Game; onClick: () => void; selectedLeague: string }) {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer hover:bg-gray-50"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          {game.status === 'live' && (
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            game.status === 'live' ? 'bg-red-100 text-red-800' :
            game.status === 'final' ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {game.status === 'live' ? `LIVE ${game.inning || ''}` :
             game.status === 'final' ? 'FINAL' : 'SCHEDULED'}
          </span>
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="w-4 h-4 mr-1" />
          {formatTime(game.startTime)}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Away Team */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src={getTeamLogo(game.awayTeam, selectedLeague)} 
              alt={`${game.awayTeam} logo`}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.src = getLeagueConfig(selectedLeague)?.defaultLogo || '/logos/mlb/MLB.png'
              }}
            />
            <div>
              <span className="font-semibold text-lg">{getTeamAbbreviation(game.awayTeam, selectedLeague)}</span>
              <div className="text-sm text-gray-600">{game.awayTeam}</div>
            </div>
          </div>
          {game.awayScore !== undefined && (
            <span className="text-2xl font-bold">{game.awayScore}</span>
          )}
        </div>
        
        {/* VS Indicator */}
        <div className="text-center text-gray-400 text-sm font-medium">@</div>
        
        {/* Home Team */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src={getTeamLogo(game.homeTeam, selectedLeague)} 
              alt={`${game.homeTeam} logo`}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.src = getLeagueConfig(selectedLeague)?.defaultLogo || '/logos/mlb/MLB.png'
              }}
            />
            <div>
              <span className="font-semibold text-lg">{getTeamAbbreviation(game.homeTeam, selectedLeague)}</span>
              <div className="text-sm text-gray-600">{game.homeTeam}</div>
            </div>
          </div>
          {game.homeScore !== undefined && (
            <span className="text-2xl font-bold">{game.homeScore}</span>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <span className="text-xs text-gray-500">Click for live stats & box score</span>
      </div>
    </div>
  )
}

function GameDetailModal({ 
  game, 
  detailedGame, 
  isOpen, 
  onClose, 
  loadingDetails,
  activeTab,
  setActiveTab,
  selectedLeague
}: { 
  game: Game | null
  detailedGame: Game | null
  isOpen: boolean
  onClose: () => void
  loadingDetails: boolean
  activeTab: 'overview' | 'boxscore' | 'plays' | 'broadcasts'
  setActiveTab: (tab: 'overview' | 'boxscore' | 'plays' | 'broadcasts') => void
  selectedLeague: string
}) {
  if (!isOpen || !game) return null

  const displayGame = detailedGame || game

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-mlb-blue text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <img 
                  src={getTeamLogo(displayGame.awayTeam, selectedLeague)} 
                  alt={`${displayGame.awayTeam} logo`}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = getLeagueConfig(selectedLeague)?.defaultLogo || '/logos/mlb/MLB.png'
                  }}
                />
                <span className="text-xl font-bold">{getTeamAbbreviation(displayGame.awayTeam, selectedLeague)}</span>
                <span className="text-blue-200">@</span>
                <span className="text-xl font-bold">{getTeamAbbreviation(displayGame.homeTeam, selectedLeague)}</span>
                <img 
                  src={getTeamLogo(displayGame.homeTeam, selectedLeague)} 
                  alt={`${displayGame.homeTeam} logo`}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = getLeagueConfig(selectedLeague)?.defaultLogo || '/logos/mlb/MLB.png'
                  }}
                />
              </div>
              <h2 className="text-lg font-medium mb-2 text-blue-100">
                {displayGame.awayTeam} @ {displayGame.homeTeam}
              </h2>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(displayGame.startTime)}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {displayGame.venue || 'TBD'}
                </span>
              </div>
              <p className="text-blue-100 mt-1">{formatDate(displayGame.startTime)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 px-6 py-2 border-b">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-white text-mlb-blue shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('boxscore')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'boxscore' 
                  ? 'bg-white text-mlb-blue shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              disabled={!detailedGame?.boxScore}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Box Score
              {!detailedGame?.boxScore && loadingDetails && (
                <RefreshCw className="w-3 h-3 inline ml-1 animate-spin" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('plays')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'plays' 
                  ? 'bg-white text-mlb-blue shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              disabled={!detailedGame?.liveData?.plays}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Live Plays
              {!detailedGame?.liveData?.plays && loadingDetails && (
                <RefreshCw className="w-3 h-3 inline ml-1 animate-spin" />
              )}
            </button>
            {(selectedLeague === 'mlb' || selectedLeague === 'nfl') && (
              <button
                onClick={() => setActiveTab('broadcasts')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'broadcasts' 
                    ? 'bg-white text-mlb-blue shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                Broadcasts
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loadingDetails && !detailedGame && (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-mlb-blue" />
              <span className="ml-2 text-lg">Loading detailed stats...</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewTab game={displayGame} selectedLeague={selectedLeague} />
          )}

          {activeTab === 'boxscore' && (
            <div>
              {detailedGame?.boxScore ? (
                <BoxScore game={detailedGame} />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {loadingDetails ? 'Loading box score...' : 'Box score not available for this game'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'plays' && (
            <div>
              {detailedGame?.liveData?.plays ? (
                <LivePlaysTab game={detailedGame} />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {loadingDetails ? 'Loading live plays...' : 'Live plays not available for this game'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'broadcasts' && (selectedLeague === 'mlb' || selectedLeague === 'nfl') && (
            <BroadcastsTab game={displayGame} league={selectedLeague} />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-mlb-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ game, selectedLeague }: { game: Game; selectedLeague: string }) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {game.status === 'live' && (
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              game.status === 'live' ? 'bg-red-100 text-red-800' :
              game.status === 'final' ? 'bg-gray-100 text-gray-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {game.status === 'live' ? `LIVE ${game.inning || ''}` :
               game.status === 'final' ? 'FINAL' : 'SCHEDULED'}
            </span>
            {game.liveData && game.status === 'live' && (
              <div className="text-sm text-gray-600">
                {game.liveData.balls !== undefined && game.liveData.strikes !== undefined && (
                  <span className="mr-4">Count: {game.liveData.balls}-{game.liveData.strikes}</span>
                )}
                {game.liveData.outs !== undefined && (
                  <span>Outs: {game.liveData.outs}</span>
                )}
              </div>
            )}
          </div>
          {game.attendance && (
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="w-4 h-4 mr-1" />
              {game.attendance.toLocaleString()} attendance
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <img 
                  src={getTeamLogo(game.awayTeam, selectedLeague)} 
                  alt={`${game.awayTeam} logo`}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = getLeagueConfig(selectedLeague)?.defaultLogo || '/logos/mlb/MLB.png'
                  }}
                />
                <div>
                  <h3 className="text-lg font-semibold">{getTeamAbbreviation(game.awayTeam, selectedLeague)}</h3>
                  <div className="text-sm text-gray-600">{game.awayTeam}</div>
                </div>
              </div>
              {game.awayRecord && (
                <p className="text-sm text-gray-600 mb-2">({game.awayRecord})</p>
              )}
              {game.awayScore !== undefined ? (
                <div className="text-4xl font-bold text-mlb-blue">{game.awayScore}</div>
              ) : (
                <div className="text-2xl text-gray-400">-</div>
              )}
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <img 
                  src={getTeamLogo(game.homeTeam, selectedLeague)} 
                  alt={`${game.homeTeam} logo`}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = getLeagueConfig(selectedLeague)?.defaultLogo || '/logos/mlb/MLB.png'
                  }}
                />
                <div>
                  <h3 className="text-lg font-semibold">{getTeamAbbreviation(game.homeTeam, selectedLeague)}</h3>
                  <div className="text-sm text-gray-600">{game.homeTeam}</div>
                </div>
              </div>
              {game.homeRecord && (
                <p className="text-sm text-gray-600 mb-2">({game.homeRecord})</p>
              )}
              {game.homeScore !== undefined ? (
                <div className="text-4xl font-bold text-mlb-blue">{game.homeScore}</div>
              ) : (
                <div className="text-2xl text-gray-400">-</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {game.lineScore && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3">Line Score</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white rounded-lg shadow">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Team</th>
                  {(game.lineScore?.innings || game.lineScore?.quarters || []).map((_, i) => (
                    <th key={i} className="text-center px-3 py-3">
                      {game.league === 'nfl' ? `Q${i + 1}` : (i + 1)}
                    </th>
                  ))}
                  <th className="text-center px-3 py-3 border-l font-bold">
                    {game.league === 'nfl' ? 'T' : 'R'}
                  </th>
                  {game.league === 'mlb' && (
                    <>
                      <th className="text-center px-3 py-3">H</th>
                      <th className="text-center px-3 py-3">E</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium flex items-center space-x-2">
                    <img 
                      src={getTeamLogo(game.awayTeam, selectedLeague)} 
                      alt={`${game.awayTeam} logo`}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = getLeagueConfig(selectedLeague)?.defaultLogo || '/logos/mlb/MLB.png'
                      }}
                    />
                    <span>{getTeamAbbreviation(game.awayTeam, selectedLeague)}</span>
                  </td>
                  {(game.lineScore?.innings || game.lineScore?.quarters || []).map((period, i) => (
                    <td key={i} className="text-center px-3 py-3">{period.away ?? '-'}</td>
                  ))}
                  <td className="text-center px-3 py-3 border-l font-bold text-mlb-blue">
                    {game.league === 'nfl' ? (game.lineScore?.totals?.away ?? game.awayScore ?? 0) : (game.lineScore?.totals?.runs?.away ?? 0)}
                  </td>
                  {game.league === 'mlb' && (
                    <>
                      <td className="text-center px-3 py-3">{game.lineScore?.totals?.hits?.away ?? 0}</td>
                      <td className="text-center px-3 py-3">{game.lineScore?.totals?.errors?.away ?? 0}</td>
                    </>
                  )}
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium flex items-center space-x-2">
                    <img 
                      src={getTeamLogo(game.homeTeam, selectedLeague)} 
                      alt={`${game.homeTeam} logo`}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = getLeagueConfig(selectedLeague)?.defaultLogo || '/logos/mlb/MLB.png'
                      }}
                    />
                    <span>{getTeamAbbreviation(game.homeTeam, selectedLeague)}</span>
                  </td>
                  {(game.lineScore?.innings || game.lineScore?.quarters || []).map((period, i) => (
                    <td key={i} className="text-center px-3 py-3">{period.home ?? '-'}</td>
                  ))}
                  <td className="text-center px-3 py-3 border-l font-bold text-mlb-blue">
                    {game.league === 'nfl' ? (game.lineScore?.totals?.home ?? game.homeScore ?? 0) : (game.lineScore?.totals?.runs?.home ?? 0)}
                  </td>
                  {game.league === 'mlb' && (
                    <>
                      <td className="text-center px-3 py-3">{game.lineScore?.totals?.hits?.home ?? 0}</td>
                      <td className="text-center px-3 py-3">{game.lineScore?.totals?.errors?.home ?? 0}</td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {(game.weather || game.temperature || game.wind) && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center">
              <Thermometer className="w-5 h-5 mr-2 text-blue-600" />
              Weather Conditions
            </h4>
            <div className="space-y-2 text-sm">
              {game.weather && (
                <p><span className="font-medium">Conditions:</span> {game.weather}</p>
              )}
              {game.temperature && (
                <p><span className="font-medium">Temperature:</span> {game.temperature}</p>
              )}
              {game.wind && (
                <p className="flex items-center">
                  <Wind className="w-4 h-4 mr-1" />
                  <span className="font-medium">Wind:</span> {game.wind}
                </p>
              )}
            </div>
          </div>
        )}

        {game.probablePitchers && (game.probablePitchers.home || game.probablePitchers.away) && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Pitching Matchup
            </h4>
            <div className="space-y-2 text-sm">
              {game.probablePitchers.away && (
                <p><span className="font-medium">{game.awayTeam}:</span> {game.probablePitchers.away}</p>
              )}
              {game.probablePitchers.home && (
                <p><span className="font-medium">{game.homeTeam}:</span> {game.probablePitchers.home}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {(game.lastPlay || game.liveData?.currentPlay) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Last Play</h4>
          <p className="text-yellow-700">{game.liveData?.currentPlay || game.lastPlay}</p>
        </div>
      )}
    </div>
  )
}

function BroadcastsTab({ game, league }: { game: Game; league: string }) {
  const [broadcastData, setBroadcastData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBroadcasts = async () => {
      if (!game.id) return
      
      try {
        setLoading(true)
        
        if (league === 'mlb') {
          const mlbApi = await import('../lib/mlb-api')
          const broadcasts = await mlbApi.fetchMLBBroadcastsByDate(game.startTime.split('T')[0])
          setBroadcastData(broadcasts[game.id] || [])
        } else if (league === 'nfl') {
          const nflApi = await import('../lib/nfl-api')
          const broadcasts = await nflApi.fetchNFLBroadcastsByDate(game.startTime.split('T')[0])
          setBroadcastData(broadcasts[game.id] || [])
        }
      } catch (error) {
        console.error('Error fetching broadcasts:', error)
        setBroadcastData([])
      } finally {
        setLoading(false)
      }
    }

    fetchBroadcasts()
  }, [game.id, game.startTime, league])

  if (loading) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-mlb-blue mx-auto mb-2" />
        <p className="text-gray-600">Loading broadcast information...</p>
      </div>
    )
  }

  if (!broadcastData || broadcastData.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No broadcast information available for this game.</p>
      </div>
    )
  }

  // Remove duplicates and group broadcasts by type
  const uniqueBroadcasts = broadcastData.reduce((acc: any[], broadcast: any) => {
    const existing = acc.find(b => b.name === broadcast.name && b.callSign === broadcast.callSign)
    if (!existing) {
      acc.push(broadcast)
    }
    return acc
  }, [])

  const tvBroadcasts = uniqueBroadcasts.filter((b: any) => b.type === 'TV')
  const radioBroadcasts = uniqueBroadcasts.filter((b: any) => b.type === 'AM' || b.type === 'FM')

  const getBroadcastLogo = (broadcast: any) => {
    const type = broadcast.type === 'TV' ? 'tv' : 'radio'
    const sanitizedCallSign = (broadcast.callSign || broadcast.name || '').toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    
    // Try specific logo first
    return `/logos/broadcasts/${type}/${sanitizedCallSign}.png`
  }

  const getFallbackLogo = () => {
    // Use league-specific fallback
    if (league === 'nfl') {
      return '/logos/broadcasts/generic/NFLb.png'
    }
    return '/logos/broadcasts/generic/MLBb.png'
  }

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* TV Broadcasts */}
        {tvBroadcasts.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Trophy className={`w-6 h-6 mr-3 ${league === 'nfl' ? 'text-blue-600' : 'text-mlb-blue'}`} />
              Television Broadcasts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tvBroadcasts.map((broadcast: any, index: number) => (
                <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 h-48 relative">
                  {/* Top row: Broadcaster Name (left) and Region/Language (right) */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-medium text-gray-900 flex-1 truncate pr-2">
                      {broadcast.name}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {broadcast.isNational ? 'National' : broadcast.market || `Local - ${getTeamAbbreviation(broadcast.homeAway === 'home' ? game.homeTeam : game.awayTeam, league)}`}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {broadcast.language ? broadcast.language.toUpperCase() : 'EN'}
                      </div>
                    </div>
                  </div>

                  {/* Center Logo Area */}
                  <div className="flex justify-center items-center flex-1 mb-4">
                    <div className="w-32 h-24 flex items-center justify-center">
                      <img 
                        src={getBroadcastLogo(broadcast)} 
                        alt={`${broadcast.name} logo`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackLogo()
                          e.currentTarget.onerror = () => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-text') as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }
                        }}
                      />
                      <div className="fallback-text w-full h-full flex items-center justify-center text-gray-500 text-xl font-medium" style={{display: 'none'}}>
                        LOGO
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Radio Broadcasts */}
        {radioBroadcasts.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Activity className={`w-6 h-6 mr-3 ${league === 'nfl' ? 'text-blue-600' : 'text-mlb-blue'}`} />
              Radio Broadcasts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {radioBroadcasts.map((broadcast: any, index: number) => (
                <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 h-48 relative">
                  {/* Top row: Broadcaster Name (left) and Region/Language (right) */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-medium text-gray-900 flex-1 truncate pr-2">
                      {broadcast.name}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {broadcast.isNational ? 'National' : broadcast.market || `Local - ${getTeamAbbreviation(broadcast.homeAway === 'home' ? game.homeTeam : game.awayTeam, league)}`}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {broadcast.language ? broadcast.language.toUpperCase() : 'EN'}
                      </div>
                    </div>
                  </div>

                  {/* Center Logo Area */}
                  <div className="flex justify-center items-center flex-1 mb-4">
                    <div className="w-32 h-24 flex items-center justify-center">
                      <img 
                        src={getBroadcastLogo(broadcast)} 
                        alt={`${broadcast.name} logo`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackLogo()
                          e.currentTarget.onerror = () => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-text') as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }
                        }}
                      />
                      <div className="fallback-text w-full h-full flex items-center justify-center text-gray-500 text-xl font-medium" style={{display: 'none'}}>
                        LOGO
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LivePlaysTab({ game }: { game: Game }) {
  const isNFL = game.league === 'nfl'
  
  if (!game.liveData?.plays || game.liveData.plays.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No live plays available
      </div>
    )
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {isNFL ? 'Drive Summary' : 'Recent Plays'}
      </h3>
      <div className="space-y-3">
        {game.liveData.plays.map((play, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                {isNFL ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-nfl-blue text-white">
                    {play.quarter ? `Q${play.quarter}` : 'Drive'} {play.time || ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mlb-blue text-white">
                    {play.halfInning} {play.inning}
                    {play.inning === 1 ? 'st' : play.inning === 2 ? 'nd' : play.inning === 3 ? 'rd' : 'th'}
                  </span>
                )}
                {!isNFL && play.balls !== undefined && play.strikes !== undefined && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {play.balls}-{play.strikes}
                  </span>
                )}
                {!isNFL && play.outs !== undefined && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {play.outs} out{play.outs !== 1 ? 's' : ''}
                  </span>
                )}
                {isNFL && play.down && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {play.down} & {play.distance}
                  </span>
                )}
                {isNFL && play.yardLine && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {play.yardLine}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-800 leading-relaxed">{play.description}</p>
            {play.result && (
              <div className="mt-3 pt-2 border-t border-gray-100">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                  isNFL ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {play.result}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {game.liveData.plays.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No plays recorded yet</p>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [detailedGame, setDetailedGame] = useState<Game | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'boxscore' | 'plays' | 'broadcasts'>('overview')
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getLocalDateString()
  })
  const [selectedLeague, setSelectedLeague] = useState<string>(DEFAULT_LEAGUE)
  const [showLeagueDropdown, setShowLeagueDropdown] = useState(false)

  const openGameDetail = async (game: Game) => {
    console.log('Opening game detail for:', game)
    setSelectedGame(game)
    setDetailedGame(null)
    setIsModalOpen(true)
    setLoadingDetails(true)
    setActiveTab('overview')
    
    try {
      let details: Game | null = null
      
      if (selectedLeague === 'mlb') {
        console.log('Fetching MLB game details for:', game.id)
        details = await fetchGameDetails(game.id)
      } else if (selectedLeague === 'nfl') {
        console.log('Fetching NFL game details for:', game.id)
        const nflApi = await import('../lib/nfl-api')
        details = await nflApi.fetchNFLGameDetails(game.id)
        console.log('NFL game details result:', details)
      }
      
      if (details) {
        console.log('Setting detailed game:', details)
        setDetailedGame(details)
      } else {
        console.log('No details returned, using original game data')
      }
    } catch (error) {
      console.error('Failed to load game details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedGame(null)
    setDetailedGame(null)
    setActiveTab('overview')
  }

  // Date navigation functions
  const goToPreviousDay = () => {
    const prevDate = new Date(selectedDate)
    prevDate.setDate(prevDate.getDate() - 1)
    setSelectedDate(prevDate.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const nextDate = new Date(selectedDate)
    nextDate.setDate(nextDate.getDate() + 1)
    setSelectedDate(nextDate.toISOString().split('T')[0])
  }

  const goToToday = () => {
    // Get today's date in local timezone
    setSelectedDate(getLocalDateString())
  }

  // Fetch games from API
  const fetchGames = async () => {
    setLoading(true)
    try {
      console.log('React: Starting to fetch games for date:', selectedDate, 'league:', selectedLeague)
      let fetchedGames: Game[]
      
      if (selectedLeague === 'mlb') {
        console.log('React: Calling MLB API')
        fetchedGames = await fetchGamesByDate(selectedDate)
      } else if (selectedLeague === 'nfl') {
        console.log('React: Calling NFL API for date:', selectedDate)
        const nflApi = await import('../lib/nfl-api')
        fetchedGames = await nflApi.fetchNFLGamesByDate(selectedDate)
        console.log('React: NFL API returned', fetchedGames.length, 'games')
        if (fetchedGames.length > 0) {
          console.log('React: First game venue:', fetchedGames[0]?.venue)
        }
      } else {
        // For future leagues, show message that they're not implemented yet
        console.log(`${selectedLeague.toUpperCase()} API not implemented yet`)
        fetchedGames = []
      }
      
      console.log('React: Received games:', fetchedGames.length)
      setGames(fetchedGames)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('React: Error fetching games:', error)
      setGames([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('React: Fetching games for date:', selectedDate, 'league:', selectedLeague)
    fetchGames()
  }, [selectedDate, selectedLeague])

  // Manual refresh only - no auto-refresh

  console.log('React: Current games state:', games)
  console.log('React: Games length:', games.length)

  const liveGames = games.filter(game => game.status === 'live')
  const finalGames = games.filter(game => game.status === 'final')
  const scheduledGames = games.filter(game => game.status === 'scheduled')

  console.log('React: Live games:', liveGames.length)
  console.log('React: Final games:', finalGames.length)
  console.log('React: Scheduled games:', scheduledGames.length)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-mlb-blue text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={getLeagueConfig(selectedLeague)?.defaultLogo || "/logos/mlb/MLB.png"} 
                  alt={`${selectedLeague.toUpperCase()} Logo`}
                  className="w-8 h-8 object-contain"
                />
                <h1 className="text-3xl font-bold">
                  {getLeagueConfig(selectedLeague)?.displayName || 'Sports'} Live Stats
                </h1>
              </div>
              
              {/* League Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLeagueDropdown(!showLeagueDropdown)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
                >
                  <span className="font-medium">{selectedLeague.toUpperCase()}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showLeagueDropdown && (
                  <div className="absolute top-full mt-2 left-0 bg-white text-gray-900 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                    {SPORTS_CONFIG.map(sport => (
                      <div key={sport.id}>
                        <div className="px-4 py-2 text-sm font-medium text-gray-500 border-b">
                          {sport.name}
                        </div>
                        {sport.leagues.map(league => (
                          <button
                            key={league.id}
                            onClick={() => {
                              setSelectedLeague(league.id)
                              setShowLeagueDropdown(false)
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 ${
                              selectedLeague === league.id ? 'bg-blue-50 text-blue-600' : ''
                            }`}
                          >
                            <img 
                              src={league.defaultLogo} 
                              alt={league.name}
                              className="w-5 h-5 object-contain"
                            />
                            <span>{league.displayName}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Date Navigation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
                <button
                  onClick={goToPreviousDay}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Previous day"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium min-w-[120px] text-center">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                <button
                  onClick={goToNextDay}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Next day"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={goToToday}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
              >
                Today
              </button>
            </div>
            
            <button
              onClick={fetchGames}
              disabled={loading}
              className="flex items-center space-x-2 bg-mlb-red hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} Games
            </h2>
            <p className="text-sm text-gray-500">
              Last updated: Recently
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-mlb-blue" />
            <span className="ml-2 text-lg">Loading games...</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            {/* Live Games */}
            {liveGames.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  Live Games ({liveGames.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveGames.map(game => (
                    <GameCard key={game.id} game={game} onClick={() => openGameDetail(game)} selectedLeague={selectedLeague} />
                  ))}
                </div>
              </section>
            )}

            {/* Final Games */}
            {finalGames.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Final Scores ({finalGames.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {finalGames.map(game => (
                    <GameCard key={game.id} game={game} onClick={() => openGameDetail(game)} selectedLeague={selectedLeague} />
                  ))}
                </div>
              </section>
            )}

            {/* Scheduled Games */}
            {scheduledGames.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Upcoming Games ({scheduledGames.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scheduledGames.map(game => (
                    <GameCard key={game.id} game={game} onClick={() => openGameDetail(game)} selectedLeague={selectedLeague} />
                  ))}
                </div>
              </section>
            )}

            {games.length === 0 && !loading && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No games scheduled</h3>
                <p className="text-gray-500">Check back later for game updates!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Sebastian Kang. Built with Next.js and Tailwind CSS.</p>
          <p className="text-gray-400 mt-2">Real-time box scores and live stats</p>
        </div>
      </footer>

      {/* Game Detail Modal */}
      <GameDetailModal 
        game={selectedGame} 
        detailedGame={detailedGame}
        isOpen={isModalOpen} 
        onClose={closeModal} 
        loadingDetails={loadingDetails}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLeague={selectedLeague}
      />
    </div>
  )
}