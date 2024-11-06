const fs = require('fs');

const inputFilePath = './data/songs_superGenre_date.json';

// Read songs data
let songs;
try {
    songs = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    console.log('Read song data:', songs.length, 'songs');
} catch (error) {
    console.error('Error reading songs data:', error);
    process.exit(1);
}

// Count super genres by year
const superGenresByYear = {};
for (const song of songs) {
    let year = song.date;
    if (!superGenresByYear[year]) {
        superGenresByYear[year] = {};
    }
    let superGenre = song.superGenre;
    if (!superGenresByYear[year][superGenre]) {
        superGenresByYear[year][superGenre] = 0;
    }
    superGenresByYear[year][superGenre]++;
}

// Save super genres by year data in json file
// Json format : {year, genre, count}
const superGenresByYearArray = [];
for (const year in superGenresByYear) {
    for (const genre in superGenresByYear[year]) {
        superGenresByYearArray.push({
            year: year,
            genre: genre,
            count: superGenresByYear[year][genre]
        });
    }
}

const saveFilePath = './data/superGenresByYear.json';
fs.writeFileSync(saveFilePath, JSON.stringify(superGenresByYearArray, null, 2));