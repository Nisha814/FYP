# Quick Start Guide

Get your AI-Powered Crop Disease Detection System up and running in minutes!

## 🚀 Quick Setup (3 Steps)

### Step 1: Start Backend Server
```bash
cd backend
npm install
# Create .env file (copy from .env.example)
npm start
```
✅ Backend running on http://localhost:5000

### Step 2: Start AI Service
```bash
cd ai-service
pip install -r requirements.txt
# Create .env file (copy from .env.example)
python app.py
```
✅ AI Service running on http://localhost:5001

### Step 3: Start Frontend
```bash
cd frontend
npm install
# Create .env file (copy from .env.example)
npm run dev
```
✅ Frontend running on http://localhost:3000

## 🎯 First Steps

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Register**: Create a new account
3. **Login**: Sign in with your credentials
4. **Predict**: Upload a crop leaf image
5. **View Results**: See disease detection and recommendations

## 📋 What's Included

### Pages Created:
- ✅ **Home** - Landing page with features and information
- ✅ **Login** - User authentication
- ✅ **Register** - New user registration
- ✅ **Dashboard** - Overview with stats and quick actions
- ✅ **Predict** - Image upload and disease detection
- ✅ **History** - View all past predictions
- ✅ **Analytics** - Visual charts and statistics
- ✅ **Profile** - User profile management

### Features:
- 🔐 JWT Authentication
- 📸 Image Upload & Processing
- 🤖 AI Disease Detection
- 💊 Treatment Recommendations
- 📊 Analytics Dashboard
- 📝 Prediction History
- 👤 User Profile Management

## 🔧 Configuration

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crop_disease
JWT_SECRET=your_secret_key
AI_SERVICE_URL=http://localhost:5001
```

### AI Service (.env)
```
FLASK_PORT=5001
MODEL_PATH=./models/crop_disease_model.h5
UPLOAD_FOLDER=./uploads
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📚 Need More Help?

- **Detailed Setup**: See [SETUP.md](./SETUP.md)
- **Project Structure**: See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **Main Documentation**: See [README.md](./README.md)

## ⚠️ Important Notes

1. **MongoDB Required**: Make sure MongoDB is running before starting the backend
2. **Three Terminals**: You need 3 separate terminal windows for all services
3. **Model Training**: The AI service works with mock predictions if no model is found
4. **Ports**: Ensure ports 3000, 5000, and 5001 are available

## 🎉 You're All Set!

Start all three services and begin detecting crop diseases with AI!

