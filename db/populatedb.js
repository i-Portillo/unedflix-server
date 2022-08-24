import fs from 'fs';
import async from 'async';
import bcrypt from 'bcryptjs';

import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import mongo from './mongo.js';
import { increaseAffinity, decreaseAffinity, evaluateMedia } from '../suggestion_system/genreAffinity.js';

// Models
import Genre from '../models/genre.js';
import Media from '../models/media.js';
import User from '../models/user.js';
import MediaSrc from '../models/mediaSrc.js';
import ViewLog from '../models/viewLog.js';
import MediaReview from '../models/mediaReview.js';

let genres = [];
let medias = [];
let users = [];

mongo.connect();

const buildGenre = (obj, cb) => {
  const genre = new Genre({
    name: obj.name,
  });

  genre.save( (err) => {
    if (err) {
      cb(err, null);
      return;
    }
    // console.log('New Genre:', genre.name);
    genres.push(genre);
    cb(null, genre);
  });
}

const buildMovie = async (obj, cb) => {
  
  const genres = await Promise.all( obj.genres.map( async (genreName) => {
    const foundGenre = await Genre.findOne({name: genreName})
    return foundGenre;
  }))

  const media = new Media({
    media_id: obj.media_id,
    title: obj.title,
    genres: genres,
    overview: obj.overview,
    type: 'Movie',
    release_date: obj.release_date,
    cast: obj.cast,
    director: obj.director,
    production: obj.production,
    poster: `/images/movie_posters/${obj.media_id}.jpg`,
    updated: obj.release_date,
  })

  const mediaSrc = new MediaSrc({
    media: media,
    title: media.title,
    src: `/media/video.mp4`
  })

  media.media_src = [ [mediaSrc] ];

  media.save( (err) => {
    if (err) {
      cb(err, null);
      return;
    }
    medias.push(media);
    mediaSrc.save( (err) => {
      if (err) {
        cb(err, null);
        return;
      }
    })
    cb(null, media);
  });
};

const buildShow = async (obj, cb) => {

  const genres = await Promise.all( obj.genres.map( async (genreName) => {
    const foundGenre = await Genre.findOne({name: genreName})
    return foundGenre;
  }))

  const media = new Media({
    media_id: obj.media_id,
    title: obj.title,
    genres: genres,
    overview: obj.overview,
    type: 'Show',
    release_date: obj.release_date,
    cast: obj.cast,
    director: obj.director,
    production: obj.production,
    poster: `/images/show_posters/${obj.media_id}.jpg`,
    updated: obj.updated,
  })

  const seasons = [];
  for (const season of obj.seasons) {
    const episodes = [];
    for (const episode of season) {
      const episodeSrc = new MediaSrc({
        media: media,
        title: episode,
        src: `/media/video.mp4`,
      })
      episodeSrc.save( (err) => {
        if (err) {
          cb(err, null);
          return;
        }
      })
      episodes.push(episodeSrc);
    }
    seasons.push(episodes);
  }

  media.media_src = seasons;

  media.save( (err) => {
    if (err) {
      cb(err, null);
      return;
    }
    medias.push(media);
    // mediaSrc.save( (err) => {
    //   if (err) {
    //     cb(err, null);
    //     return;
    //   }
    // })
    cb(null, media);
  });

};

