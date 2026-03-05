const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchScore: { type: Number, default: 0 },
  aiFeedback: { type: String },
  status: { type: String, enum: ['Applied', 'Shortlisted', 'Rejected'], default: 'Applied' }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);