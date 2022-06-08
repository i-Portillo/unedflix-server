const media = require('../models/media');
const genreAf = require('./genreAffinity');
const userAf = require('./userAffinity');

const evaluateMedia = async (user, media, similarityTable) => {

  // console.log(user);

  const genre = genreAf.evaluateMedia(media.genres.map(genre => genre.name), user.genre_affinity);
  const users = await userAf.evaluateMedia(media._id, user.media_reviews, similarityTable);
  // const users = 100;

  // console.log(media.title, users)

  const randomness = 0.2;

  return (((genre * 0.5) + (users * 0.5)) * (1 - randomness) ) + (Math.random() * randomness);
}

const arrangeByAffinity = async (user, medias) => {
  // medias.forEach( async media => {
  //   media.affinity = await evaluateMedia(user, media);
  //   console.log(media.affinity)
  // })

  let similarityTable = {};

  await Promise.all(medias.map(async media => {
    media.affinity = await evaluateMedia(user, media, similarityTable);
  }))

  console.log(Object.keys(similarityTable).length)

  return medias.sort((a,b) => {
    if (a.affinity >=  b.affinity) return -1;
    else return 1;
  })
} 

module.exports = { arrangeByAffinity };
