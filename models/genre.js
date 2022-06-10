import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const GenreSchema = new Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 100 },
  }
);

// Export model
export default mongoose.model('Genre', GenreSchema);