export const increaseAffinity = (likedGenres, userPreference, amount=5) => {
  userPreference.forEach( genre => {
    if (likedGenres.includes(genre.genre)) {
      genre.value += amount;
    }
  })
  normalizePreferences(userPreference);
}

export const decreaseAffinity = (likedGenres, userPreference, amount=5) => {
  userPreference.forEach( genre => {
    if (likedGenres.includes(genre.genre)) {
      genre.value -= amount;
      if (genre.value < 1) genre.value = 1;
    }
  })
  normalizePreferences(userPreference);
}

export const normalizePreferences = (userPreference) => {
  const r = (userPreference.length * 50) / (userPreference.reduce( (prev, obj) => prev + obj.value, 0));

  userPreference.map( genre => {
    genre.value = genre.value * r;
    if (genre.value > 100) genre.value = 100;
  })
}

export const evaluateMedia = (mediaGenres, userPreference) => {

  return userPreference
    .filter( genre => mediaGenres.includes(genre.genre))  // Find mediaGenres in userPreference
    .reduce( (prev, genre) => prev + genre.value, 0) / mediaGenres.length; // Add the affinity value and average
}

// module.exports = { increaseAffinity, decreaseAffinity, evaluateMedia }
