const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mongo = require('./db/mongo');
const Genre = require('./models/genre');
const Media = require('./models/media');

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// Set up mongoose connection
// const mongoose = require('mongoose');
// const mongoDB = process.env.MONGODB;
// mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongo.connect();

app.use(cors());

app.get('/', (req, res, next) => {

  // const genre = new Genre(
  //   { name: 'Test' }
  // );
  // genre.save( err => {
  //   if (err) { return next(err); }
  //   res.send('Movie-App Express Server.');
  // })
  Media.findOne({}, (err, obj) => {
    res.send('Hello World!');
  });

  
  
});

const genre = new Genre(
  { name: 'Test' }
);
genre.save( err => {
  if (err) { console.log(err); }
  
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
