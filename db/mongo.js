import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export default {
  connect: () => {
    mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
  },

  disconnect: () => {
    mongoose.connection.close();
  }
}

