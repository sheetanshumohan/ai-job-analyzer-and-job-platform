const Application = require('../models/Application');
const transporter = require('../config/mailer');
exports.getMyApplications = async (req, res) => {
  try {
    // Find applications where candidateId matches the logged-in user
    const applications = await Application.find({ candidateId: req.user.id })
      .populate('jobId', 'title company location description') // Get job details
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// WITHDRAW APPLICATION (For your 3rd Tab)
exports.withdrawApplication = async (req, res) => {
  try {
    const app = await Application.findOneAndDelete({ 
      _id: req.params.id, 
      candidateId: req.user.id 
    });
    
    if (!app) return res.status(404).json({ message: "Application not found" });
    
    res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateApplication=async(req,res)=>{
  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('jobId').populate('candidateId','name email')

    if (status === 'Shortlisted') {
      const mailOptions = {
        from: '"AI JobHub" <your-email@gmail.com>',
        to: app.candidateId.email,
        subject: `Congratulations! You are Shortlisted for ${app.jobId.title}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">Great News, ${app.candidateId.name}!</h2>
            <p>The recruiter at <b>${app.jobId.company}</b> has reviewed your application and shortlisted you for the <b>${app.jobId.title}</b> position.</p>
            <p>They will be in touch with you shortly regarding the next steps.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">This is an automated notification from your AI JobHub Portal.</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log("Email Error:", error);
        else console.log("Email sent: " + info.response);
      });
    }

    res.json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}