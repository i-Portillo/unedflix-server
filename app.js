import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import mongo from './db/mongo.js';

import Genre from './models/genre.js';
import Media from './models/media.js';
import MediaSrc from './models/mediaSrc.js';
import User from './models/user.js';

import auth from './middleware/auth.js';

import userRoutes from './routes/users.js';

//DEBUG
import { arrangeByAffinity } from './suggestion_system/suggestion.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
mongo.connect();

app.use(cors());

app.use(logger('dev'));

app.use(express.static('public'));

app.use(express.json())

app.get('/home', (req, res, next) => {

  Media.findOne({})
  .populate('genres')
  .populate('media_src')
  .exec( (err, obj) => {
    if (err) { res.send(`Movie not found`) }
    // res.write(`<img src="${obj.poster}">`);
    // res.write(`<video width="320" height="240" controls><source src="${obj.media_src[0].src}" type="video/mp4"></video>`);
    // res.end();
    res.json(obj);
  });

});

app.get('/api/media/:id', (req, res, next) => {
  Media.find({$or: [{media_id: req.params.id}, {media_id: '35'}]})
  .populate('genres')
  .populate('media_src')
  .exec( (err, media) => {
    if (err) { res.send(`Movie not found`) }
    User.findOne({})
    .populate('media_reviews')
    .exec( async (err, user) => {
      // media.rating = await evaluateMedia(user, media);
      // console.log(media);
      // res.write(`<img src="${obj.poster}">`);
      // res.write(`<video width="320" height="240" controls><source src="${obj.media_src[0].src}" type="video/mp4"></video>`);
      // res.end();
      // evaluateMedia(obj._id);
      res.json(media);
    })
  });
})

// app.post('/api/signin', (req, res, next) => {
//   console.log(req.body)
// })

const getMovieData = async (genre) => {
  return await Media.aggregate([
    {
      $lookup: {
        from: 'genres',
        localField: 'genres',
        foreignField: '_id',
        as: 'genres'
      }
    },
    {
      $match: {
        'genres.name': genre
      }
    }
  ])
}

app.get('/api/browse/genre/:genre', async (req, res, next) => {

  try {

    const user = await User.findOne()
    .populate('media_reviews');

    let media = await getMovieData(req.params.genre);
    media = await arrangeByAffinity(user, media);

    res.json(media.slice(0,10));
  } catch (err) {
    console.log(err);
  }

})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));