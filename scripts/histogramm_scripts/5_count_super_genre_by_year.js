const fs = require('fs');

const inputFilePath = './data/songs_superGenre_date.json';
const saveFilePath = './data/superGenresByYear.json';

// Read songs data
let songs;
try {
    songs = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    console.log('Read song data:', songs.length, 'songs');
} catch (error) {
    console.error('Error reading songs data:', error);
    process.exit(1);
}

// Initialize an object to store super-genre counts by year
const superGenresByYear = {};

// Count super-genre occurrences by year
for (const song of songs) {
    const year = song.date;
    const superGenre = song.super_genre || 'Unknown';

    // Initialize year if it doesn't exist
    if (!superGenresByYear[year]) {
        superGenresByYear[year] = {};
    }

    // Initialize the super genre count for this year if it doesn't exist
    if (!superGenresByYear[year][superGenre]) {
        superGenresByYear[year][superGenre] = 0;
    }

    // Increment the count for the super genre in this year
    superGenresByYear[year][superGenre]++;
}

// Convert superGenresByYear to the desired array format
const superGenresByYearArray = Object.keys(superGenresByYear).map((year) => {
    return {
        year: year,
        ...superGenresByYear[year]
    };
});

// Save the data to a JSON file in the specified format
fs.writeFileSync(saveFilePath, JSON.stringify(superGenresByYearArray, null, 2), 'utf8');
console.log(`Saved super genres by year to ${saveFilePath}`);