const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinaryUpload');
const {
  createRecord,
  getAllRecords,
  getRecordById,
  deleteRecord,
  verifyRecord,
} = require('../controllers/visaRecordController');

router.post('/verify', verifyRecord);
router.post('/', protect, upload.array('images', 10), createRecord); // up to 10 images
router.get('/', protect, getAllRecords);
router.get('/:id', protect, getRecordById);
router.delete('/:id', protect, deleteRecord);


module.exports = router;