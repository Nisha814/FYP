const Prediction = require('../models/Prediction');
const mongoose = require('mongoose');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// @desc    Create new prediction
// @route   POST /api/predictions
// @access  Private
exports.createPrediction = async (req, res, next) => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const { plantType, location, notes } = req.body;
    const imagePath = req.file.path;

    // Prepare form data for AI service
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    if (plantType) formData.append('plantType', plantType);

    // Call AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    
    try {
      const aiResponse = await axios.post(
        `${aiServiceUrl}/predict`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000
        }
      );

      const {
        disease,
        confidence,
        isHealthy,
        recommendations,
        identifiedPlant,
        plantCategory
      } = aiResponse.data;

      let parsedLocation;
      if (location) {
        try {
          parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
        } catch (error) {
          parsedLocation = undefined;
        }
      }

      // Save prediction to database
      const prediction = await Prediction.create({
        user: req.user.id,
        imageUrl: `/uploads/${req.file.filename}`,
        plantType: plantType || 'Unknown',
        identifiedPlant: identifiedPlant || plantType || 'Unknown',
        plantCategory: plantCategory || 'other',
        diseaseDetected: disease,
        confidence: confidence,
        isHealthy: isHealthy || false,
        recommendations: recommendations || [],
        location: parsedLocation,
        notes: notes
      });

      // Clean up temporary file (optional - you might want to keep it)
      // fs.unlinkSync(imagePath);

      res.status(201).json({
        success: true,
        prediction: {
          id: prediction._id,
          imageUrl: prediction.imageUrl,
          plantType: prediction.plantType,
          identifiedPlant: prediction.identifiedPlant,
          plantCategory: prediction.plantCategory,
          diseaseDetected: prediction.diseaseDetected,
          confidence: prediction.confidence,
          isHealthy: prediction.isHealthy,
          recommendations: prediction.recommendations,
          createdAt: prediction.createdAt
        }
      });
    } catch (aiError) {
      console.error('AI Service Error:', aiError.message);
      return res.status(503).json({ 
        message: 'AI service is currently unavailable. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Prediction Error:', error);
    res.status(500).json({ 
      message: error.message || 'Error creating prediction' 
    });
  }
};

// @desc    Get all predictions for logged in user
// @route   GET /api/predictions
// @access  Private
exports.getPredictions = async (req, res, next) => {
  try {
    const predictions = await Prediction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: predictions.length,
      predictions
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || 'Error fetching predictions' 
    });
  }
};

// @desc    Get single prediction
// @route   GET /api/predictions/:id
// @access  Private
exports.getPrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    // Check if prediction belongs to user
    if (prediction.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Not authorized to access this prediction' 
      });
    }

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || 'Error fetching prediction' 
    });
  }
};

// @desc    Delete prediction
// @route   DELETE /api/predictions/:id
// @access  Private
exports.deletePrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    // Check if prediction belongs to user
    if (prediction.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this prediction' 
      });
    }

    await prediction.deleteOne();

    res.json({
      success: true,
      message: 'Prediction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || 'Error deleting prediction' 
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/predictions/analytics/stats
// @access  Private
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get total predictions
    const totalPredictions = await Prediction.countDocuments({ user: userId });

    // Get disease distribution
    const diseaseStats = await Prediction.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$diseaseDetected', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get plant type distribution
    const plantStats = await Prediction.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$plantType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent predictions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPredictions = await Prediction.countDocuments({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get healthy vs diseased ratio
    const healthyCount = await Prediction.countDocuments({ 
      user: userId, 
      isHealthy: true 
    });
    const diseasedCount = totalPredictions - healthyCount;

    res.json({
      success: true,
      analytics: {
        totalPredictions,
        recentPredictions,
        healthyCount,
        diseasedCount,
        diseaseDistribution: diseaseStats,
        plantTypeDistribution: plantStats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || 'Error fetching analytics' 
    });
  }
};

