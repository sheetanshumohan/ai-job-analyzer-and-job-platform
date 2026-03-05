const express=require('express')
const mongoose=require('mongoose')
const cors=require('cors')
const dotenv=require('dotenv')
const auth=require('./routes/authRoutes.js')
const jobs=require('./routes/jobRoutes.js')
const ai=require('./routes/aiRoutes.js')
const application=require('./routes/appRoutes.js')
const resume=require('./routes/resumeRoutes.js')

require('dotenv').config()
const app=express()


app.use(cors({
  origin:"https://ai-job-analyzer-and-job-platform-o8.vercel.app",
  credentials:true
}))
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Connected Mongo DB")
}).catch((err)=>{console.log(`Mongo DB Connection Error ${err}`)})


app.use('/api/auth',auth)
app.use('/api/jobs',jobs)
app.use('/api/ai',ai)
app.use('/api/applications', application);
app.use('/api/resume',resume)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is flying on port ${PORT}`);
});

module.exports=app