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
  const farmerEmail = 'farmer.demo@cropguard.local';
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

  let farmer = await User.findOne({ email: farmerEmail });
  if (!farmer) {
    farmer = await User.create({
      name: 'Farmer Demo',
      email: farmerEmail,
      password: 'Farmer@123',
      role: 'farmer',
      location: 'Village Farm'
    });
  }

  let scientist = await User.findOne({ email: scientistEmail });
  if (!scientist) {
    scientist = await User.create({
      name: 'Scientist Demo',
      email: scientistEmail,
      password: 'Scientist@123',
      role: 'expert',
      location: 'Research Lab'
    });
  }

  const postCount = await Post.countDocuments();
  if (postCount === 0) {
    await Post.insertMany([
      {
        user: farmer._id,
        plantType: 'Tomato',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80',
        content: 'Leaves on my tomato are showing early yellow spots. I reduced overhead watering and started copper spray. Any extra suggestions?'
      },
      {
        user: scientist._id,
        plantType: 'Potato',
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80',
        content: 'Field observation: signs of late blight spread after 3 days of high humidity. Recommend immediate sanitation and fungicide rotation.'
      },
      {
        user: farmer._id,
        plantType: 'Apple',
        imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=1200&q=80',
        content: 'Apple tree fruits look healthy this week after pruning and balanced feeding. Sharing photo for comparison with previous disease stage.'
      }
    ]);
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

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

module.exports = { app, server };

