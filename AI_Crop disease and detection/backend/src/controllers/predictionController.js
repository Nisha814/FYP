const Prediction = require('../models/Prediction');
const mongoose = require('mongoose');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Mock disease database for when AI service isn't available
const getMockRecommendations = (diseaseName) => {
  const diseaseDb = {
    'Early Blight': [
      { treatmentType: 'fertilizer', name: 'Potassium-rich fertilizer', description: 'Helps strengthen plant resistance', application: 'Apply every 2 weeks', dosage: '2-3 kg per 100 sq meters' },
      { treatmentType: 'pesticide', name: 'Copper-based fungicide', description: 'Effective against fungal diseases', application: 'Spray every 7-10 days', dosage: '2-3 ml per liter of water' },
      { treatmentType: 'organic', name: 'Neem oil solution', description: 'Natural antifungal treatment', application: 'Spray weekly', dosage: '5-10 ml per liter of water' }
    ],
    'Late Blight': [
      { treatmentType: 'fertilizer', name: 'Balanced NPK fertilizer', description: 'Provides essential nutrients', application: 'Apply monthly', dosage: '1-2 kg per 100 sq meters' },
      { treatmentType: 'pesticide', name: 'Mancozeb fungicide', description: 'Broad-spectrum fungicide', application: 'Spray every 5-7 days', dosage: '2-3 g per liter of water' },
      { treatmentType: 'organic', name: 'Baking soda solution', description: 'Natural fungicide', application: 'Spray every 3-5 days', dosage: '1 tablespoon per liter of water' }
    ],
    'Bacterial Spot': [
      { treatmentType: 'fertilizer', name: 'Calcium-rich fertilizer', description: 'Helps strengthen cell walls', application: 'Apply every 3 weeks', dosage: '1-2 kg per 100 sq meters' },
      { treatmentType: 'pesticide', name: 'Copper sulfate', description: 'Effective against bacterial diseases', application: 'Spray every 10 days', dosage: '2 g per liter of water' },
      { treatmentType: 'organic', name: 'Garlic spray', description: 'Natural antibacterial treatment', application: 'Spray weekly', dosage: '10 garlic cloves blended per liter of water' }
    ],
    'Powdery Mildew': [
      { treatmentType: 'fertilizer', name: 'Potassium bicarbonate', description: 'Helps control powdery mildew', application: 'Apply every 2 weeks', dosage: '1 tbsp per gallon of water' },
      { treatmentType: 'organic', name: 'Milk spray', description: 'Natural treatment for powdery mildew', application: 'Spray weekly', dosage: '1 part milk to 9 parts water' }
    ],
    'Rust': [
      { treatmentType: 'fertilizer', name: 'Balanced NPK fertilizer', description: 'Boosts plant immunity', application: 'Apply monthly', dosage: '1-2 kg per 100 sq meters' },
      { treatmentType: 'pesticide', name: 'Sulfur-based fungicide', description: 'Effective against rust diseases', application: 'Spray every 7-10 days', dosage: 'Follow product instructions' }
    ],
    'Anthracnose': [
      { treatmentType: 'pesticide', name: 'Chlorothalonil', description: 'Broad-spectrum fungicide', application: 'Spray every 7-14 days', dosage: 'Follow product instructions' },
      { treatmentType: 'organic', name: 'Compost tea', description: 'Boosts plant health naturally', application: 'Apply as soil drench weekly', dosage: '5 liters per plant' }
    ],
    'Healthy': [
      { treatmentType: 'fertilizer', name: 'General purpose fertilizer', description: 'Maintain plant health', application: 'Apply monthly', dosage: '1 kg per 100 sq meters' }
    ]
  };
  
  return diseaseDb[diseaseName] || [
    { treatmentType: 'fertilizer', name: 'Balanced NPK fertilizer', description: 'General purpose fertilizer', application: 'Apply as per package instructions', dosage: 'Follow manufacturer guidelines' },
    { treatmentType: 'organic', name: 'Organic compost', description: 'Improve soil health naturally', application: 'Apply monthly', dosage: '5-10 kg per 100 sq meters' }
  ];
};

const getMockPrediction = (plantType) => {
  const mockPredictions = [
    { plant: 'Tomato', disease: 'Early Blight', isHealthy: false, confidence: 75 },
    { plant: 'Tomato', disease: 'Late Blight', isHealthy: false, confidence: 80 },
    { plant: 'Tomato', disease: 'Healthy', isHealthy: true, confidence: 90 },
    { plant: 'Potato', disease: 'Early Blight', isHealthy: false, confidence: 78 },
    { plant: 'Potato', disease: 'Late Blight', isHealthy: false, confidence: 85 },
    { plant: 'Potato', disease: 'Healthy', isHealthy: true, confidence: 88 },
    { plant: 'Apple', disease: 'Healthy', isHealthy: true, confidence: 91 },
    { plant: 'Apple', disease: 'Rust', isHealthy: false, confidence: 75 },
    { plant: 'Mango', disease: 'Healthy', isHealthy: true, confidence: 92 },
    { plant: 'Mango', disease: 'Anthracnose', isHealthy: false, confidence: 76 }
  ];
  
  const selected = mockPredictions[Math.floor(Math.random() * mockPredictions.length)];
  const plantCategory = ['Tomato', 'Potato', 'Pepper', 'Cucumber'].includes(selected.plant) ? 'vegetable' : 
                        ['Apple', 'Mango', 'Orange', 'Banana'].includes(selected.plant) ? 'fruit' : 'other';
  
  return {
    disease: selected.disease,
    confidence: selected.confidence,
    isHealthy: selected.isHealthy,
    identifiedPlant: plantType || selected.plant,
    plantCategory: plantCategory,
    recommendations: getMockRecommendations(selected.disease)
  };
};

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

    let aiData;
    
    // Try AI service first
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
    
    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));
      if (plantType) formData.append('plantType', plantType);

      const aiResponse = await axios.post(
        `${aiServiceUrl}/predict`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 5000
        }
      );

      aiData = aiResponse.data;
    } catch (aiError) {
      console.log('AI service not available, using mock prediction');
      aiData = getMockPrediction(plantType);
    }

    const {
      disease,
      confidence,
      isHealthy,
      recommendations,
      identifiedPlant,
      plantCategory
    } = aiData;

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
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$diseaseDetected', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get plant type distribution
    const plantStats = await Prediction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
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
        totalPredictions: totalPredictions || 0,
        recentPredictions: recentPredictions || 0,
        healthyCount: healthyCount || 0,
        diseasedCount: diseasedCount || 0,
        diseaseDistribution: diseaseStats || [],
        plantTypeDistribution: plantStats || []
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || 'Error fetching analytics' 
    });
  }
};
