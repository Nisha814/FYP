const Prediction = require('../models/Prediction');

const buildAdvice = (message, plantType) => {
  const text = (message || '').toLowerCase();
  if (text.includes('yellow') || text.includes('leaf')) {
    return 'Yellowing leaves may indicate nutrient deficiency, overwatering, or early disease. Check drainage, reduce overwatering, and apply a balanced fertilizer.';
  }
  if (text.includes('spot') || text.includes('blight') || text.includes('fung')) {
    return 'Spots/blight are often fungal or bacterial. Remove infected leaves, avoid overhead watering, and apply an appropriate fungicide.';
  }
  if (text.includes('fruit') || text.includes('flower')) {
    return 'Poor fruiting can come from low potassium, heat stress, or weak pollination. Improve nutrition and watering consistency.';
  }
  return `For ${plantType || 'this plant'}, monitor leaf color, stem strength, and moisture daily. Upload a clear leaf image in Predict for disease confirmation.`;
};

exports.askAssistant = async (req, res) => {
  try {
    const { message, plantType } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const recentPredictions = await Prediction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('plantType diseaseDetected confidence isHealthy createdAt');

    const reply = buildAdvice(message, plantType);

    res.json({
      success: true,
      reply,
      context: {
        recentPredictions
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error generating assistant response' });
  }
};
