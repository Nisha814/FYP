const Prediction = require('../models/Prediction');
const ChatMessage = require('../models/ChatMessage');
const axios = require('axios');

const buildAdvice = (message, plantType) => {
  const text = (message || '').toLowerCase();
  const plant = (plantType || '').toLowerCase();
  
  const knowledgeBase = {
    // Vegetables
    tomato: {
      name: 'Tomato',
      info: 'Tomato (Solanum lycopersicum) is a popular vegetable rich in vitamins C and A.',
      diseases: {
        'early blight': 'Early blight is a fungal disease caused by Alternaria solani. Symptoms: circular brown spots with yellow halos on older leaves. Treatment: Remove infected leaves, use copper fungicide, improve air circulation.',
        'late blight': 'Late blight is caused by Phytophthora infestans. Symptoms: water-soaked spots on leaves, white mold on undersides. Treatment: Remove infected parts, use mancozeb, avoid overhead watering.'
      },
      care: 'Tomatoes need full sun (6+ hours), well-drained soil, and regular watering. Support with stakes or cages for better growth.'
    },
    potato: {
      name: 'Potato',
      info: 'Potato (Solanum tuberosum) is a starchy tuber vegetable, a staple food worldwide.',
      diseases: {
        'early blight': 'Potato early blight: dark spots with concentric rings on lower leaves. Treatment: Crop rotation, fungicide application, remove debris.',
        'late blight': 'Potato late blight: rapid browning of leaves, lesions on tubers. Treatment: Destroy infected plants, use resistant varieties, apply fungicides.'
      },
      care: 'Potatoes grow best in loose, fertile soil. Hill soil around stems as they grow to protect tubers from sunlight.'
    },
    pepper: {
      name: 'Pepper',
      info: 'Peppers (Capsicum spp.) are rich in vitamin C and capsaicin. Available in sweet and hot varieties.',
      diseases: {
        'bacterial spot': 'Bacterial spot causes dark, water-soaked spots on leaves and fruit. Treatment: Use disease-free seeds, copper sprays, crop rotation.'
      },
      care: 'Peppers need warm temperatures and full sun. Water consistently and avoid over-fertilizing with nitrogen.'
    },
    chili: {
      name: 'Chili',
      info: 'Chili peppers are hot peppers rich in capsaicin. Used in cooking for flavor and heat.',
      care: 'Similar to peppers: warm temperatures, full sun, consistent watering.'
    },
    cucumber: {
      name: 'Cucumber',
      info: 'Cucumber (Cucumis sativus) is a refreshing vegetable, mostly water content.',
      diseases: {
        'powdery mildew': 'Powdery mildew appears as white powdery spots on leaves. Treatment: Improve air circulation, use milk spray or potassium bicarbonate.'
      },
      care: 'Cucumbers need plenty of water and full sun. Grow on trellises to save space and keep fruit clean.'
    },
    brinjal: {
      name: 'Brinjal (Eggplant)',
      info: 'Brinjal (Solanum melongena) is a versatile vegetable used in many cuisines.',
      care: 'Needs full sun, well-drained soil, and regular watering.'
    },
    eggplant: {
      name: 'Eggplant',
      info: 'Eggplant (Solanum melongena) is a versatile vegetable used in many cuisines.',
      care: 'Needs full sun, well-drained soil, and regular watering.'
    },
    carrot: {
      name: 'Carrot',
      info: 'Carrot (Daucus carota) is a root vegetable rich in beta-carotene and vitamin A.',
      care: 'Grows best in loose, sandy soil. Needs full sun and consistent moisture.'
    },
    onion: {
      name: 'Onion',
      info: 'Onion (Allium cepa) is a bulb vegetable used worldwide for flavor.',
      care: 'Needs full sun, well-drained soil, and moderate watering.'
    },
    garlic: {
      name: 'Garlic',
      info: 'Garlic (Allium sativum) is a pungent bulb with many health benefits.',
      care: 'Plant in fall, needs full sun and well-drained soil.'
    },
    cabbage: {
      name: 'Cabbage',
      info: 'Cabbage (Brassica oleracea) is a leafy green vegetable.',
      care: 'Needs full sun, fertile soil, and regular watering.'
    },
    cauliflower: {
      name: 'Cauliflower',
      info: 'Cauliflower (Brassica oleracea var. botrytis) is a vegetable with white curd.',
      care: 'Needs full sun, fertile soil, and consistent moisture.'
    },
    broccoli: {
      name: 'Broccoli',
      info: 'Broccoli (Brassica oleracea var. italica) is a green vegetable with edible flower heads.',
      care: 'Needs full sun, fertile soil, and regular watering.'
    },
    spinach: {
      name: 'Spinach',
      info: 'Spinach (Spinacia oleracea) is a leafy green vegetable rich in iron and vitamins.',
      care: 'Grows best in cool weather, partial shade in hot climates.'
    },
    lettuce: {
      name: 'Lettuce',
      info: 'Lettuce (Lactuca sativa) is a leafy vegetable used in salads.',
      care: 'Cool-season crop, needs consistent moisture and partial shade in hot weather.'
    },
    peas: {
      name: 'Peas',
      info: 'Peas (Pisum sativum) are cool-season legumes rich in protein.',
      care: 'Grow in cool weather, provide support for climbing varieties.'
    },
    beans: {
      name: 'Beans',
      info: 'Beans are legumes, excellent source of protein and fiber.',
      care: 'Warm-season crop, needs full sun and well-drained soil.'
    },
    corn: {
      name: 'Corn',
      info: 'Corn (Zea mays) is a cereal grain, staple food in many cultures.',
      care: 'Warm-season crop, needs full sun and regular watering.'
    },
    zucchini: {
      name: 'Zucchini',
      info: 'Zucchini is a summer squash, popular in many dishes.',
      care: 'Warm-season crop, needs full sun and plenty of water.'
    },
    pumpkin: {
      name: 'Pumpkin',
      info: 'Pumpkin is a winter squash, known for its edible fruit and seeds.',
      care: 'Warm-season crop, needs full sun and space to grow.'
    },

    // Fruits
    apple: {
      name: 'Apple',
      info: 'Apple (Malus domestica) is a popular fruit, high in fiber and antioxidants.',
      diseases: {
        'rust': 'Apple rust appears as orange spots on leaves. Treatment: Remove infected leaves, use fungicides if needed.'
      },
      care: 'Apple trees need full sun, well-drained soil, and annual pruning for good fruit production.'
    },
    orange: {
      name: 'Orange',
      info: 'Orange (Citrus × sinensis) is a citrus fruit rich in vitamin C.',
      care: 'Tropical/subtropical tree, needs full sun and well-drained soil.'
    },
    banana: {
      name: 'Banana',
      info: 'Banana (Musa) is a tropical fruit, rich in potassium.',
      diseases: {
        'anthracnose': 'Anthracnose causes dark spots on banana fruit. Treatment: Remove infected parts, use copper fungicides.'
      },
      care: 'Tropical plant, needs full sun and plenty of water.'
    },
    grape: {
      name: 'Grape',
      info: 'Grapes are berries, eaten fresh or used to make wine and juice.',
      care: 'Vine plant, needs full sun, well-drained soil, and support.'
    },
    mango: {
      name: 'Mango',
      info: 'Mango (Mangifera indica) is a tropical stone fruit, known for its sweet flavor.',
      diseases: {
        'anthracnose': 'Anthracnose causes dark spots on mango fruit and leaves. Treatment: Remove infected parts, use copper fungicides.'
      },
      care: 'Tropical tree, thrives in warm climates with full sun. Young trees need regular watering and protection from frost.'
    },
    strawberry: {
      name: 'Strawberry',
      info: 'Strawberries are sweet, red fruits rich in vitamin C.',
      care: 'Needs full sun, well-drained soil, and regular watering.'
    },
    pineapple: {
      name: 'Pineapple',
      info: 'Pineapple (Ananas comosus) is a tropical fruit with a sweet-tart taste.',
      care: 'Tropical plant, needs full sun and well-drained soil.'
    },
    watermelon: {
      name: 'Watermelon',
      info: 'Watermelon (Citrullus lanatus) is a large, sweet fruit with high water content.',
      care: 'Warm-season crop, needs full sun, plenty of water, and space to grow.'
    },
    papaya: {
      name: 'Papaya',
      info: 'Papaya (Carica papaya) is a tropical fruit rich in vitamins and enzymes.',
      care: 'Tropical tree, needs full sun and well-drained soil.'
    },
    guava: {
      name: 'Guava',
      info: 'Guava (Psidium guajava) is a tropical fruit with a unique flavor.',
      care: 'Tropical tree, needs full sun and well-drained soil.'
    },
    pomegranate: {
      name: 'Pomegranate',
      info: 'Pomegranate (Punica granatum) is a fruit with many seeds rich in antioxidants.',
      care: 'Needs full sun and well-drained soil.'
    },
    lemon: {
      name: 'Lemon',
      info: 'Lemon (Citrus limon) is a citrus fruit known for its sour taste.',
      care: 'Subtropical tree, needs full sun and well-drained soil.'
    },
    lime: {
      name: 'Lime',
      info: 'Lime is a citrus fruit, similar to lemon but smaller and more acidic.',
      care: 'Subtropical tree, needs full sun and well-drained soil.'
    },
    cherry: {
      name: 'Cherry',
      info: 'Cherry is a small, round stone fruit, sweet or tart.',
      care: 'Temperate tree, needs full sun and well-drained soil.'
    },
    peach: {
      name: 'Peach',
      info: 'Peach (Prunus persica) is a sweet, juicy stone fruit.',
      care: 'Temperate tree, needs full sun and well-drained soil.'
    },
    pear: {
      name: 'Pear',
      info: 'Pear (Pyrus) is a sweet, bell-shaped fruit.',
      care: 'Temperate tree, needs full sun and well-drained soil.'
    },
    plum: {
      name: 'Plum',
      info: 'Plum is a sweet or tart stone fruit.',
      care: 'Temperate tree, needs full sun and well-drained soil.'
    },
    avocado: {
      name: 'Avocado',
      info: 'Avocado (Persea americana) is a creamy fruit rich in healthy fats.',
      care: 'Subtropical/tropical tree, needs full sun and well-drained soil.'
    },
    kiwi: {
      name: 'Kiwi',
      info: 'Kiwi (Actinidia deliciosa) is a small, fuzzy fruit with green flesh.',
      care: 'Vine plant, needs full sun and well-drained soil.'
    },

    // Trees
    'mango tree': {
      name: 'Mango Tree',
      info: 'Mango tree (Mangifera indica) is a tropical tree that produces delicious mango fruits.',
      care: 'Tropical tree, thrives in warm climates with full sun. Young trees need regular watering and protection from frost.'
    },
    'apple tree': {
      name: 'Apple Tree',
      info: 'Apple tree (Malus domestica) produces apples and is widely cultivated.',
      care: 'Temperate tree, needs full sun, well-drained soil, and annual pruning.'
    },
    'orange tree': {
      name: 'Orange Tree',
      info: 'Orange tree (Citrus × sinensis) produces sweet oranges.',
      care: 'Tropical/subtropical tree, needs full sun and well-drained soil.'
    },
    'banana tree': {
      name: 'Banana Tree',
      info: 'Banana tree (Musa) is a large herbaceous plant that produces bananas.',
      care: 'Tropical plant, needs full sun and plenty of water.'
    },
    'guava tree': {
      name: 'Guava Tree',
      info: 'Guava tree (Psidium guajava) produces guava fruits.',
      care: 'Tropical tree, needs full sun and well-drained soil.'
    },
    'pomegranate tree': {
      name: 'Pomegranate Tree',
      info: 'Pomegranate tree (Punica granatum) produces pomegranate fruits.',
      care: 'Needs full sun and well-drained soil.'
    },
    'lemon tree': {
      name: 'Lemon Tree',
      info: 'Lemon tree (Citrus limon) produces lemons.',
      care: 'Subtropical tree, needs full sun and well-drained soil.'
    },
    'peach tree': {
      name: 'Peach Tree',
      info: 'Peach tree (Prunus persica) produces peaches.',
      care: 'Temperate tree, needs full sun and well-drained soil.'
    },
    'pear tree': {
      name: 'Pear Tree',
      info: 'Pear tree (Pyrus) produces pears.',
      care: 'Temperate tree, needs full sun and well-drained soil.'
    },
    'coconut tree': {
      name: 'Coconut Tree',
      info: 'Coconut tree (Cocos nucifera) is a tropical palm tree that produces coconuts.',
      care: 'Tropical palm, needs full sun and sandy, well-drained soil.'
    },
    'neem tree': {
      name: 'Neem Tree',
      info: 'Neem tree (Azadirachta indica) is a tropical tree with many medicinal properties.',
      care: 'Tropical tree, drought-resistant, needs full sun.'
    },
    'banyan tree': {
      name: 'Banyan Tree',
      info: 'Banyan tree (Ficus benghalensis) is a large, iconic tree with aerial roots.',
      care: 'Tropical tree, needs full sun and space to grow.'
    },
    'peepal tree': {
      name: 'Peepal Tree',
      info: 'Peepal tree (Ficus religiosa) is a sacred tree in many cultures.',
      care: 'Tropical tree, needs full sun and well-drained soil.'
    },

    general: {
      yellow: 'Yellowing leaves can be caused by nutrient deficiency (nitrogen, iron), overwatering, underwatering, or disease. Check soil moisture and consider testing soil nutrients.',
      spots: 'Leaf spots are often fungal or bacterial. Remove infected plant parts, improve air circulation, and use appropriate organic or synthetic treatments.',
      wilt: 'Wilting can result from overwatering, underwatering, root rot, or pest damage. Check root health and adjust watering.',
      pests: 'Common pests include aphids, caterpillars, and mites. Use natural predators, neem oil, or appropriate insecticides.',
      fertilizer: 'Use balanced fertilizers for general growth. Add compost to improve soil health and nutrient availability.',
      water: 'Most plants need 1-2 inches of water per week. Water at the base, not on leaves, to prevent fungal diseases.'
    }
  };

  let response = '';
  
  for (const [plantKey, plantData] of Object.entries(knowledgeBase)) {
    if (plantKey === 'general') continue;
    if (text.includes(plantKey) || plant.includes(plantKey)) {
      response += `${plantData.name} Information:\n${plantData.info}\n\n`;
      if (plantData.care) {
        response += `Care Tips: ${plantData.care}\n\n`;
      }
      if (plantData.diseases) {
        for (const [disease, info] of Object.entries(plantData.diseases)) {
          if (text.includes(disease)) {
            response += `${disease}:\n${info}\n\n`;
          }
        }
      }
    }
  }

  for (const [keyword, info] of Object.entries(knowledgeBase.general)) {
    if (text.includes(keyword)) {
      response += `About ${keyword}:\n${info}\n\n`;
    }
  }

  if (response) {
    response += 'For accurate disease diagnosis, please upload a clear image of the affected plant in the Predict section.';
    return response.trim();
  }

  return `Hello! I'm your plant health assistant. Ask me about:\n• Specific plants (tomato, potato, pepper, mango, apple, etc.)\n• Fruits (banana, orange, strawberry, etc.)\n• Trees (mango tree, coconut tree, etc.)\n• Diseases (early blight, late blight, powdery mildew, etc.)\n• Care tips (watering, fertilizer, sunlight)\n• Problems (yellow leaves, spots, wilting)\n\nOr upload an image in Predict for disease identification!`;
};

