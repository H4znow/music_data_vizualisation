const fs = require('fs');

// Read the JSON files
const genresJson = JSON.parse(fs.readFileSync('./data/genres.json')); 
const superGenresJson = JSON.parse(fs.readFileSync('./data/songs_with_super_genres.json')); 

// Initialize an object to store the counts
let genreCounts = {};

// Step 1: Count each genre's occurrences in the song genre list
genresJson.forEach(songGenres => {
  if (Array.isArray(songGenres)) {
    songGenres.forEach(genre => {
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });
  }
});

// Step 2: Organize the genres under super-genres based on the superGenresJson mapping
let result = {
  name: "Music",
  children: []
};

// Helper function to create genre structure
const createGenreStructure = (superGenre, genres) => {
  return {
    name: superGenre,
    children: genres
      .filter(genre => genreCounts[genre]) // Only include genres that have counts
      .map(genre => ({
        name: genre,
        size: genreCounts[genre]
      }))
  };
};

// Step 3: Populate the result structure with super-genres and their respective genres and counts
Object.keys(superGenresJson).forEach(superGenre => {
  const genres = superGenresJson[superGenre];
  const genreStructure = createGenreStructure(superGenre, genres);
  if (genreStructure.children.length > 0) {
    result.children.push(genreStructure);
  }
});

// Step 4: Handle genres not classified in any super-genre (optional)
const classifiedGenres = new Set(Object.values(superGenresJson).flat());
const otherGenres = Object.keys(genreCounts).filter(genre => !classifiedGenres.has(genre));

if (otherGenres.length > 0) {
  result.children.push({
    name: "Other",
    children: otherGenres.map(genre => ({
      name: genre,
      size: genreCounts[genre]
    }))
  });
}

// Step 5: Write the final JSON structure to a file
fs.writeFileSync('./data/genre_supergenre_stucture.json', JSON.stringify(result, null, 2), 'utf8');
console.log('Output saved to output.json');
