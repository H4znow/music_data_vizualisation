const fs = require('node:fs');
const https = require('https');

const UNK_VALUE = "UNK"

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

async function get_album_release_date_and_genre(album_id){
    url = "https://wasabi.i3s.unice.fr/api/v1/album/id/" + album_id;

    let resp = await fetch(url)
    let data = await resp.json()

    let publicationDate = UNK_VALUE
    let id_artist = UNK_VALUE
    let albumGenre =UNK_VALUE
    if (data.hasOwnProperty("publicationDate")){
        publicationDate = data["publicationDate"]
    }
    if (data.hasOwnProperty("id_artist")){
        id_artist = data["id_artist"]
    }
    if (data.hasOwnProperty("genre")){
        albumGenre = data["genre"]
    }
    return {
        "id_artist": id_artist,
        "publicationDate":  publicationDate,
        "albumGenre": albumGenre
    }
}

async function add_album_release_date_and_genre_to_song(song_saved_path, save_file_path) {
    let albumIdToPublicationYear = {}

    data = fs.readFileSync(song_saved_path, 'utf8');

    data = JSON.parse(data);
    fieldName = "albumReleaseDate"
    idFieldName = "id_artist"
    albumGenreFieldName = "albumGenre"
    for (let i = 0; i < data.length; i++){
        if (!data[i].hasOwnProperty("releaseDate")){
            if (data[i].hasOwnProperty("id_album")){
                let id_album = data[i]["id_album"]
                if (!albumIdToPublicationYear.hasOwnProperty(id_album)){
                    console.log(i)
                    await sleep(2000);
                    albumIdToPublicationYear[id_album] = await get_album_release_date_and_genre(id_album)
                }
                if (albumIdToPublicationYear[id_album]["publicationDate"] != UNK_VALUE)
                    data[i][fieldName] = albumIdToPublicationYear[id_album]["publicationDate"]
                if(albumIdToPublicationYear[id_album]["id_artist"] != UNK_VALUE)
                    data[i][idFieldName] = albumIdToPublicationYear[id_album]["id_artist"]
                if(albumIdToPublicationYear[id_album]["albumGenre"] != UNK_VALUE)
                    data[i][albumGenreFieldName] = albumIdToPublicationYear[id_album]["albumGenre"]
            }
        }
            
    }
    // console.log(albumIdToPublicationYear)
    data_str = JSON.stringify(data)
    fs.writeFile(save_file_path, data_str, { flag: 'w+' },  err => {
        if (err) {
          console.error(err);
        } else {
          // file written successfully
        }
      });
}

song_saved_path = "../data/songs.json"
save_file_path = "../data/songs_final.json"
add_album_release_date_and_genre_to_song(song_saved_path, save_file_path);