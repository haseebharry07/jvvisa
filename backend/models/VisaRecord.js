const mongoose = require('mongoose');

const visaRecordSchema = new mongoose.Schema(
  {
    visaNo: { type: String, required: true, trim: true },
    passportNo: { type: String, required: true, trim: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('VisaRecord', visaRecordSchema);