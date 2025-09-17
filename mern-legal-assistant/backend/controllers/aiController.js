const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Interaction = require('../models/Interaction');
const {
  summarizeCase,
  analyzeContract,
  recommendSections,
} = require('../services/geminiService');

// Case Summarizer
const summarizeHandler = async (req, res) => {
  const { caseText } = req.body;
  if (!caseText?.trim()) {
    return res.status(400).json({ error: 'Case text is required' });
  }

  try {
    const summary = await summarizeCase(caseText);
    await Interaction.create({
      type: 'summary',
      inputText: caseText,
      aiResponse: summary,
    });
    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
};

// Contract Analyzer
const analyzeContractHandler = async (req, res) => {
  const { contractText } = req.body;
  if (!contractText?.trim()) {
    return res.status(400).json({ error: 'Contract text is required' });
  }

  try {
    const analysis = await analyzeContract(contractText);
    await Interaction.create({
      type: 'contract',
      inputText: contractText,
      aiResponse: analysis,
    });
    res.status(200).json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to analyze contract.' });
  }
};

// Recommend Legal Sections
const recommendSectionsHandler = async (req, res) => {
  const { caseText } = req.body;
  if (!caseText?.trim()) {
    return res.status(400).json({ error: 'Case description is required.' });
  }

  try {
    const sections = await recommendSections(caseText);
    await Interaction.create({
      type: 'sections',
      inputText: caseText,
      aiResponse: sections,
    });
    res.status(200).json({ sections });
  } catch (error) {
    console.error('Gemini error:', error.message);
    res.status(500).json({ error: 'Failed to recommend legal sections.' });
  }
};

// File Upload (PDF/DOCX)
const handleFileUpload = async (req, res) => {
  if (!req.file) {
    console.error('❌ No file uploaded');
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname || filePath).toLowerCase();

  try {
    let text = '';

    if (ext === '.pdf') {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      text = data.text;
      if (!text.trim()) throw new Error('PDF appears to have no extractable text.');
    } else if (ext === '.docx') {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      if (!text.trim()) throw new Error('DOCX appears to have no readable text.');
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: `Unsupported file type: ${ext}` });
    }

    fs.unlinkSync(filePath); // Cleanup

    res.status(200).json({
      success: true,
      extractedText: text,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('❌ File processing error:', err.message);
    res.status(500).json({
      error: 'Failed to process file.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// GET /history?page=1
const fetchHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const records = await Interaction.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
};

// DELETE /history/:id
const deleteInteraction = async (req, res) => {
  try {
    await Interaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete interaction.' });
  }
};

module.exports = {
  summarizeHandler,
  analyzeContractHandler,
  recommendSectionsHandler,
  handleFileUpload,
  fetchHistory,
  deleteInteraction,
};
