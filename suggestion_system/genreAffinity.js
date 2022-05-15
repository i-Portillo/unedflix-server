const increaseAffinity = likedGenres => {
  likedGenres.forEach( likedGenre => {
    userPreference[likedGenre] += 5;
  })
  normalizePreferences();
}

const decreaseAffinity = likedGenres => {
  likedGenres.forEach( likedGenre => {
    userPreference[likedGenre] -= 5;
  })
  normalizePreferences();
}

const normalizePreferences = () => {
  const r = (genres.length * 50) / (Object.values(userPreference).reduce( (prev, value) => prev + value, 0));

  Object.keys(userPreference).map( key => {
    userPreference[key] = Math.round(userPreference[key] * r);
    if (userPreference[key] > 100) userPreference[key] = 100;
  })
}

const evaluateMedia = mediaGenres => {
  return (mediaGenres.reduce( (prev, genre) => prev + userPreference[genre], 0)) / mediaGenres.length;
}

 // DEBUG
const genres = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Science Fiction',
  'TV Movie',
  'Thriller',
  'War',
  'Western'
]

// let userPreference = {};

// genres.forEach(genre => {
//   userPreference[genre] = 50;
// })

// // END DEBUG


// increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller']);
// increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller']);
// increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller']);
// increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller']);
// increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller']);
// increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller']);
// increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller']);
// increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller']);
// increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller']);
// increaseAffinity(['Adventure', 'Family', 'Animation']);
// increaseAffinity(['Adventure', 'Action', 'Comedy', 'Romance']);

// decreaseAffinity(['Romance', 'Western']);
// decreaseAffinity(['Western', 'War', 'History']);
// decreaseAffinity(['Comedy', 'Romance', 'TV Movie']);
