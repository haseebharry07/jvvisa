const mongoose = require('mongoose');

const visaRecordSchema = new mongoose.Schema(
  {
    visaNo: { type: String, required: true, trim: true },
    passportNo: { type: String, required: true, trim: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String }, // required: true removed — only used for Cloudinary images
        fileId: { type: String },    // only used for ImageKit images
        provider: { type: String, enum: ['cloudinary', 'imagekit'], default: 'cloudinary' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('VisaRecord', visaRecordSchema);