const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const OpenAI=require('openai')


const dotenv=require('dotenv')

dotenv.config()
const openai=new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

exports.analyzeAndApply = async (req, res) => {
  try {
    const { jobId } = req.body;
    const candidateId = req.user.id;
    const user = await User.findById(candidateId);
    const job = await Job.findById(jobId);

    if (!user.extractedText) {
      return res.status(400).json({ message: "Please upload your resume first." });
    }

    const prompt = `
      You are an expert HR recruiter. Compare the following Resume and Job Description.
      
      Job Description: ${job.description}
      Resume Text: ${user.extractedText}

      Return ONLY a JSON object with:
      1. "matchScore": (A number from 0 to 100)
      2. "missingSkills": (Array of skills mentioned in job but not in resume)
      3. "feedback": A 2-sentence explanation of why this score was given, highlighting strengths and missing skills
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);
    const newApplication = new Application({
      jobId,
      candidateId,
      matchScore: aiResult.matchScore,
      aiFeedback: aiResult.feedback
    });

    await newApplication.save();

    res.status(200).json({ 
      message: "Application submitted and analyzed!", 
      score: aiResult.matchScore, 
      feedback:aiResult.feedback
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};