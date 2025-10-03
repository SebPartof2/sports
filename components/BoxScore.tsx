'use client'

import { Game, PlayerStats, PitcherStats, TeamStats } from '@/lib/api'
import { getTeamLogo, getTeamAbbreviation } from '@/lib/logos'

interface BoxScoreProps {
  game: Game
}

export default function BoxScore({ game }: BoxScoreProps) {
  if (!game.boxScore) {
    return (
      <div className="p-6 text-center text-gray-500">
        Box score data not available
      </div>
    )
  }

  const { teams } = game.boxScore

  return (
    <div className="p-6 space-y-6">
      {/* Live Game Status */}
      {game.status === 'live' && game.liveData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="text-green-800 font-semibold">
              {game.inning || 'Live'}
            </div>
            <div className="text-green-700">
              {game.liveData.balls !== undefined && (
                <span className="mr-4">
                  <span className="font-semibold">Count:</span> {game.liveData.balls}-{game.liveData.strikes}
                </span>
              )}
              {game.liveData.outs !== undefined && (
                <span>
                  <span className="font-semibold">Outs:</span> {game.liveData.outs}
                </span>
              )}
            </div>
          </div>
          {game.liveData.currentPlay && (
            <div className="mt-2 text-green-700">
              <span className="font-semibold">Last Play:</span> {game.liveData.currentPlay}
            </div>
          )}
        </div>
      )}

      {/* Line Score */}
      {game.lineScore && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Line Score</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Team</th>
                  {game.lineScore.innings.map((_, index) => (
                    <th key={index} className="text-center py-2 px-2 w-8">
                      {index + 1}
                    </th>
                  ))}
                  <th className="text-center py-2 px-3 font-semibold border-l-2">R</th>
                  <th className="text-center py-2 px-3 font-semibold">H</th>
                  <th className="text-center py-2 px-3 font-semibold">E</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium flex items-center space-x-2">
                    <img 
                      src={getTeamLogo(game.awayTeam)} 
                      alt={`${game.awayTeam} logo`}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/logos/mlb/MLB.png'
                      }}
                    />
                    <span>{getTeamAbbreviation(game.awayTeam)}</span>
                  </td>
                  {game.lineScore.innings.map((inning, index) => (
                    <td key={index} className="text-center py-2 px-2">
                      {inning.away ?? '-'}
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 font-bold border-l-2">
                    {game.lineScore.totals.runs.away}
                  </td>
                  <td className="text-center py-2 px-3">
                    {game.lineScore.totals.hits.away}
                  </td>
                  <td className="text-center py-2 px-3">
                    {game.lineScore.totals.errors.away}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium flex items-center space-x-2">
                    <img 
                      src={getTeamLogo(game.homeTeam)} 
                      alt={`${game.homeTeam} logo`}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/logos/mlb/MLB.png'
                      }}
                    />
                    <span>{getTeamAbbreviation(game.homeTeam)}</span>
                  </td>
                  {game.lineScore.innings.map((inning, index) => (
                    <td key={index} className="text-center py-2 px-2">
                      {inning.home ?? '-'}
                    </td>
                  ))}
                  <td className="text-center py-2 px-3 font-bold border-l-2">
                    {game.lineScore.totals.runs.home}
                  </td>
                  <td className="text-center py-2 px-3">
                    {game.lineScore.totals.hits.home}
                  </td>
                  <td className="text-center py-2 px-3">
                    {game.lineScore.totals.errors.home}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Team Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamBoxScore team={teams.away} isAway={true} gameStatus={game.status} />
        <TeamBoxScore team={teams.home} isAway={false} gameStatus={game.status} />
      </div>

      {/* Recent Plays */}
      {game.liveData?.plays && game.liveData.plays.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">Recent Plays</h3>
          <div className="space-y-2">
            {game.liveData.plays.map((play, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-blue-700">
                  {play.halfInning} {play.inning}:
                </span>
                <span className="ml-2 text-blue-800">{play.description}</span>
                {play.balls !== undefined && play.strikes !== undefined && (
                  <span className="ml-2 text-blue-600 text-xs">
                    ({play.balls}-{play.strikes}, {play.outs} outs)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TeamBoxScore({ team, isAway, gameStatus }: { team: TeamStats; isAway: boolean; gameStatus: 'scheduled' | 'live' | 'final' }) {
  return (
    <div className="bg-white border rounded-lg">
      <div className={`px-4 py-3 ${isAway ? 'bg-gray-100' : 'bg-blue-100'} rounded-t-lg`}>
        <div className="flex items-center space-x-3">
          <img 
            src={getTeamLogo(team.teamName)} 
            alt={`${team.teamName} logo`}
            className="w-8 h-8 object-contain"
            onError={(e) => {
              e.currentTarget.src = '/logos/mlb/MLB.png'
            }}
          />
          <div>
            <h3 className="font-semibold text-lg">{getTeamAbbreviation(team.teamName)}</h3>
            <div className="text-sm text-gray-600">{team.teamName}</div>
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Runs: {team.teamTotals.runs} | Hits: {team.teamTotals.hits} | 
          Errors: {team.teamTotals.errors} | LOB: {team.teamTotals.leftOnBase}
        </div>
      </div>

      {/* Batting Stats */}
      <div className="p-4">
        <h4 className="font-semibold mb-3">
          {gameStatus === 'scheduled' ? 'Probable Lineup' : 'Batting'}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b">
                <th className="py-1">Player</th>
                <th className="py-1 text-center">Pos</th>
                <th className="py-1 text-center">AB</th>
                <th className="py-1 text-center">R</th>
                <th className="py-1 text-center">H</th>
                <th className="py-1 text-center">RBI</th>
                <th className="py-1 text-center">BB</th>
                <th className="py-1 text-center">SO</th>
                <th className="py-1 text-center">AVG</th>
              </tr>
            </thead>
            <tbody>
              {team.battingOrder.map((player, index) => (
                <tr key={player.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-1 font-medium">{player.name}</td>
                  <td className="py-1 text-center text-gray-600">{player.position}</td>
                  <td className="py-1 text-center">{player.atBats}</td>
                  <td className="py-1 text-center">{player.runs}</td>
                  <td className="py-1 text-center">{player.hits}</td>
                  <td className="py-1 text-center">{player.rbi}</td>
                  <td className="py-1 text-center">{player.baseOnBalls}</td>
                  <td className="py-1 text-center">{player.strikeOuts}</td>
                  <td className="py-1 text-center">{player.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pitching Stats */}
      <div className="p-4 border-t">
        <h4 className="font-semibold mb-3">
          {gameStatus === 'scheduled' ? 'Probable Pitchers' : 'Pitching'}
        </h4>
        {team.pitchers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-1">Pitcher</th>
                  <th className="py-1 text-center">IP</th>
                  <th className="py-1 text-center">H</th>
                  <th className="py-1 text-center">R</th>
                  <th className="py-1 text-center">ER</th>
                  <th className="py-1 text-center">BB</th>
                  <th className="py-1 text-center">SO</th>
                  <th className="py-1 text-center">HR</th>
                  <th className="py-1 text-center">P-S</th>
                  <th className="py-1 text-center">ERA</th>
                </tr>
              </thead>
              <tbody>
                {team.pitchers.map((pitcher, index) => (
                  <tr 
                    key={pitcher.id} 
                    className={`${index % 2 === 0 ? 'bg-gray-50' : ''} ${
                      pitcher.isCurrentPitcher ? 'bg-green-100 font-semibold' : ''
                    }`}
                  >
                    <td className="py-1 font-medium">
                      {pitcher.name}
                      {pitcher.isCurrentPitcher && (
                        <span className="ml-1 text-green-600 text-xs">●</span>
                      )}
                    </td>
                    <td className="py-1 text-center">{pitcher.inningsPitched}</td>
                    <td className="py-1 text-center">{pitcher.hits}</td>
                    <td className="py-1 text-center">{pitcher.runs}</td>
                    <td className="py-1 text-center">{pitcher.earnedRuns}</td>
                    <td className="py-1 text-center">{pitcher.baseOnBalls}</td>
                    <td className="py-1 text-center">{pitcher.strikeOuts}</td>
                    <td className="py-1 text-center">{pitcher.homeRuns}</td>
                    <td className="py-1 text-center">{pitcher.pitches}-{pitcher.strikes}</td>
                    <td className="py-1 text-center">{pitcher.era}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {gameStatus === 'scheduled' ? 'Probable pitchers not yet announced' : 'No pitching data available'}
          </div>
        )}
      </div>
    </div>
  )
}