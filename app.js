import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import passportConfig from './passportConfig.js';
import session from 'express-session';

import mongo from './db/mongo.js';

import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
mongo.connect();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(fileUpload());

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(passport.initialize());
app.use(passport.session({ cookie: { maxAge: (1 * 60)}}));
passportConfig(passport);

app.use(logger('dev'));

app.use(express.static('public'));

app.use(express.json())

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));