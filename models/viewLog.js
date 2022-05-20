const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ViewLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User'},
    media_src: { type: Schema.Types.ObjectId, ref: 'MediaSrc'},
    date: { type: Date },
    progress: { type: Number, min: 0, max: 100 },
  }
);

// Export model
module.exports = mongoose.model('ViewLog', ViewLogSchema);