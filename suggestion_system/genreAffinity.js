const increaseAffinity = (likedGenres, userPreference) => {
  // likedGenres.forEach( likedGenre => {
  //   userPreference[likedGenre] += 5;
  // })
  // normalizePreferences();

  userPreference.forEach( genre => {
    if (likedGenres.includes(genre.genre)) {
      genre.value += 5;
    }
  })
  normalizePreferences(userPreference);
}

const decreaseAffinity = likedGenres => {
  // likedGenres.forEach( likedGenre => {
  //   userPreference[likedGenre] -= 5;
  // })
  // normalizePreferences();

  userPreference.forEach( genre => {
    if (likedGenres.includes(genre.genre)) {
      genre.value -= 5;
    }
  })
  normalizePreferences(userPreference);
}

const normalizePreferences = (userPreference) => {
  // const r = (userPreference.length * 50) / (Object.values(userPreference).reduce( (prev, value) => prev + value, 0));

  // Object.keys(userPreference).map( key => {
  //   userPreference[key] = userPreference[key] * r;
  //   if (userPreference[key] > 100) userPreference[key] = 100;
  // })

  const r = (userPreference.length * 50) / (userPreference.reduce( (prev, obj) => prev + obj.value, 0));

  userPreference.map( genre => {
    genre.value = genre.value * r;
    if (genre.value > 100) genre.value = 100;
  })
}

const evaluateMedia = (mediaGenres, userPreference) => {
  // return (mediaGenres.reduce( (prev, genre) => prev + userPreference[genre], 0)) / mediaGenres.length;

  return userPreference
    .filter( genre => mediaGenres.includes(genre.genre))  // Find mediaGenres in userPreference
    .reduce( (prev, genre) => prev + genre.value, 0) / mediaGenres.length; // Add the affinity value and average
}

module.exports = { increaseAffinity, decreaseAffinity, evaluateMedia }

 // DEBUG
const userPreference = [
  {genre: 'Action', value: 50},
  {genre: 'Adventure', value: 50},
  {genre: 'Animation', value: 50},
  {genre: 'Comedy', value: 50},
  {genre: 'Crime', value: 50},
  {genre: 'Documentary', value: 50},
  {genre: 'Drama', value: 50},
  {genre: 'Family', value: 50},
  {genre: 'Fantasy', value: 50},
  {genre: 'History', value: 50},
  {genre: 'Horror', value: 50},
  {genre: 'Music', value: 50},
  {genre: 'Mystery', value: 50},
  {genre: 'Romance', value: 50},
  {genre: 'Science Fiction', value: 50},
  {genre: 'TV Movie', value: 50},
  {genre: 'Thriller', value: 50},
  {genre: 'War', value: 50},
  {genre: 'Western', value: 50}
]

increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);

increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
increaseAffinity(['Adventure', 'Action', 'Horror', 'Thriller'], userPreference);
console.log(userPreference);

// console.log('------------');

console.log(evaluateMedia(['Action', 'Horror', 'Animation'], userPreference));

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

// console.log(userPreference);

// END DEBUG
