import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy } from 'passport-local';
import passportConfig from './passportConfig.js';
import session from 'express-session';

import mongo from './db/mongo.js';

import Genre from './models/genre.js';
import Media from './models/media.js';
import MediaSrc from './models/mediaSrc.js';
import User from './models/user.js';
import ViewLog from './models/viewLog.js';

import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

//DEBUG
import { arrangeByAffinity } from './suggestion_system/suggestion.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
mongo.connect();

// DEBUG added the object inside of cors(), delete it if something breaks
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

}));

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(passport.initialize());
app.use(passport.session({ cookie: { maxAge: (1 * 60)}}));
passportConfig(passport);

app.use(logger('dev'));

app.use(express.static('public'));

app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

const loggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('Authenticated')
    res.auth = true;
    return next();
  } else {
    console.log('Not authenticated');
    res.auth = false;
    res.status(401);
    res.send('Not authorized in loggedIn()')
  }
}

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
    },
    {
      $project: {
        "title": 1,
        "poster": 1,
        "genres": 1,
        "type": 1,
      }
    }
  ])
}

app.get('/api/media/:id', loggedIn, async (req, res, next) => {
  try {
    const mediaData = await Media.findOne({ _id: req.params.id });
    res.json(mediaData);
  } catch(err) {
    console.log(err);
  }
})

app.get('/api/medias/genre/:genre', loggedIn, async (req, res, next) => {

  try {

    const user = await User.findOne({ _id: req.user.id })
    .populate('media_reviews')
    .populate({
      path: 'view_logs',
      populate: {
        path: 'media_src',
        select: { media: 1 },
        model: 'MediaSrc'
      }
    });

    let media = await getMovieData(req.params.genre);
    media = await arrangeByAffinity(user, media);

    res.json(media);
  } catch (err) {
    console.log(err);
  }
})

app.get('/api/private', loggedIn, (req, res, next) => {
  console.log('Accessing private route');
  res.status(200).send('User authenticated');
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));