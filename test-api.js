// Test script to check NFL API venue data
async function testNFLAPI() {
  try {
    // Test with multiple dates to find current games
    const testDates = ['20251005', '20251006', '20251004'] // Sunday, Monday, Friday
    
    for (const testDate of testDates) {
      console.log(`\nTesting NFL API for date: ${testDate}`)
      
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${testDate}&limit=100`)
      const data = await response.json()
      
      console.log('Events found:', data.events?.length || 0)
      
      if (data.events && data.events.length > 0) {
        data.events.forEach((event, index) => {
          console.log(`\nEvent ${index + 1}:`)
          console.log('Event ID:', event.id)
          console.log('Event Name:', event.name)
          
          if (event.competitions && event.competitions.length > 0) {
            const competition = event.competitions[0]
            console.log('Venue data:', {
              fullName: competition.venue?.fullName,
              city: competition.venue?.address?.city,
              state: competition.venue?.address?.state,
              country: competition.venue?.address?.country
            })
            
            // Show what the processed game object would look like
            const competitors = competition.competitors || []
            const homeCompetitor = competitors.find(c => c.homeAway === 'home')
            const awayCompetitor = competitors.find(c => c.homeAway === 'away')
            
            console.log('Processed game data would be:', {
              homeTeam: homeCompetitor?.team?.displayName || 'TBD',
              awayTeam: awayCompetitor?.team?.displayName || 'TBD',
              venue: competition?.venue?.fullName,
              venueCity: competition?.venue?.address?.city,
              venueState: competition?.venue?.address?.state
            })
          }
        })
        break // Stop after finding games
      }
    }
  } catch (error) {
    console.error('Error testing NFL API:', error)
  }
}

testNFLAPI()