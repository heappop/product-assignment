const express = require('express');
const { uploadCsvFile, getStatus } = require('../controller/imageController');
const router = express.Router();

// Apply JSON middleware to parse JSON bodies
router.use(express.json());

// Route for testing
router.get('/', async (req, res) => {
  try {
    res.status(200).send('hello route'); // Send a test response
  } catch (error) {
    res.status(500).json({ message: 'Error in route' });
  }
});

// Route to handle file upload
router.post('/upload', uploadCsvFile);

// Route to get status
router.post('/status', getStatus);

module.exports = router;
