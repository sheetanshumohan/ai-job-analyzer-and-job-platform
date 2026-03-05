const mongoose=require('mongoose')
const User=new mongoose.Schema({
    name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['candidate', 'recruiter'],
    default: 'candidate'
  },
  resumeUrl: {
    type: String, 
    default: ''
  },
  extractedText: {
    type: String, 
    default: ''
  },
  skills: [String], 
  companyName: {
    type: String,
    default: ''
  }
},{timestamps:true})

module.exports=mongoose.model('User',User)