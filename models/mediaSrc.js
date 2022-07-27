import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MediaSrcSchema = new Schema(
  {
    media: { type: Schema.Types.ObjectId, ref: 'Media'},
    title: { type: String },
    src: { type: String },
  }
);

// Export model
export default mongoose.model('MediaSrc', MediaSrcSchema);