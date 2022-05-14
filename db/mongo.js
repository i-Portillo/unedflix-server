const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
  connect: () => {
    mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
  },

  disconnect: () => {
    mongoose.connection.close();
  }
}

