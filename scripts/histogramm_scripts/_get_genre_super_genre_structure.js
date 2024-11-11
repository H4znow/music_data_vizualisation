const fs = require('fs');

// Read the JSON files
const songData   = JSON.parse(fs.readFileSync('./data/songs_v2.json')); 
const genreMapping   = JSON.parse(fs.readFileSync('./data/songs_with_super_genres.json')); 

// Function to process genre and song data
function processGenreData(genreMapping, songData) {
  // Create a map to store counts for each genre
  const genreCounts = new Map();

  // Count occurrences of each genre in songs
  songData.forEach(song => {
      if (song.genre && song.genre !== "Unknown") {
          genreCounts.set(song.genre, (genreCounts.get(song.genre) || 0) + 1);
      }
  });

  // Create the hierarchical structure
  const result = {
      name: "Music",
      children: []
  };

  // Process each super genre
  for (const [superGenre, subGenres] of Object.entries(genreMapping)) {
      const superGenreNode = {
          name: superGenre,
          children: []
      };

      // Process each subgenre
      subGenres.forEach(subGenre => {
          const count = genreCounts.get(subGenre) || 0;
          if (count > 0) {
              superGenreNode.children.push({
                  name: subGenre,
                  size: count
              });
          }
      });

      // Only add super genre if it has children
      if (superGenreNode.children.length > 0) {
          result.children.push(superGenreNode);
      }
  }

  // Create "Other" category for genres that don't fit in the mapping
  const mappedGenres = new Set(Object.values(genreMapping).flat());
  const otherGenres = [];

  genreCounts.forEach((count, genre) => {
      if (!mappedGenres.has(genre)) {
          otherGenres.push({
              name: genre,
              size: count
          });
      }
  });

  if (otherGenres.length > 0) {
      result.children.push({
          name: "Other",
          children: otherGenres
      });
  }

  return result;
}
const result = processGenreData(genreMapping, songData);

// Step 5: Write the final JSON structure to a file
fs.writeFileSync('./data/genre_supergenre_structure.json', JSON.stringify(result, null, 2), 'utf8');
console.log('Output saved to output.json');
