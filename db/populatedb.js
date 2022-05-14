const fs = require('fs');
const path = require('path');
const async = require('async');

const mongo = require('./mongo');

// Models
const Media = require('../models/media');
const Genre = require('../models/genre');
const User = require('../models/user'); // NOT IMPLEMENTED

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
    console.log('New Genre:', genre.name);
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
    poster: {
      data: fs.readFileSync(path.join(__dirname + `/sample_data/movie_posters/${obj.media_id}.jpg`)),
      contentType: 'image/jpg'
    }
  })

  media.save( (err) => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Media:', media.title);
    cb(null, media);
  });
};

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

async.series([
  //createGenres,
  createMedias,
], (err, results) => {
  if (err) { console.log('FINAL ERR:', err); }
  else console.log('All saved');
  mongo.disconnect();
})