const PDFParser = require("pdf2json");
const fs = require('fs');
const cloudinary = require('../utils/cloudinary');
const User = require('../models/User');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const pdfParser = new PDFParser(null, 1); // '1' flag means extract raw text only

    // Create a Promise to handle the asynchronous parsing
    const getPdfText = () => {
      return new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          const rawText = pdfParser.getRawTextContent();
          resolve(rawText);
        });
        pdfParser.loadPDF(req.file.path);
      });
    };

    const extractedText = await getPdfText();
    
    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error("Could not extract enough text. The PDF might be an image.");
    }

    // 2. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'resumes',
      resource_type: 'auto',
    });

    // 3. Update User in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        resumeUrl: result.secure_url, 
        extractedText: extractedText 
      },
      { new: true }
    );

    // 4. Clean up local file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Resume uploaded and text extracted!",
      url: result.secure_url,
      user: updatedUser
    });

  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to process resume" });
  }
};

exports.updateResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // 1. FIND THE USER FIRST
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. DELETE OLD RESUME FROM CLOUDINARY (If exists)
    if (user.resumeUrl) {
      try {
        // Extract the public_id from the Cloudinary URL
        const urlParts = user.resumeUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = fileName.split('.')[0];
        
        // Delete old file to save space
        await cloudinary.uploader.destroy(`resumes/${publicId}`, { resource_type: 'raw' });
      } catch (err) {
        console.log("Cloudinary Delete Error (Non-critical):", err.message);
      }
    }

    // 3. PARSE NEW PDF TEXT (Using pdf2json logic)
    const pdfParser = new PDFParser(null, 1);

    const getPdfText = () => {
      return new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => {
          const rawText = pdfParser.getRawTextContent();
          resolve(rawText);
        });
        pdfParser.loadPDF(req.file.path);
      });
    };
    const newExtractedText = await getPdfText();

    // 4. UPLOAD NEW FILE TO CLOUDINARY
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'resumes',
      resource_type: 'auto',
    });

    // 5. UPDATE MONGODB
    user.resumeUrl = result.secure_url;
    user.extractedText = newExtractedText;
    await user.save();

    // 6. CLEANUP LOCAL FILE
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: "Resume updated and re-analyzed successfully!",
      url: result.secure_url,
      user: user
    });

  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update resume" });
  }
};