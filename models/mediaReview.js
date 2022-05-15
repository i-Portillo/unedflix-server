const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaReviewSchema = new Schema(
  {
    liked: { type: Boolean },
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    media: { type: Schema.Types.ObjectId, ref: 'Media'},
  }
);

// Export model
module.exports = mongoose.model('MediaReview', MediaReviewSchema);