const express = require('express');
const { uploadCsvFile, getStatus } = require('../controller/imageController');
const router = express.Router();
router.use(express.json());

router.get('/', async (req, res) => {
  try {
    res.status(200).send('hello route'); 
  } catch (error) {
    res.status(500).json({ message: 'Error in route' });
  }
});

router.post('/upload', uploadCsvFile);
router.post('/status', getStatus);

module.exports = router;
