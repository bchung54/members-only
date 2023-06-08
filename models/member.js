const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MemberSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['user', 'club'],
    default: 'user',
  },
  admin: { type: Boolean },
});

// Export model
module.exports = mongoose.model('Member', MemberSchema);
