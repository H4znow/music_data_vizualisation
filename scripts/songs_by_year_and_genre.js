const fs = require('fs');
const path = require('path');

function processSongsData(inputFilePath, outputFilePath) {
    // Read and parse song data
    let data;
    try {
        data = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    } catch (error) {
        console.error('Error reading song data:', error);
        return;
    }

    // Initialize an object to store the count of songs by year and genre
    const songCounts = {};
    const allYears = new Set();
    const allGenres = new Set();

    // Populate the year and genre sets based on the data
    data.forEach(song => {
        const year = song.publicationDate ? new Date(song.publicationDate).getFullYear() : 'Unknown';
        const genres = Array.isArray(song.genre) ? song.genre : ['Unknown'];
        allYears.add(year);
        genres.forEach(genre => allGenres.add(genre));

        genres.forEach(genre => {
            const key = `${year}_${genre}`;
            if (!songCounts[key]) {
                songCounts[key] = { year, genre, count: 0 };
            }
            songCounts[key].count += 1;
        });
    });

    // Ensure all (year, genre) combinations are initialized with a count of 0
    allYears.forEach(year => {
        allGenres.forEach(genre => {
            const key = `${year}_${genre}`;
            if (!songCounts[key]) {
                songCounts[key] = { year, genre, count: 0 };
            }
        });
    });

    // Convert the result to an array format
    const result = Object.values(songCounts);

    // Write the result to the output file
    try {
        fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2), 'utf8');
        console.log(`Data written successfully to ${outputFilePath}`);
    } catch (error) {
        console.error('Error writing to output file:', error);
    }
}

const inputFilePath = path.join(__dirname, '../data/songs_final.json'); // Adjust path as needed
const outputFilePath = path.join(__dirname, '../data/songs_by_year_and_genre.json');
processSongsData(inputFilePath, outputFilePath);