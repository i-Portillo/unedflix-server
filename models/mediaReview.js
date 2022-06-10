import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MediaReviewSchema = new Schema(
  {
    feedback: Boolean,
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    media: { type: Schema.Types.ObjectId, ref: 'Media'},
  }
);

// Export model
export default mongoose.model('MediaReview', MediaReviewSchema);