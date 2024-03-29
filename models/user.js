import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true},
    role: { type: String, required: true, enum: ['user', 'employee', 'admin'], default: 'user'},
    name: { type: String },
    family_name: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip_code: { type: String },
    bank_details: { type: String, required: true },
    subscription_status: { type: String, required: true, default: 'Active' },
    genre_affinity: [{
      genre: { type: String },
      value: { type: Number }
    }],
    view_logs: [ { type: Schema.Types.ObjectId, ref: 'ViewLog' } ],
    media_reviews: [ { type: Schema.Types.ObjectId, ref: 'MediaReview' } ],
    my_list: [ { 
      media: { type: Schema.Types.ObjectId, ref: 'Media'},
      added: { type: Date }
    } ],
    last_payment: { type: Date },
  }
)

// Export model
export default mongoose.model('User', UserSchema);