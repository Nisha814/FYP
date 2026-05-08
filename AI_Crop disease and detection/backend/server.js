const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const { initSocket } = require('./src/socket');

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn(
    '⚠️  JWT_SECRET is not set — login/register will fail. Create backend/.env (see backend/.env.example).'
  );
}

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const predictionRoutes = require('./src/routes/predictionRoutes');
const userRoutes = require('./src/routes/userRoutes');
const postRoutes = require('./src/routes/postRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const noticeRoutes = require('./src/routes/noticeRoutes');
const User = require('./src/models/User');
const Post = require('./src/models/Post');

const DEFAULT_FRONTEND_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501'
]

const buildAllowedOrigins = () => {
  const fromEnv = process.env.FRONTEND_URL?.trim()
  if (fromEnv)
    return fromEnv.split(',').map((o) => o.trim()).filter(Boolean)
  return DEFAULT_FRONTEND_ORIGINS
}

const app = express();
const server = http.createServer(app);
const corsOrigins = buildAllowedOrigins();

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (corsOrigins.includes(origin)) return callback(null, true)
      console.warn('[CORS] blocked request from origin:', origin)
      callback(null, false)
    },
    credentials: true
  })
)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let memoryMongoServer;

const connectDatabase = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crop_disease';
  try {
    await mongoose.connect(primaryUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️ Falling back to in-memory MongoDB for development.');
    memoryMongoServer = await MongoMemoryServer.create();
    const memoryUri = memoryMongoServer.getUri();
    await mongoose.connect(memoryUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ In-memory MongoDB connected successfully');
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notices', noticeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Crop Disease Detection API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

initSocket(server, corsOrigins);

const seedInitialData = async () => {
  const adminEmail = 'admin@cropguard.local';
  const farmerEmail1 = 'farmer.john@cropguard.local';
  const farmerEmail2 = 'farmer.maria@cropguard.local';
  const scientistEmail = 'scientist.demo@cropguard.local';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
      location: 'HQ'
    });
  }

  let farmerJohn = await User.findOne({ email: farmerEmail1 });
  if (!farmerJohn) {
    farmerJohn = await User.create({
      name: 'John Farmer',
      email: farmerEmail1,
      password: 'Farmer@123',
      role: 'farmer',
      location: 'Sunnyville Farm'
    });
  }

  let farmerMaria = await User.findOne({ email: farmerEmail2 });
  if (!farmerMaria) {
    farmerMaria = await User.create({
      name: 'Maria Grower',
      email: farmerEmail2,
      password: 'Farmer@123',
      role: 'farmer',
      location: 'Green Valley Orchard'
    });
  }

  let scientist = await User.findOne({ email: scientistEmail });
  if (!scientist) {
    scientist = await User.create({
      name: 'Dr. Plant Expert',
      email: scientistEmail,
      password: 'Scientist@123',
      role: 'expert',
      location: 'Agricultural Research Center'
    });
  }

  const postCount = await Post.countDocuments();
  if (postCount === 0) {
    const posts = [
      {
        user: farmerJohn._id,
        plantType: 'Tomato',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80',
        content: 'Guys, help! My tomato leaves are turning yellow with dark spots. What could be wrong? I water them every evening.',
        likes: [farmerMaria._id],
        comments: [
          {
            user: scientist._id,
            text: 'This looks like early blight. Avoid overhead watering and apply a copper-based fungicide.'
          },
          {
            user: farmerMaria._id,
            text: 'I had the same issue last season! Try using neem oil, it worked for me.'
          }
        ]
      },
      {
        user: farmerMaria._id,
        plantType: 'Apple',
        imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=1200&q=80',
        content: 'Beautiful harvest this year! My apple trees are thriving after I added organic compost last spring.',
        likes: [farmerJohn._id, scientist._id],
        comments: [
          {
            user: farmerJohn._id,
            text: 'Wow, that looks amazing! What compost did you use?'
          },
          {
            user: farmerMaria._id,
            text: 'Thanks John! I used a mix of cow manure and kitchen scraps, aged for 6 months.'
          }
        ]
      },
      {
        user: scientist._id,
        plantType: 'Potato',
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80',
        content: 'Important update: Late blight risk is high this week due to high humidity. Check your potato fields daily!',
        likes: [farmerJohn._id, farmerMaria._id],
        comments: [
          {
            user: farmerJohn._id,
            text: 'Thanks for the heads up! I will inspect my crops first thing tomorrow.'
          }
        ]
      },
      {
        user: farmerJohn._id,
        plantType: 'Cucumber',
        imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=1200&q=80',
        content: 'My cucumber plants have white powdery spots on leaves. Any advice?',
        likes: [],
        comments: [
          {
            user: scientist._id,
            text: 'That\'s powdery mildew. Improve air circulation and use a baking soda spray (1 tbsp per gallon of water).'
          },
          {
            user: farmerMaria._id,
            text: 'Also, make sure to water at the base, not the leaves! Good luck!'
          }
        ]
      }
    ];

    for (const postData of posts) {
      const post = await Post.create(postData);
    }
  }
};

const startServer = async () => {
  await connectDatabase();
  await seedInitialData();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

module.exports = { app, server };

