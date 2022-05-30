const genreAf = require('./genreAffinity');
const userAf = require('./userAffinity');

const evaluateMedia = async (user, media) => {

  const genre = genreAf.evaluateMedia(media.genres.map(genre => genre.name), user.genre_affinity);
  const users = await userAf.evaluateMedia(media._id, user.media_reviews);

  return (genre * 0.5) + (users * 0.5) ;
}

module.exports = { evaluateMedia };
