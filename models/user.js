const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true},
    role: { type: String, required: true, default: 'user'},
    name: { type: String },
    family_name: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip_code: { type: String },
    bank_details: { type: String },
    subscription_status: { type: String }
  }
)

// Export model
module.exports = mongoose.model('User', UserSchema);