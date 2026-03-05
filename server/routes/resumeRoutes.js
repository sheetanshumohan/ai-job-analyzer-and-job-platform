const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middlewares/authMiddleware.js');
const { uploadResume,updateResume } = require('../controllers/resumeController.js');

const storage=multer.diskStorage({
    destination:(req,file,cb)=>cb(null,'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})

const upload = multer({ storage });
router.post('/upload', auth, upload.single('resume'), uploadResume);
router.put('/update',auth,upload.single('resume'),updateResume)
module.exports = router;