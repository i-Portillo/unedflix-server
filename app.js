const express = require('express');
const cors = require('cors');
const logger = require('morgan');
require('dotenv').config();

const mongo = require('./db/mongo');
const Genre = require('./models/genre');
const Media = require('./models/media');
const MediaSrc = require('./models/mediaSrc');
const User = require('./models/user');

//DEBUG
const { arrangeByAffinity } = require('./suggestion_system/suggestion')

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

app.post('/api/signin', (req, res, next) => {
  console.log(req.body)
})

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