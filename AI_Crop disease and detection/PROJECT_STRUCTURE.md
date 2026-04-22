# Project Structure

```
AI_Crop disease and detection/
│
├── backend/                          # Node.js/Express Main Server
│   ├── src/
│   │   ├── controllers/             # Request handlers
│   │   │   ├── authController.js
│   │   │   └── predictionController.js
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.js
│   │   │   └── Prediction.js
│   │   ├── routes/                  # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── predictionRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── middleware/              # Custom middleware
│   │   │   └── auth.js
│   │   └── config/                  # Configuration files
│   │       └── database.js
│   ├── uploads/                     # Uploaded images storage
│   ├── server.js                    # Main server file
│   ├── package.json
│   └── .env.example
│
├── ai-service/                      # Flask AI Microservice
│   ├── app.py                       # Flask application
│   ├── models/                      # Trained ML models
│   │   └── crop_disease_model.h5
│   ├── uploads/                     # Temporary image storage
│   ├── requirements.txt
│   └── .env.example
│
├── ml-model/                        # ML Model Training
│   ├── train_model.py               # CNN training script
│   ├── preprocess_data.py           # Data preprocessing
│   ├── requirements.txt
│   └── data/                        # Training dataset
│       ├── train/
│       ├── validation/
│       └── test/
│
├── frontend/                        # React.js Frontend
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Predict.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/                 # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/                # API services
│   │   │   └── api.js
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── public/                      # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── README.md                        # Main documentation
├── SETUP.md                         # Setup guide
├── PROJECT_STRUCTURE.md             # This file
└── .gitignore                       # Git ignore rules
```

## Key Components

### Backend (Node.js/Express)
- **Authentication**: JWT-based user authentication
- **API Routes**: RESTful API endpoints
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer for image handling
- **AI Integration**: Communicates with Flask service

### AI Service (Flask)
- **Model Loading**: Loads trained CNN model
- **Image Processing**: Preprocesses images for prediction
- **Disease Detection**: Returns disease classification
- **Recommendations**: Provides treatment suggestions

### Frontend (React)
- **Authentication**: Login/Register pages
- **Dashboard**: Overview of predictions and stats
- **Predict**: Image upload and disease detection
- **History**: View all past predictions
- **Analytics**: Visual charts and statistics
- **Profile**: User profile management

### ML Model
- **CNN Architecture**: Convolutional Neural Network
- **Training Script**: Automated model training
- **Data Preprocessing**: Image augmentation and normalization

## Data Flow

1. **User uploads image** → Frontend
2. **Frontend sends to Backend** → POST /api/predictions
3. **Backend forwards to AI Service** → POST /predict
4. **AI Service processes image** → CNN Model Prediction
5. **AI Service returns results** → Disease + Recommendations
6. **Backend saves to MongoDB** → Prediction record
7. **Backend returns to Frontend** → Display results

## Technology Stack Summary

- **Frontend**: React 18, Vite, TailwindCSS, Recharts
- **Backend**: Node.js, Express.js, MongoDB, JWT
- **AI Service**: Flask, TensorFlow/Keras, OpenCV
- **ML**: Python, TensorFlow, NumPy, Pandas