const buildUser = async (obj, cb) => {
  
  bcrypt.hash(obj.password, 10, (err, hashedPassword) => {
    if (err) {
      console.log(err);
      return;
    }

    const defaultAffinity = 50;
    const affinities = genres.map( genre => {
      return {
        genre: genre.name,
        value: defaultAffinity
      };
    })

    const randomGenres = genres.sort( () => 0.5 - Math.random()).slice(0,8).map( genre => genre.name);
    const likedGenres = randomGenres.slice(0,5);
    const dislikedGenres = randomGenres.slice(5);

    increaseAffinity(likedGenres, affinities, 30);
    decreaseAffinity(dislikedGenres, affinities, 10);

    const user = new User({
      email: obj.email,
      password: hashedPassword,
      name: obj.name,
      family_name: obj.family_name,
      address: obj.address,
      city: obj.city,
      state: obj.state,
      zip_code: obj.zip_code,
      bank_details: obj.bank_details,
      subscription_status: obj.subscription_status,
    });

    const lastPayment = new Date();

    if (obj.subscription_status === 'Active') {
      lastPayment.setDate(lastPayment.getDate() - (Math.ceil(Math.random(20))));
    } else {
      lastPayment.setDate(lastPayment.getDate() - (Math.ceil(Math.random(150)) + 30));
    }

    user.last_payment = lastPayment;

    const mediaQty = (Math.ceil((Math.random() * 20) + 10)); // Sets a random amount [11-30] of viewLogs to be generated per user

    Media.aggregate([{$sample: {size: mediaQty }}, {$lookup: {from: 'genres', localField: 'genres', foreignField: '_id', as: 'genres'}}], (err, results) => {
      if (err) { console.log(err); }
      results.forEach(media => {

        const viewLog = new ViewLog({
          user: user,
          media_src: media.media_src[0][0],
          date: new Date(),
          progress: (Math.random() > 0.10 ? 100 : Math.floor(Math.random() * 90))
        })

        user.view_logs.push(viewLog);

        const mediaGenres = media.genres.map(genre => genre.name);

        if (viewLog.progress === 100) {

          const evaluation = evaluateMedia(mediaGenres, affinities)

          const likedThreshold = 55;
          
          if (evaluation >= likedThreshold || evaluation < 40) {
            const review = new MediaReview({
              media: media,
              user: user,
              feedback: ((evaluation >= likedThreshold) ? true : false)
            });
            (evaluation >= likedThreshold) ? increaseAffinity(mediaGenres, affinities) : decreaseAffinity(mediaGenres, affinities);
            user.media_reviews.push(review);
          }
        }
      });

      user.genre_affinity = affinities;

      user.save( (err) => {
        if (err) {
          console.log('error in user:', err)
          cb(err, null);
          return;
        }
        users.push(user);
        user.view_logs.forEach( log => {
          log.save( (err) => {
            if (err) {
              console.log('error in viewlog:', err)
              cb(err, null);
              return;
            }
          });
        });
        user.media_reviews.forEach( review => {
          review.save( (err) => {
            if (err) {
              console.log('error in mediareview:', err)
              cb(err, null);
              return;
            }
          });
        });
        cb(null, user);
      });
    });
  });
}

const createGenres = cb => {
  const raw = fs.readFileSync(path.resolve(__dirname, './sample_data/genres-data.json'));
  const genreSamples = JSON.parse(raw);
  async.series( genreSamples.map( obj => {
    return (callback) => {
      buildGenre(obj, callback)
    };
  }), cb);
};

const createMovies = cb => {
  const raw = fs.readFileSync(path.resolve(__dirname, './sample_data/movie-data.json'));
  const mediaSamples = JSON.parse(raw);
  async.series( mediaSamples.map( obj => {
    return (callback) => {
      buildMovie(obj, callback)
    };
  }), cb);
};

const createShows = cb => {
  const raw = fs.readFileSync(path.resolve(__dirname, './sample_data/show-data.json'));
  const mediaSamples = JSON.parse(raw);
  async.series( mediaSamples.map( obj => {
    return (callback) => {
      buildShow(obj, callback)
    };
  }), cb);
}

const createUsers = cb => {
  const raw = fs.readFileSync(path.resolve(__dirname, './sample_data/user-data.json'));
  const userSamples = JSON.parse(raw);
  async.series( userSamples.map( obj => {
    return (callback) => {
      buildUser(obj, callback)
    };
  }), cb);
};


async.series([
  createGenres,
  createMovies,
  createShows,
  createUsers,
], (err, results) => {
  if (err) { console.log('FINAL ERR:', err); }
  else console.log('All saved');
  setTimeout(mongo.disconnect, 5000);
})