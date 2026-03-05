const express = require('express');
const router = express.Router();
const auth=require('../middlewares/authMiddleware.js')
const { getMyApplications, withdrawApplication,updateApplication } = require('../controllers/appController');

// This matches your frontend URL: /api/applications/my-apps
router.get('/my-apps', auth, getMyApplications);

// Route to withdraw/delete an application
router.delete('/:id', auth, withdrawApplication);

router.patch('/:id/status',auth,updateApplication)
module.exports = router;