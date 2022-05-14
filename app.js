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

app.use(express.static('public'));

app.get('/', (req, res, next) => {

  Media.findOne({}, (err, obj) => { 
    if (err) { res.send(`Movie not found`) }
    res.write(`<img src="${obj.poster}">`);
    res.end();
    // res.sendFile(__dirname + `/public/images/movie_posters/${obj.media_id}.jpg`)
  });
  
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
