import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MediaSchema = new Schema(
  {
    media_id: { type: String, required: true },
    title: { type: String, required: true, minlength: 1, maxlength: 100 },
    genres: [{ type: Schema.Types.ObjectId, ref: 'Genre'}],
    overview: { type: String },
    type: { type: String },
    director: { type: [String] },
    release_date: { type: Date },
    cast: { type: [String] },
    production: { type: String },
    poster: { type: String, required: true },
    runtime: { type: Number },
    updated: { type: Date },
    media_src: [ [ { type: Schema.Types.ObjectId, ref: 'MediaSrc'} ] ]
  },
  { toJSON: { virtuals: true } }
)

MediaSchema.virtual('number_of_episodes').get(function() {
  let number = 0;
  if (this.media_src) {
    this.media_src.forEach(season => {
      number += season.length;
    });
  }
  return number;
})

// Export model
export default mongoose.model('Media', MediaSchema);