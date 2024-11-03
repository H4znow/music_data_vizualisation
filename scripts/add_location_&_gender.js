const fs = require('node:fs');
const https = require('https');


function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

async function get_artist_data(artistName){
    url = "https://wasabi.i3s.unice.fr/api/v1/artist/name/" + artistName;

    let resp = await fetch(url)
    let data = await resp.json()

    let country = "UNK";
    let city = "UNK";
    let gender = "UNK";
    if (data.hasOwnProperty("location")){
        if (data.location.hasOwnProperty("country"))
            country = data.location.country;
        if (data.location.hasOwnProperty("city"))
            city =  data.location.city;
    }
    if (data.hasOwnProperty("gender") && data.gender){
        gender = data.gender;
    }
    return {
        "country" : country,
        "city": city,
        "gender": gender
    };
}

async function add_location_to_song(song_saved_path, save_file_path) {
    let artist_to_data = {};
    let location = {};
    data = fs.readFileSync(song_saved_path, 'utf8');

    data = JSON.parse(data);
    for (let i = 0; i < data.length; i++){
        console.log(i)
        if (data[i].hasOwnProperty("name")){
            artistName = data[i].name;
            if (!artist_to_data.hasOwnProperty(artistName)){
                await sleep(2000);
                artist_to_data[artistName] = await get_artist_data(artistName);
            }
            location = {
                "country" : artist_to_data[artistName].country,
                "city": artist_to_data[artistName].city,
            }
                data[i]["location"] = location;
            data[i]["gender"] = artist_to_data[artistName].gender;
        }            

    }
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
save_file_path = "../data/songs_transformed.json"
add_location_to_song(song_saved_path, save_file_path);
