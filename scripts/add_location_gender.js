const fs = require('node:fs');
const https = require('https');

const UNK_VALUE = "UNK";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject('Error parsing JSON');
                }
            });
        }).on('error', (error) => reject(error));
    });
}

async function getArtistData(artistName) {
    const url = `https://wasabi.i3s.unice.fr/api/v1/artist/name/${artistName}`;
    let country = UNK_VALUE;
    let city = UNK_VALUE;
    let gender = UNK_VALUE;

    try {
        const data = await fetchJSON(url);

        if (data.location) {
            if (data.location.country) country = data.location.country;
            if (data.location.city) city = data.location.city;
        }
        if (data.gender) gender = data.gender;
    } catch (error) {
        console.error(`Failed to fetch artist data for ${artistName}:`, error);
    }

    return {
        country,
        city,
        gender
    };
}

async function addLocationToSong(songSavedPath, saveFilePath) {
    const artistToData = {};

    // Read and parse song data
    let data;
    try {
        data = JSON.parse(fs.readFileSync(songSavedPath, 'utf8'));
    } catch (error) {
        console.error('Error reading song data:', error);
        return;
    }

    // Add location and gender to each song based on artist data
    for (let i = 0; i < data.length; i++) {
        console.log(`Processing song index ${i}`);

        if (data[i].hasOwnProperty("name")) {
            const artistName = data[i].name;

            // Fetch artist data if not already cached
            if (!artistToData[artistName]) {
                await sleep(2000); // Delay to avoid rate limiting
                artistToData[artistName] = await getArtistData(artistName);
            }

            // Set location and gender data in the song entry
            data[i].location = {
                country: artistToData[artistName].country,
                city: artistToData[artistName].city
            };
            data[i].gender = artistToData[artistName].gender;
        }
    }

    // Write updated data to save file, creating the file if it doesn’t exist
    try {
        fs.writeFileSync(saveFilePath, JSON.stringify(data, null, 2), { flag: 'w' });
        console.log('Data written successfully to', saveFilePath);
    } catch (error) {
        console.error('Error writing to save file:', error);
    }
}

const songSavedPath = './data/songs_dates.json';
const saveFilePath = './data/songs_final.json';
addLocationToSong(songSavedPath, saveFilePath);