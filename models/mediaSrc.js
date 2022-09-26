import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MediaSrcSchema = new Schema(
  {
    media: { type: Schema.Types.ObjectId, required: true, ref: 'Media'},
    title: { type: String, required: true },
    src: { type: String, required: true },
  }
);

// Export model
export default mongoose.model('MediaSrc', MediaSrcSchema);