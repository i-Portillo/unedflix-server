import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MediaReviewSchema = new Schema(
  {
    feedback: { type: Boolean, required: true },
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User'},
    media: { type: Schema.Types.ObjectId, required: true,  ref: 'Media'},
  }
);

// Export model
export default mongoose.model('MediaReview', MediaReviewSchema);