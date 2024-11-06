const https = require('https');
const fs = require('fs');
const filePath = './data/songs_v2.json';
const limit = 200000; // Limit to 10000 songs
const batchSize = 200; // Number of songs per request

// Fetch a batch of songs
function fetch_songs(start = 0) {
    const url_songs = `https://wasabi.i3s.unice.fr/api/v1/song_all/${start}?project=_id,genre,releaseDate,publicationDate,id_album`;

    return new Promise((resolve, reject) => {
        https.get(url_songs, (res) => {
            let data = '';

            // Collect data in chunks
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const contentType = res.headers['content-type'];
                    if (contentType && contentType.includes('application/json')) {
                        const songs = JSON.parse(data);
                        console.log(`Fetched ${songs.length} songs from ${start} to ${start + songs.length}`);
                        resolve(songs);
                    } else {
                        reject(`Unexpected content type: ${contentType}`);
                    }
                } catch (error) {
                    reject(`Error parsing JSON: ${error.message}`);
                }
            });
        }).on('error', (error) => {
            reject(`Error fetching data: ${error.message}`);
        });
    });
}

// Process songs, fetch batches recursively until limit or no more songs are available
async function process_songs(start = 0, allSongs = []) {
    try {
        // Fetch a batch of songs
        const songs = await fetch_songs(start);

        // Process each song and handle array fields
        const processedSongs = songs.map(song => {
            // Get the first genre if available, otherwise use "Unknown"
            const genre = Array.isArray(song.genre) && song.genre.length > 0 ? song.genre[0] : return_unknown();

            // Select date from releaseDate or publicationDate, using the first element if it's an array
            const date = get_date(song.releaseDate, song.publicationDate);

            return {
                id: song._id,
                title: song.title || song.name, // Use `title` if available; fallback to `name`
                genre,
                date,
            };
        });

        // Add processed songs to the cumulative list
        allSongs = allSongs.concat(processedSongs);

        // Save current batch to file
        save_songs_to_file(allSongs);

        // Check if we've reached the limit or there are no more songs
        if (songs.length < batchSize || allSongs.length >= limit) {
            console.log('Finished fetching all songs.');
            return;
        }

        // wait 2 sec
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Recursive call for the next batch
        await process_songs(start + batchSize, allSongs);
    } catch (error) {
        console.error(`Error in fetching and processing songs: ${error}`);
        // Save whatever we have so far before stopping
        save_songs_to_file(allSongs);
    }
}

// Helper function to determine the date
function get_date(releaseDate, publicationDate) {
    // If releaseDate is an array, get the first date; if it's a single date, use it directly
    const release = Array.isArray(releaseDate) && releaseDate.length > 0 ? releaseDate[0] : releaseDate;
    
    // If publicationDate is an array, get the first date; if it's a single date, use it directly
    const publication = Array.isArray(publicationDate) && publicationDate.length > 0 ? publicationDate[0] : publicationDate;
    
    // If both dates are available, prioritize release date; otherwise, use publication date or "Unknown" as fallback
    return release || publication || return_unknown();
}

// Save songs to file with error handling
function save_songs_to_file(songs) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(songs, null, 2));
        console.log(`Saved ${songs.length} songs to ${filePath}`);
    } catch (error) {
        console.error('Error writing to file:', error);
    }
}

// Default for unknown fields
function return_unknown() {
    return "Unknown";
}

// Start the process
process_songs();