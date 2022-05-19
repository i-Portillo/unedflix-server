const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaSrcSchema = new Schema(
  {
    media: { type: Schema.Types.ObjectId, ref: 'Media'},
    src: { type: String }
  }
);

// Export model
module.exports = mongoose.model('MediaSrc', MediaSrcSchema);