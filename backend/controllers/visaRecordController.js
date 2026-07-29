const sharp = require('sharp');
const VisaRecord = require('../models/VisaRecord');
const cloudinary = require('../config/cloudinary');
const imagekit = require('../config/imagekit');

// @desc  Create a new visa record with multiple images
const createRecord = async (req, res) => {
  try {
    const { visaNo, passportNo } = req.body;

    if (!visaNo || !passportNo) {
      return res.status(400).json({ message: 'Visa No and Passport No are required' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const compressedBuffer = await sharp(file.buffer)
        .resize({ width: 1800, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Only use the compressed version if it's actually smaller
      const finalBuffer = compressedBuffer.length < file.buffer.length
        ? compressedBuffer
        : file.buffer;

      console.log(`Original: ${file.buffer.length} bytes, Compressed: ${compressedBuffer.length} bytes, Using: ${finalBuffer === compressedBuffer ? 'compressed' : 'original'}`);

      const result = await imagekit.upload({
        file: finalBuffer,
        fileName: `${Date.now()}-${file.originalname}`,
        folder: '/jvvisa/visa-records',
      });

      return {
        url: result.url,
        fileId: result.fileId,
        provider: 'imagekit',
      };
    });

    const images = await Promise.all(uploadPromises);

    const record = await VisaRecord.create({
      visaNo: visaNo.trim(),
      passportNo: passportNo.trim(),
      images,
    });

    res.status(201).json({ message: 'Record created successfully', record });
  } catch (error) {
    console.error('Create Record Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc  Get all records (for the panel table)
const getAllRecords = async (req, res) => {
  try {
    const records = await VisaRecord.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Get single record by ID (for the details view)
const getRecordById = async (req, res) => {
  try {
    const record = await VisaRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Delete a record + its Cloudinary images
const deleteRecord = async (req, res) => {
  try {
    const record = await VisaRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    for (const img of record.images) {
      if (img.provider === 'imagekit' && img.fileId) {
        await imagekit.deleteFile(img.fileId);
      } else if (img.public_id) {
        // Legacy Cloudinary image (provider undefined/cloudinary)
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await record.deleteOne();
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete Record Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Public: verify a visa by exact Visa No + Passport No match
const verifyRecord = async (req, res) => {
  try {
    const { visaNo, passportNo } = req.body;

    if (!visaNo || !passportNo) {
      return res.status(400).json({ message: 'Visa No and Passport No are required' });
    }

    const record = await VisaRecord.findOne({
      visaNo: visaNo.trim(),
      passportNo: passportNo.trim(),
    });

    if (!record) {
      return res.status(404).json({ message: 'No matching record found' });
    }

    // Only return what's needed for public display
    res.status(200).json({
      visaNo: record.visaNo,
      passportNo: record.passportNo,
      images: record.images.map((img) => img.url),
      createdAt: record.createdAt,
    });
  } catch (error) {
    console.error('Verify Record Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createRecord, getAllRecords, getRecordById, deleteRecord, verifyRecord };