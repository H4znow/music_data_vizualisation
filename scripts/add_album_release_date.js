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

async function getAlbumReleaseDateAndGenre(album_id) {
    const url = `https://wasabi.i3s.unice.fr/api/v1/album/id/${album_id}`;
    let publicationDate = UNK_VALUE;
    let id_artist = UNK_VALUE;
    let albumGenre = UNK_VALUE;

    try {
        const data = await fetchJSON(url);

        if (data.publicationDate) publicationDate = data.publicationDate;
        if (data.id_artist) id_artist = data.id_artist;
        if (data.genre) albumGenre = data.genre;
    } catch (error) {
        console.error(`Failed to fetch album data for ID ${album_id}:`, error);
    }

    return {
        id_artist,
        publicationDate,
        albumGenre
    };
}

async function addAlbumReleaseDateAndGenreToSong(songSavedPath, saveFilePath) {
    const albumIdToPublicationYear = {};

    // Ensure the save file exists
    if (!fs.existsSync(saveFilePath)) {
        fs.writeFileSync(saveFilePath, JSON.stringify([]));
    }

    // Read and parse song data
    let data;
    try {
        data = JSON.parse(fs.readFileSync(songSavedPath, 'utf8'));
    } catch (error) {
        console.error('Error reading song data:', error);
        return;
    }

    // Add album release date and genre to each song
    for (let i = 0; i < data.length; i++) {
        if (!data[i].hasOwnProperty('releaseDate') && data[i].hasOwnProperty('id_album')) {
            const id_album = data[i].id_album;

            if (!albumIdToPublicationYear[id_album]) {
                console.log(`Fetching album data for index ${i}`);
                await sleep(2000); // Delay to avoid rate limiting
                albumIdToPublicationYear[id_album] = await getAlbumReleaseDateAndGenre(id_album);
            }

            const albumData = albumIdToPublicationYear[id_album];
            if (albumData.publicationDate !== UNK_VALUE) data[i].albumReleaseDate = albumData.publicationDate;
            if (albumData.id_artist !== UNK_VALUE) data[i].id_artist = albumData.id_artist;
            if (albumData.albumGenre !== UNK_VALUE) data[i].albumGenre = albumData.albumGenre;
        }
    }

    // Write updated data to save file
    try {
        fs.writeFileSync(saveFilePath, JSON.stringify(data, null, 2));
        console.log('Data written successfully to', saveFilePath);
    } catch (error) {
        console.error('Error writing to save file:', error);
    }
}

const songSavedPath = './data/songs.json';
const saveFilePath = './data/songs_dates.json';
addAlbumReleaseDateAndGenreToSong(songSavedPath, saveFilePath);