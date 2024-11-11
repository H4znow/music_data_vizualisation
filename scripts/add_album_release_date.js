const fs = require('node:fs');
const https = require('https');
const { exit } = require('node:process');

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
        if (data.genre){
            if (Array.isArray(data.genre) && data.genre.length > 0)
                albumGenre = data.genre[0];
            else
                albumGenre = data.genre;
        } 
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

    const stepToUpdate = 200
    // Add album release date and genre to each song
    for (let i = 0; i < data.length; i++) {
        let isGenrePresent = !data[i].hasOwnProperty('genre') || (data[i].hasOwnProperty('genre') && Array.isArray(data[i]["genre"]) && data[i]["genre"].length == 0)
        if ((!data[i].hasOwnProperty('releaseDate') || !isGenrePresent) && data[i].hasOwnProperty('id_album')) {
            const id_album = data[i].id_album;

            if (!albumIdToPublicationYear[id_album]) {
                console.log(`Fetching album data for index ${i}`);
                await sleep(1200); // Delay to avoid rate limiting
                albumIdToPublicationYear[id_album] = await getAlbumReleaseDateAndGenre(id_album);
            }

            const albumData = albumIdToPublicationYear[id_album];
            if (albumData.publicationDate !== UNK_VALUE) data[i].albumReleaseDate = albumData.publicationDate;
            if (albumData.id_artist !== UNK_VALUE) data[i].id_artist = albumData.id_artist;
            if (albumData.albumGenre !== UNK_VALUE) data[i].albumGenre = albumData.albumGenre;
        }
        if ((i > 0  && i % stepToUpdate == 0) || i == data.length-1){
            fs.readFile(saveFilePath, 'utf8', (err, dataFile) => {
                let existingSongs = [];
                if (!err && dataFile) {
                    try {
                        existingSongs = JSON.parse(dataFile);
                    } catch (error) {
                        console.error('Erreur lors de l\'analyse des données existantes :', error);
                        exit('1')
                    }
                }
                // Combiner les chansons existantes avec les nouvelles
                const allSongs = existingSongs.concat(data.slice(i-stepToUpdate, i+1));

                // Écrire toutes les chansons dans le fichier
                fs.writeFile(saveFilePath, JSON.stringify(allSongs, null, 2), 'utf8', (error) => {
                    if (error) {
                        console.error(`Erreur lors de l'écriture dans le fichier "${saveFilePath}" :`, error);
                        exit('1')
                    } else {
                        console.log(`Sauvegardé ${stepToUpdate} chansons dans "${saveFilePath}"`);
                    }
                });
            });
        }
    }
}

const songSavedPath = './data/songs.json';
const saveFilePath = './data/songs_with_album_genre.json';
addAlbumReleaseDateAndGenreToSong(songSavedPath, saveFilePath);