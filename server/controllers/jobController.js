const Job = require('../models/Job');
const Application = require('../models/Application');


exports.createJob = async (req, res) => {
  try {
    const { title, description, company, location, requirements } = req.body;
    
    const newJob = new Job({
      title,
      description,
      company,
      location,
      requirements,
      recruiterId: req.user.id // Taken from the auth middleware
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.id }).sort({ createdAt: -1 });
    
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found for this recruiter." });
    }

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getJobApplicants = async (req, res) => {
  try {
    const { id } = req.params; // Job ID

    const applicants = await Application.find({ jobId: id })
      .populate('candidateId', 'name email resumeUrl skills') // Gets candidate details
      .sort({ matchScore: -1 }); // DESCENDING ORDER as requested

    res.json(applicants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllJobs=async(req,res)=>{
  try{
    const jobs=await Job.find().sort({createdAt:-1})
    res.json(jobs)
  }catch(err){
    res.status(500).json({ error: err.message });
  }
}

