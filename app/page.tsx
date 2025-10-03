'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Trophy, RefreshCw, X, MapPin, Thermometer, Wind, Users, TrendingUp, Activity, BarChart3 } from 'lucide-react'
import { fetchTodaysGames, fetchGameDetails, type Game } from '@/lib/api'
import BoxScore from '@/components/BoxScore'

function GameCard({ game, onClick }: { game: Game; onClick: () => void }) {
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
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">{game.awayTeam}</span>
          {game.awayScore !== undefined && (
            <span className="text-2xl font-bold">{game.awayScore}</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-lg">{game.homeTeam}</span>
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
  setActiveTab 
}: { 
  game: Game | null
  detailedGame: Game | null
  isOpen: boolean
  onClose: () => void
  loadingDetails: boolean
  activeTab: 'overview' | 'boxscore' | 'plays'
  setActiveTab: (tab: 'overview' | 'boxscore' | 'plays') => void
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
            <div>
              <h2 className="text-2xl font-bold mb-2">
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
            <OverviewTab game={displayGame} />
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

function OverviewTab({ game }: { game: Game }) {
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
              <h3 className="text-lg font-semibold mb-2">{game.awayTeam}</h3>
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
              <h3 className="text-lg font-semibold mb-2">{game.homeTeam}</h3>
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
                  {game.lineScore.innings.map((_, i) => (
                    <th key={i} className="text-center px-3 py-3">{i + 1}</th>
                  ))}
                  <th className="text-center px-3 py-3 border-l font-bold">R</th>
                  <th className="text-center px-3 py-3">H</th>
                  <th className="text-center px-3 py-3">E</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">{game.awayTeam}</td>
                  {game.lineScore.innings.map((inning, i) => (
                    <td key={i} className="text-center px-3 py-3">{inning.away ?? '-'}</td>
                  ))}
                  <td className="text-center px-3 py-3 border-l font-bold text-mlb-blue">{game.lineScore.totals.runs.away ?? 0}</td>
                  <td className="text-center px-3 py-3">{game.lineScore.totals.hits.away ?? 0}</td>
                  <td className="text-center px-3 py-3">{game.lineScore.totals.errors.away ?? 0}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">{game.homeTeam}</td>
                  {game.lineScore.innings.map((inning, i) => (
                    <td key={i} className="text-center px-3 py-3">{inning.home ?? '-'}</td>
                  ))}
                  <td className="text-center px-3 py-3 border-l font-bold text-mlb-blue">{game.lineScore.totals.runs.home ?? 0}</td>
                  <td className="text-center px-3 py-3">{game.lineScore.totals.hits.home ?? 0}</td>
                  <td className="text-center px-3 py-3">{game.lineScore.totals.errors.home ?? 0}</td>
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

function LivePlaysTab({ game }: { game: Game }) {
  if (!game.liveData?.plays || game.liveData.plays.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No live plays available
      </div>
    )
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Plays</h3>
      <div className="space-y-3">
        {game.liveData.plays.map((play, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mlb-blue text-white">
                  {play.halfInning} {play.inning}
                  {play.inning === 1 ? 'st' : play.inning === 2 ? 'nd' : play.inning === 3 ? 'rd' : 'th'}
                </span>
                {play.balls !== undefined && play.strikes !== undefined && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {play.balls}-{play.strikes}
                  </span>
                )}
                {play.outs !== undefined && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {play.outs} out{play.outs !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-800 leading-relaxed">{play.description}</p>
            {play.result && (
              <div className="mt-3 pt-2 border-t border-gray-100">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
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
  const [activeTab, setActiveTab] = useState<'overview' | 'boxscore' | 'plays'>('overview')

  const openGameDetail = async (game: Game) => {
    setSelectedGame(game)
    setDetailedGame(null)
    setIsModalOpen(true)
    setLoadingDetails(true)
    setActiveTab('overview')
    
    try {
      const details = await fetchGameDetails(game.id)
      if (details) {
        setDetailedGame(details)
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

  // Fetch games from API
  const fetchGames = async () => {
    setLoading(true)
    try {
      console.log('React: Starting to fetch games...')
      const fetchedGames = await fetchTodaysGames()
      console.log('React: Received games:', fetchedGames)
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
    console.log('React: Component mounted, fetching games...')
    fetchGames()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchGames, 30000)
    return () => clearInterval(interval)
  }, [])

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
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8" />
              <h1 className="text-3xl font-bold">MLB Live Stats</h1>
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
              Today's Games - {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
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
                    <GameCard key={game.id} game={game} onClick={() => openGameDetail(game)} />
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
                    <GameCard key={game.id} game={game} onClick={() => openGameDetail(game)} />
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
                    <GameCard key={game.id} game={game} onClick={() => openGameDetail(game)} />
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
          <p>&copy; 2025 MLB Live Stats Website. Built with Next.js and Tailwind CSS.</p>
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
      />
    </div>
  )
}