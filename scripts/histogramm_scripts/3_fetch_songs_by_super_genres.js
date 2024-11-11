const fs = require('fs');
const https = require('https');

const input_super_genres = './data/songs_with_super_genres.json';
const output_file = './data/songs_fetched_with_genre.json';

// Fonction pour introduire un délai
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Charger les super-genres
let superGenres;
try {
    superGenres = JSON.parse(fs.readFileSync(input_super_genres, 'utf8'));
} catch (error) {
    console.error('Erreur lors de la lecture des super-genres :', error);
    return;
}

// Fonction principale pour traiter les genres avec un délai
(async function main() {
    for (const superGenre in superGenres) {
        for (const genre of superGenres[superGenre]) {
            try {
                const songs = await fetch_songs_by_genre(genre);

                // Ajouter le champ 'super_genre' à chaque chanson
                const updatedSongs = songs.map(song => {
                    song.super_genre = superGenre;
                    return song;
                });

                // Sauvegarder les chansons dans un fichier
                await save_songs(updatedSongs);

                // Attendre 1 seconde avant la prochaine requête
                await sleep(1000);
            } catch (error) {
                console.error(`Erreur lors du traitement du genre "${genre}" :`, error);
            }
        }
    }
})();

// Fonction pour récupérer les chansons par genre
function fetch_songs_by_genre(genre) {
    return new Promise((resolve, reject) => {
        const encodedGenre = encodeURIComponent(genre);
        const url = `https://wasabi.i3s.unice.fr/search/genre/${encodedGenre}`;

        https.get(url, (res) => {
            let data = '';

            // Collecter les données par morceaux
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const contentType = res.headers['content-type'];
                    if (contentType && contentType.includes('application/json')) {
                        const songs = JSON.parse(data);
                        console.log(`Récupéré ${songs.length} chansons du genre "${genre}"`);
                        resolve(songs);
                    } else {
                        reject(`Type de contenu inattendu : ${contentType}`);
                    }
                } catch (error) {
                    reject(`Erreur lors de l'analyse du JSON : ${error.message}`);
                }
            });
        }).on('error', (error) => {
            reject(`Erreur lors de la récupération des données : ${error.message}`);
        });
    });
}

// Fonction pour sauvegarder les chansons dans un fichier
function save_songs(songs) {
    return new Promise((resolve, reject) => {
        const filePath = output_file;

        // Lire les données existantes si le fichier existe
        fs.readFile(filePath, 'utf8', (err, data) => {
            let existingSongs = [];
            if (!err && data) {
                try {
                    existingSongs = JSON.parse(data);
                } catch (error) {
                    console.error('Erreur lors de l\'analyse des données existantes :', error);
                }
            }

            // Combiner les chansons existantes avec les nouvelles
            const allSongs = existingSongs.concat(songs);

            // Écrire toutes les chansons dans le fichier
            fs.writeFile(filePath, JSON.stringify(allSongs, null, 2), 'utf8', (error) => {
                if (error) {
                    console.error(`Erreur lors de l'écriture dans le fichier "${filePath}" :`, error);
                    reject(error);
                } else {
                    console.log(`Sauvegardé ${songs.length} chansons dans "${filePath}"`);
                    resolve();
                }
            });
        });
    });
}