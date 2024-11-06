const fs = require('fs');
const https = require('https');

const inputFilePath = './data/songs_with_super_genres.json';
const basicProcessedSongPath = './data/songs_v2.json';
const saveFilePath = './data/songs_superGenre_date.json';

// Read songs data
let songs;
try {
    songs = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    console.log('Read song data:', songs.length, 'songs');
} catch (error) {
    console.error('Error reading songs data:', error);
    process.exit(1);
}

// Read basic processed song data
let basicProcessedSongs;
try {
    basicProcessedSongs = JSON.parse(fs.readFileSync(basicProcessedSongPath, 'utf8'));
    console.log('Read basic processed song data:', basicProcessedSongs.length, 'songs');
} catch (error) {
    console.error('Error reading basic processed song data:', error);
    process.exit(1);
}

// Create a mapping from song ID to basic processed song for efficient lookup
const basicProcessedSongsMap = {};
for (const basicSong of basicProcessedSongs) {
    basicProcessedSongsMap[basicSong.id] = basicSong;
}

// Update songs with dates from basic processed songs
for (const song of songs) {
    if (basicProcessedSongsMap[song.id]) {
        song.date = basicProcessedSongsMap[song.id].date || 'Unknown';
        if (song.date !== 'Unknown') {
            song.date = song.date.split('-')[0];
        }
    } else {
        song.date = 'Unknown';
    }
}
console.log('Updated songs with dates from basic processed songs');

// Fetch date from album release date if not found in basic processed data
(async function updateUnknownDates() {
    for (let i = 0; i < songs.length; i += 4) {
        const promises = [];

        for (let j = i; j < i + 4 && j < songs.length; j++) {
            const song = songs[j];
            if (song.date === 'Unknown') {
                let artistName = song.name.replace(/ /g, '%20');
                let albumTitle = song.albumTitle.replace(/ /g, '%20');
                promises.push(
                    fetchDateFromAlbum(artistName, albumTitle, song).catch(error => {
                        console.error(`Error fetching date for "${artistName}" - "${albumTitle}":`, error.message);
                    })
                );
            }
        }

        // Wait for all three requests to complete
        await Promise.all(promises);

        // Save the updated songs immediately after each batch
        saveUpdatedSongs();

        // Add a delay of 2 seconds before the next batch
        await delay(2000);
    }
    console.log('All updates completed.');
})();

// Function to fetch album release date from external API
function fetchDateFromAlbum(artistName, albumTitle, song) {
    return new Promise((resolve, reject) => {
        const url = `https://wasabi.i3s.unice.fr/search/artist/${artistName}/album/${albumTitle}`;

        https.get(url, (res) => {
            let data = '';

            // Collect data in chunks
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const contentType = res.headers['content-type'];
                    
                    // Check if response is JSON
                    if (contentType && contentType.includes('application/json')) {
                        const albumData = JSON.parse(data);
                        console.log(`Fetched album data for artist "${artistName}"`);

                        // Access the publicationDate within albumData.albums
                        if (albumData.albums && albumData.albums.publicationDate) {
                            song.date = albumData.albums.publicationDate || 'Unknown';
                        } else {
                            console.log(`No publication date found for album "${albumTitle}"`);
                        }
                        resolve();
                    } else {
                        // Log and handle unexpected content type
                        console.error(`Invalid content type received: ${contentType}`);
                        reject(new Error(`Invalid content type: ${contentType}`));
                    }
                } catch (error) {
                    reject(new Error(`Error parsing JSON: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(new Error(`Request error: ${error.message}`));
        });
    });
}


// Helper function to introduce a delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to save the updated songs to a file
function saveUpdatedSongs() {
    try {
        fs.writeFileSync(saveFilePath, JSON.stringify(songs, null, 2), 'utf8');
        console.log('Updated songs saved to:', saveFilePath);
    } catch (error) {
        console.error('Error writing updated songs data:', error);
    }
}
