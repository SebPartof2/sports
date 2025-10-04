const { fetchNFLGamesByDate } = require('./lib/nfl-api.js');

async function testNFLVenue() {
  try {
    console.log('Testing NFL venue data...');
    
    // Test with a known date that had NFL games
    const games = await fetchNFLGamesByDate('2024-10-03');
    
    if (games.length > 0) {
      console.log(`Found ${games.length} games`);
      console.log('\nFirst game venue data:');
      console.log('Venue:', games[0].venue);
      console.log('City:', games[0].venueCity);
      console.log('State:', games[0].venueState);
      console.log('Country:', games[0].venueCountry);
      console.log('\nFull game object:');
      console.log(JSON.stringify(games[0], null, 2));
    } else {
      console.log('No games found for 2024-10-03');
      // Try current date
      const todayGames = await fetchNFLGamesByDate(new Date().toISOString().split('T')[0]);
      console.log(`Today's games: ${todayGames.length}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testNFLVenue();