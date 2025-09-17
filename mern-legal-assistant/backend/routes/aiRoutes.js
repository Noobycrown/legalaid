const express = require('express');
const router = express.Router();

const {
  summarizeHandler,
  analyzeContractHandler,
  recommendSectionsHandler,
  handleFileUpload,
  fetchHistory,
  deleteInteraction
} = require('../controllers/aiController');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Test route
router.get('/test', (req, res) => {
  res.send('AI route is working!');
});

// AI operations
router.post('/summarize', summarizeHandler);
router.post('/analyze-contract', analyzeContractHandler);
router.post('/recommend-sections', recommendSectionsHandler);
router.post('/upload', upload.single('file'), handleFileUpload);

// History operations
router.get('/history', fetchHistory);
router.delete('/history/:id', deleteInteraction);

module.exports = router;
