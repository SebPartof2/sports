// Test script to check MLB API
async function testMLBAPI() {
  try {
    const today = new Date().toISOString().split('T')[0]
    console.log(`Testing MLB API for date: ${today}`)
    
    const response = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}`)
    const data = await response.json()
    
    console.log('Schedule response:', JSON.stringify(data, null, 2))
    
    if (data.dates && data.dates.length > 0) {
      const games = data.dates[0].games
      console.log(`Found ${games.length} games`)
      
      for (const game of games) {
        console.log(`Game ${game.gamePk}: ${game.teams.away.team.name} @ ${game.teams.home.team.name}`)
        console.log(`Status: ${game.status.detailedState}`)
        
        // Test detailed game data
        try {
          const gameResponse = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${game.gamePk}/feed/live`)
          const gameData = await gameResponse.json()
          console.log(`Detailed data for game ${game.gamePk}:`, {
            venue: gameData.gameData.venue?.name,
            weather: gameData.gameData.weather,
            attendance: gameData.gameData.gameInfo?.attendance,
            probablePitchers: gameData.gameData.probablePitchers
          })
        } catch (err) {
          console.error(`Error fetching detailed data for game ${game.gamePk}:`, err)
        }
      }
    } else {
      console.log('No games found for today')
    }
  } catch (error) {
    console.error('Error testing API:', error)
  }
}

// Run the test
testMLBAPI()