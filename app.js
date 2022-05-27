const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const mongo = require('./db/mongo');
const Genre = require('./models/genre');
const Media = require('./models/media');
const MediaSrc = require('./models/mediaSrc');

//DEBUG
const { evaluateMedia, compareUsers } = require('./suggestion_system/userAffinity')

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
mongo.connect();

app.use(cors());

app.use(morgan('tiny'));

app.use(express.static('public'));

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
  Media.findOne({media_id: req.params.id})
  .populate('genres')
  .populate('media_src')
  .exec( (err, obj) => {
    if (err) { res.send(`Movie not found`) }
    // res.write(`<img src="${obj.poster}">`);
    // res.write(`<video width="320" height="240" controls><source src="${obj.media_src[0].src}" type="video/mp4"></video>`);
    // res.end();
    // evaluateMedia(obj._id);
    res.json(obj);
  });
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));