# Setup Guide - AI-Powered Crop Disease Detection System

This guide will help you set up and run the complete system on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (3.10 or higher) - [Download](https://www.python.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

## Step-by-Step Setup

### 1. Clone and Navigate to Project

```bash
cd "AI_Crop disease and detection"
```

### 2. Backend Setup (Node.js/Express)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Windows PowerShell:
Copy-Item .env.example .env

# Edit .env file with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/crop_disease
# JWT_SECRET=your_super_secret_jwt_key
# PORT=5000
# AI_SERVICE_URL=http://localhost:5001

# Start MongoDB (if not running as a service)
# Windows: mongod
# Or use MongoDB Compass

# Start the backend server
npm start
# Or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. AI Service Setup (Flask)

Open a **new terminal window**:

```bash
# Navigate to ai-service directory
cd ai-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy .env.example to .env and configure:
# FLASK_PORT=5001
# MODEL_PATH=./models/crop_disease_model.h5
# UPLOAD_FOLDER=./uploads

# Create necessary directories
mkdir uploads
mkdir models

# Start Flask service
python app.py
```

The AI service will run on `http://localhost:5001`

**Note:** The AI service will work with mock predictions if no model is found. To use a real model:
1. Train the model using `ml-model/train_model.py`
2. Place the trained model at `ai-service/models/crop_disease_model.h5`

### 4. Frontend Setup (React)

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
# Copy .env.example to .env
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 5. (Optional) Train ML Model

If you have a dataset ready:

```bash
# Navigate to ml-model directory
cd ml-model

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Organize your dataset in the following structure:
# data/
# ├── train/
# │   ├── Healthy/
# │   ├── Early_Blight/
# │   └── ...
# ├── validation/
# └── test/

# Run preprocessing (if needed)
python preprocess_data.py

# Train the model
python train_model.py
```

## Running the Complete System

You need **3 terminal windows** running simultaneously:

1. **Terminal 1**: Backend (Node.js) - `http://localhost:5000`
2. **Terminal 2**: AI Service (Flask) - `http://localhost:5001`
3. **Terminal 3**: Frontend (React) - `http://localhost:3000`

## Testing the System

1. Open your browser and go to `http://localhost:3000`
2. Register a new account
3. Login with your credentials
4. Navigate to "Predict" page
5. Upload a crop leaf image
6. View results and recommendations
7. Check "History" and "Analytics" pages

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Predictions
- `POST /api/predictions` - Create new prediction (protected)
- `GET /api/predictions` - Get all predictions (protected)
- `GET /api/predictions/:id` - Get single prediction (protected)
- `DELETE /api/predictions/:id` - Delete prediction (protected)
- `GET /api/predictions/analytics/stats` - Get analytics (protected)

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MongoDB connection string in `.env`
- Try: `mongodb://127.0.0.1:27017/crop_disease`

### Port Already in Use
- Change port in respective `.env` files
- Or stop the service using that port

### AI Service Not Responding
- Check if Flask service is running on port 5001
- Verify `AI_SERVICE_URL` in backend `.env`
- Check Flask service logs for errors

### Frontend Not Loading
- Ensure backend is running
- Check `VITE_API_URL` in frontend `.env`
- Clear browser cache

### Model Not Found
- The AI service will use mock predictions if model is not found
- Train a model or download a pre-trained model
- Place it at `ai-service/models/crop_disease_model.h5`

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd frontend && npm run build`
3. Use process managers (PM2 for Node.js, Gunicorn for Flask)
4. Configure reverse proxy (Nginx)
5. Use environment variables for all secrets
6. Enable HTTPS
7. Use cloud storage for images (AWS S3, Cloudinary)

## Support

For issues or questions, refer to the main README.md file.

