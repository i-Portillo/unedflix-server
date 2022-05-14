const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaSchema = new Schema(
  {
    media_id: { type: String, required: true },
    title: { type: String, required: true, minlength: 1, maxlength: 100 },
    genres: [{ type: Schema.Types.ObjectId, ref: 'Genre'}],
    overview: { type: String },
    type: { type: String },
    director: { type: [String] },
    runtime: { type: Number },
    release_date: { type: Date },
    rating: { type: Number },
    cast: { type: [String] },
    production: { type: String },
    imdb_id: { type: String },
    poster: { data: Buffer, contentType: String }
  }
)

// Export model
module.exports = mongoose.model('Media', MediaSchema);