const getAIResponse = async (messages, plantType, recentPredictions) => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return null;
  }

  try {
    const systemPrompt = `You are a helpful plant health assistant. Your role is to provide guidance on crop diseases, plant care, and agricultural best practices. Keep responses concise and practical.`;
    
    const recentPredictionText = recentPredictions.length > 0 
      ? `Recent predictions for this user: ${recentPredictions.map(p => `${p.plantType || 'Unknown plant'} - ${p.diseaseDetected || 'No disease detected'} (confidence: ${p.confidence}%)`).join(', ')}`
      : '';

    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: `${recentPredictionText ? recentPredictionText + '\n\n' : ''}${plantType ? `Plant type: ${plantType}\n\n` : ''}User question: ${messages[messages.length - 1].content}` }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      }
    });

    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content.trim();
    }
    return null;
  } catch (error) {
    console.error('AI service error:', error.response?.data || error.message);
    return null;
  }
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

    const recentMessages = await ChatMessage.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('role content');
    const conversationHistory = [...recentMessages].reverse();

    let reply;
    const aiReply = await getAIResponse([...conversationHistory, { role: 'user', content: message }], plantType, recentPredictions);
    
    if (aiReply) {
      reply = aiReply;
    } else {
      reply = buildAdvice(message, plantType);
    }

    const userMessage = await ChatMessage.create({
      user: req.user.id,
      role: 'user',
      content: message,
      plantType
    });

    const assistantMessage = await ChatMessage.create({
      user: req.user.id,
      role: 'assistant',
      content: reply,
      plantType,
      context: { recentPredictions }
    });

    res.json({
      success: true,
      reply,
      context: {
        recentPredictions
      },
      userMessage,
      assistantMessage
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message || 'Error generating assistant response' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user.id })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching chat history' });
  }
};

exports.clearChatHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user.id });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error clearing chat history' });
  }
};
