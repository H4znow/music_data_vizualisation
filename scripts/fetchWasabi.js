const https = require('https');
const fs = require('fs');

// File path to save the data
const filePath = './data/songs.json';

// Function to fetch artists using https module
function fetchArtists(start = 0) {
    const url = `https://wasabi.i3s.unice.fr/api/v1/song_all/${start}?project=_id,name,genre,title,releaseDate,publicationDate`;
    const batchSize = 200;
    const limit = 1000000; // no limit virtually

    // Make the HTTPS request
    https.get(url, (response) => {
        let data = '';

        // Collect data in chunks
        response.on('data', (chunk) => {
            data += chunk;
        });

        // When the response ends, process the data
        response.on('end', () => {
            try {
                // Check if the content is JSON
                const contentType = response.headers['content-type'];
                if (contentType && contentType.includes('application/json')) {
                    const songs = JSON.parse(data);
                    console.log(`Fetched ${songs.length} songs from ${start} to ${start + songs.length}`);

                    // Read existing data if the file exists, otherwise start with an empty array
                    let allSongs = [];
                    if (fs.existsSync(filePath)) {
                        const existingData = fs.readFileSync(filePath, 'utf8');
                        allSongs = JSON.parse(existingData);
                    }

                    // Add the new batch of songs to the existing array
                    allSongs = allSongs.concat(songs);

                    // Write the updated array back to the file
                    fs.writeFile(filePath, JSON.stringify(allSongs, null, 2), (err) => {
                        if (err) {
                            console.error('Error writing to file:', err);
                        }
                    });

                    // If fewer than batchSize songs are returned, we're done
                    if (songs.length < batchSize || start >= limit) {
                        console.log('Finished fetching all songs.');
                        return;
                    }

                    // Fetch the next batch after a delay to avoid rate limiting
                    setTimeout(() => fetchArtists(start + batchSize), 2000);

                } else {
                    // Handle non-JSON response (e.g., error page or rate limit)
                    console.error(`Unexpected content type: ${contentType}`);
                    console.log(`Response: ${data}`);
                }

            } catch (error) {
                console.error('Error parsing JSON:', error);
                console.log('Response:', data); // Log the response for debugging only on error
            }
        });
    }).on('error', (error) => {
        console.error('Error fetching data:', error);
    });
}

// Start fetching from the beginning (start = 0)
fetchArtists(0);