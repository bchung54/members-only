const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

// Export model
module.exports = mongoose.model('Message', MessageSchema);
