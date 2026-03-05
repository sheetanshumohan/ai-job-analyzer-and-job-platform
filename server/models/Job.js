const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // The main text for AI comparison
  company: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  requirements: [String], 
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);