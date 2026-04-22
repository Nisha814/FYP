const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  plantType: {
    type: String,
    required: true
  },
  plantCategory: {
    type: String,
    enum: ['vegetable', 'fruit', 'other'],
    default: 'other'
  },
  identifiedPlant: {
    type: String,
    default: 'Unknown'
  },
  diseaseDetected: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  isHealthy: {
    type: Boolean,
    default: false
  },
  recommendations: [{
    treatmentType: {
      type: String,
      enum: ['fertilizer', 'pesticide', 'organic', 'cultural']
    },
    name: String,
    description: String,
    application: String,
    dosage: String
  }],
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
predictionSchema.index({ user: 1, createdAt: -1 });
predictionSchema.index({ diseaseDetected: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);

