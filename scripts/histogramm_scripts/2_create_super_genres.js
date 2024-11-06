const fs = require('fs');

const inputFilePath = './data/songs_v2.json';

// ---------------------------
// PART ONE: Read and Extract Genres
// ---------------------------
let data;
try {
    data = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    console.log('Read song data:', data.length, 'songs');
} catch (error) {
    console.error('Error reading song data:', error);
    return;
}

// Extract unique genres from data
let genres = new Set(data.map(song => song.genre));

console.log("Number of genres:", genres.size);

// Write genres to file
fs.writeFileSync('./data/genres.json', JSON.stringify([...genres], null, 2));

// ---------------------------
// PART TWO: Create and Save Super-Genres
// Super-genres are a higher level of categorization for genres
// They group similar genres together
// This is a manual process and required analyze of step one data
// ---------------------------

// Define super-genre and its sub-genres
const superGenreMap = {
    "Pop": [
        "Pop music",
        "Synthpop",
        "Electropop",
        "Europop",
        "Dance-pop",
        "Pop rock",
        "Schlager music",
        "Baroque pop",
        "Adult contemporary music",
        "Sophisti-pop",
        "Traditional pop music",
        "Easy listening",
        "Popmusik",
        "Power pop",
        "J-pop",
        "Popular music",
        "Progressive pop",
        "Austropop",
        "Psychedelic pop",
        "Pop",
        "Jangle pop",
        "Teen pop",
        "Operatic pop",
        "Bubblegum dance",
        "Dream pop",
        "Bubblegum pop",
        "Pop-folk",
        "Noise pop",
        "Swamp pop",
        "Pop (musique)",
        "20th-century popular music"
    ],
    "Rock": [
        "New wave music",
        "Dark wave",
        "Alternative rock",
        "Surf music",
        "Post-grunge",
        "Rock and roll",
        "Soft rock",
        "Garage rock",
        "Hard rock",
        "Glam rock",
        "Instrumental rock",
        "Rock music",
        "Psychedelic rock",
        "Progressive rock",
        "Funk rock",
        "Industrial rock",
        "Grunge",
        "Experimental rock",
        "Electronic rock",
        "Art rock",
        "Post-punk revival",
        "Beat music",
        "British Invasion",
        "Progressive folk",
        "Psychedelic folk",
        "Folk rock",
        "Symphonic rock",
        "Arena rock",
        "Cello rock",
        "Gothic rock",
        "Stoner rock",
        "Palm Desert Scene",
        "Southern rock",
        "Space rock",
        "Britpop",
        "Dance-rock",
        "Heartland rock",
        "No wave",
        "Acid rock",
        "Rap rock",
        "Mod revival",
        "Rockmusik",
        "Roots rock",
        "Australian rock",
        "Rock alternatif",
        "Acid rock",
        "Rap rock",
        "Mod revival",
        "Roots rock"
    ],
    "Hip Hop/Rap": [
        "Alternative hip hop",
        "Hip hop music",
        "Gangsta rap",
        "Pop-rap",
        "Latin hip hop",
        "Political hip hop",
        "Hip hop",
        "Southern hip hop",
        "Hardcore hip hop",
        "West Coast hip hop",
        "Rap metal",
        "Rapcore",
        "Crunk",
        "Trap music",
        "Alternative hip hop",
        "Pop-rap",
        "Rapcore"
    ],
    "Electronic": [
        "Tech house",
        "Electronica",
        "Electro (music)",
        "House music",
        "Acid house",
        "Electro house",
        "Progressive house",
        "Electroclash",
        "Electronic music",
        "Breakbeat hardcore",
        "Drum and bass",
        "Dubstep",
        "Future garage",
        "Electronic dance music",
        "Ambient music",
        "Moombahton",
        "Ambient house",
        "Big beat",
        "Happy hardcore",
        "Trip hop",
        "Uplifting trance",
        "Trance music",
        "Vocal trance",
        "Dream trance",
        "Bass music",
        "Techno",
        "Deep house",
        "Electronic body music",
        "Gabber",
        "Downtempo",
        "Electronic rock",
        "New-age music"
    ],
    "Jazz": [
        "Jazz",
        "Jazz fusion",
        "West Coast jazz",
        "Swing music",
        "Bebop",
        "Smooth jazz",
        "Jazz standard",
        "Vocal jazz",
        "Jive (dance)"
    ],
    "Blues": [
        "Twelve-bar blues",
        "Blues rock",
        "Blues",
        "Hill country blues",
        "Classic female blues",
        "Soul blues",
        "Jump blues",
        "Electric blues"
    ],
    "Country": [
        "Country music",
        "Country rock",
        "Country pop",
        "Bluegrass music",
        "Americana (music)",
        "Country folk",
        "Bro-country",
        "Western swing",
        "Country rap",
        "Jimmy Buffett",
        "Country folk",
        "Bluegrass music"
    ],
    "Folk": [
        "Folk rock",
        "Folk music",
        "Contemporary folk music",
        "Folktronica",
        "Indie folk",
        "Celtic music",
        "Anti-folk",
        "Psychedelic folk",
        "Progressive folk"
    ],
    "Metal": [
        "Alternative metal",
        "Heavy metal music",
        "Power metal",
        "Glam metal",
        "Thrash metal",
        "Industrial metal",
        "Doom metal",
        "Deathcore",
        "Metalcore",
        "Nu metal",
        "Viking metal",
        "Death metal",
        "Progressive metal",
        "Speed metal",
        "Rap metal",
        "Crossover thrash",
        "Electronicore"
    ],
    "Reggae": [
        "Reggae fusion",
        "Reggae",
        "Dancehall",
        "Dub (music)",
        "Roots reggae",
        "Rocksteady"
    ],
    "Soul/R&B": [
        "Rhythm and blues",
        "PBR&B",
        "Hip hop soul",
        "Contemporary R&B",
        "Soul music",
        "Funk",
        "Southern soul",
        "Blue-eyed soul",
        "Neo soul",
        "Go-go",
        "Northern soul",
        "Quiet storm",
        "New jack swing",
        "Doo-wop"
    ],
    "Latin": [
        "Latin music (genre)",
        "Latin pop",
        "Bossa nova",
        "Salsa music",
        "Tropical music",
        "Bachata (music)",
        "Samba",
        "Tropicália"
    ],
    "Classical": [
        "Baroque music",
        "Classical music",
        "Orchestra"
    ],
    "Punk": [
        "Pop punk",
        "Horror punk",
        "Punk rock",
        "Post-hardcore",
        "Emo",
        "Emo pop",
        "Hardcore punk",
        "Glam punk",
        "Art punk",
        "Dance-punk",
        "Post-punk"
    ],
    "Gospel/Religious": [
        "Gospel music",
        "Christian music",
        "Contemporary Christian music",
        "Christian rock"
    ],
    "Dance": [
        "Disco",
        "Euro disco",
        "Dance-pop",
        "Eurodance",
        "Dance music",
        "Nu-disco",
        "Hi-NRG",
        "Italo disco",
        "Post-disco",
        "Alternative dance",
        "Dance-punk",
        "Italo disco",
        "Dance-rock"
    ],
    "World": [
        "Chanson française",
        "Chanson",
        "Laïko",
        "Bhangragga",
        "Music of Italy",
        "Music of Hawaii",
        "Neo-Medieval music",
        "Worldbeat",
        "Afro-Caribbean music",
        "Music of the Bahamas",
        "Calypso music",
        "Celtic music",
        "Tropicália",
        "Afro-Caribbean music",
        "Worldbeat",
        "Neo-Medieval music"
    ],
    "Indie/Alternative": [
        "Adult album alternative",
        "Indie rock",
        "Indie pop",
        "Alternative rock",
        "Independent music"
    ],
    "Comedy/Novelty": [
        "Comedy hip hop",
        "Comedy music",
        "Novelty song",
        "Parody music",
        "Comedy rock"
    ],
    "Ambient": [
        "Ambient music",
        "New-age music"
    ],
    "Soundtrack": [
        "Soundtrack",
        "Broadway theatre",
        "Musical theatre",
        "Show tune"
    ],
    "Experimental": [
        "Experimental rock",
        "Noise pop",
        "No wave"
    ],
    "Other": [
        "Acoustic music",
        "Vocal music",
        "Christmas music",
        "A cappella",
        "Crossover (music)",
        "Piano",
        "Instrumental",
        "Music hall",
        "Spoken word",
        "African-American music",
        "Poetry"
    ]
}


// Write super genres to file
fs.writeFileSync('./data/songs_with_super_genres.json', JSON.stringify(superGenreMap, null, 2));
console.log("Super genres saved to ./data/songs_with_super_genres.json");