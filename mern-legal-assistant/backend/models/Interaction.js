const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['summary', 'contract', 'sections'],
    required: true,
  },
  inputText: {
    type: String,
    required: true,
  },
  aiResponse: {
    type: String,
    required: true,
  },
  fileName: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Interaction', interactionSchema);
