const fs = require('fs');
const path = require('path');
const async = require('async');
const bcrypt = require('bcrypt');

const mongo = require('./mongo');
const { increaseAffinity, decreaseAffinity, evaluateMedia } = require('../suggestion_system/genreAffinity');

// Models
const Genre = require('../models/genre');
const Media = require('../models/media');
const User = require('../models/user');
const MediaSrc = require('../models/mediaSrc');
const ViewLog = require('../models/viewLog');
const MediaReview = require('../models/mediaReview');

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

const buildMedia = async (obj, cb) => {
  
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
    runtime: obj.runtime,
    release_date: obj.release_date,
    rating: obj.rating,
    cast: obj.cast,
    director: obj.director,
    production: obj.production,
    imdb_id: obj.imdb_id,
    poster: `/images/movie_posters/${obj.media_id}.jpg`,
    updated: obj.release_date,
  })

  const mediaSrc = new MediaSrc({
    media: media,
    src: `/media/video.mp4`
  })

  media.media_src = [ mediaSrc ];

  media.save( (err) => {
    if (err) {
      cb(err, null);
      return;
    }
    // console.log('New Media:', media.title);
    medias.push(media);
    mediaSrc.save( (err) => {
      if (err) {
        cb(err, null);
        return;
      }
      // console.log('Added MediaSrc');
    })
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
      // genre_affinity: affinities
    });

    const mediaQty = (Math.floor((Math.random() * 50) + 51));

    Media.aggregate([{$sample: {size: mediaQty }}, {$lookup: {from: 'genres', localField: 'genres', foreignField: '_id', as: 'genres'}}], (err, results) => {
      if (err) { console.log(err); }
      results.forEach(media => {

        const viewLog = new ViewLog({
          user: user,
          media_src: media.media_src[0],
          date: new Date(),
          progress: (Math.random() > 0.05 ? 100 : Math.floor(Math.random() * 100))
        })

        user.view_logs.push(viewLog);

        const mediaGenres = media.genres.map(genre => genre.name);

        if (viewLog.progress === 100) {

          const evaluation = evaluateMedia(mediaGenres, affinities)
          
          if (evaluation => 50 || evaluation < 30) {
            const review = new MediaReview({
              media: media,
              user: user,
              feedback: ((evaluation => 50) ? true : false)
            });
            (evaluation => 50) ? increaseAffinity(mediaGenres, affinities) : decreaseAffinity(mediaGenres, affinities);
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
        // console.log('New User:', user.email);
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

const createMedias = cb => {
  const raw = fs.readFileSync(path.resolve(__dirname, './sample_data/movie-data.json'));
  const mediaSamples = JSON.parse(raw);
  async.series( mediaSamples.map( obj => {
    return (callback) => {
      buildMedia(obj, callback)
    };
  }), cb);
};

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
  createMedias,
  createUsers,
], (err, results) => {
  if (err) { console.log('FINAL ERR:', err); }
  else console.log('All saved');
  setTimeout(mongo.disconnect, 5000);
})