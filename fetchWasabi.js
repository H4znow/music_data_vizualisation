const https = require('https');

// Function to fetch artists using https module
function fetchArtists(start = 0) {
    const url = `https://wasabi.i3s.unice.fr/api/v1/artist_all/${start}`;
    const batchSize = 200;
    const limit = 77492; // Total number of artists in the database

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
                const artists = JSON.parse(data);
                console.log(`Fetched ${artists.length} artists from ${start} to ${start + artists.length}`);

                // Process the data (here we're just logging it)
                // You can save it to a file or a database

                // If fewer than batchSize artists are returned, we're done
                if (artists.length < batchSize || start >= limit) {
                    console.log('Finished fetching all artists.');
                    return;
                }

                // Fetch the next batch
                fetchArtists(start + batchSize);

            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        });
    }).on('error', (error) => {
        console.error('Error fetching data:', error);
    });
}

// Start fetching from the beginning (start = 0)
fetchArtists(0);
