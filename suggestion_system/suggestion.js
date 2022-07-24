import * as genreAf from './genreAffinity.js';
import * as userAf from './userAffinity.js';

const evaluateMedia = async (user, media, similarityTable) => {

  // console.log('evaluating', media);

  const genre = genreAf.evaluateMedia(media.genres.map(genre => genre.name), user.genre_affinity);
  const users = await userAf.evaluateMedia(media._id, user.media_reviews, similarityTable);

  const randomness = 0.2;

  const evaluation = (((genre * 0.5) + (users * 0.5)) * (1 - randomness) ) + (Math.random() * randomness);

  return evaluation;
}

export const arrangeByAffinity = async (user, medias) => {

  let similarityTable = {};

  await Promise.all(medias.map(async media => {
    media.affinity = await evaluateMedia(user, media, similarityTable);

    const viewLog = user.view_logs.find( log => log.media_src.media.equals(media._id) );

    // console.log(user.view_logs);

    // if (viewLog) console.log(media.title, media.affinity);

    if ( viewLog ) {
      if (viewLog.progress === 100) media.affinity /= 2;
    }
    
    const review = user.media_reviews.find( review => review.media.equals(media._id) );
    if (review) {
      if (review.feedback === false) {
        media.affinity = 0;
      }
    }

  }));

  return medias.sort((a,b) => {
    if (a.affinity >=  b.affinity) return -1;
    else return 1;
  });
}