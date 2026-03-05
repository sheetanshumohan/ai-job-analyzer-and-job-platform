const express = require('express');
const router = express.Router();
const checkRole=require('../middlewares/checkRoleMiddleware.js');
const { getRecruiterJobs,getJobApplicants,createJob,getAllJobs } = require('../controllers/jobController.js');
const auth=require('../middlewares/authMiddleware.js')

router.post('/add-jobs',auth,checkRole('recruiter'),createJob)
router.get('/get-all-jobs',auth,getAllJobs)
router.get('/my-jobs',auth,checkRole('recruiter'),getRecruiterJobs)
router.get('/:id/applicants', auth, checkRole('recruiter'), getJobApplicants);

module.exports=router