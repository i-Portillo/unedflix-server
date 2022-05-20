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
