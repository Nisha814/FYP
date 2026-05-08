# AI-Powered Crop Disease Detection and Recommendation System

An intelligent system that uses Convolutional Neural Networks (CNN) to detect crop diseases from leaf images and provide treatment recommendations.

## 🎯 Project Overview

This system helps farmers:
- **Detect diseases** within seconds using AI-powered image analysis
- **Get treatment recommendations** (fertilizers, pesticides, organic solutions)
- **Track prediction history** with visual analytics
- **Take early action** to reduce crop losses

## 🛠 Technology Stack

### AI & Machine Learning
- Python 3.10+
- TensorFlow / Keras
- OpenCV
- NumPy, Pandas
- Matplotlib / Seaborn

### Backend
- Node.js + Express.js (main server)
- Flask (AI microservice for model prediction)
- JWT Authentication
- MongoDB + Mongoose

### Frontend
- React.js
- TailwindCSS
- PWA (Progressive Web App)
- Recharts (visual analytics)

### Development & Deployment
- VS Code
- Git + GitHub
- Google Colab / Kaggle (GPU training)
- Cloud Server (AWS/Azure/Render)

## 📁 Project Structure

```
AI_Crop disease and detection/
├── backend/                 # Node.js/Express main server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── config/
│   ├── package.json
│   └── server.js
├── ai-service/              # Flask microservice for AI predictions
│   ├── app.py
│   ├── models/
│   ├── utils/
│   └── requirements.txt
├── ml-model/                # CNN model training and scripts
│   ├── train_model.py
│   ├── preprocess_data.py
│   └── requirements.txt
├── frontend/                # React.js application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── public/
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ - [Download](https://nodejs.org/)
- **Python** 3.10+ - [Download](https://www.python.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn**
- **Git**

### Quick Setup (Recommended)

Run the included startup script from the root directory:
```powershell
.\Start-Project.ps1
```
This will open two new terminal windows starting both the backend and frontend.

### Manual Setup

1. **Backend Setup** (Terminal 1)
```bash
cd backend
npm install
npm start
```
*Note: If local MongoDB is not running, it will automatically use an in-memory database for testing (data will be lost on restart).*

2. **Frontend Setup** (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

### ⚠️ Important Usage Notes
- **Do NOT use VS Code "Go Live" (Live Server)**: This project requires the Vite development server to handle API proxying.
- **Access URL**: Always use **http://localhost:3000** to access the application.
- **Login Issues**: If login fails, ensure the backend is running on port 5000. Check the terminal logs for errors.
- **Test Credentials**:
  - Admin: `admin@cropguard.local` / `Admin@123`
  - Farmer: `farmer.john@cropguard.local` / `Farmer@123`

```bash
cd frontend
npm install
# Create .env file from .env.example
npm run dev
```

4. **Access the Application**
- Open browser: `http://localhost:3000`
- Register a new account
- Start predicting!

📖 **For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crop_disease
JWT_SECRET=your_jwt_secret_key
AI_SERVICE_URL=http://localhost:5001
```

### AI Service (.env)
```
FLASK_PORT=5001
MODEL_PATH=./models/crop_disease_model.h5
UPLOAD_FOLDER=./uploads
```

## 🔄 Development Workflow (Scrum Agile)

- **Sprint 1**: Dataset preparation and model architecture
- **Sprint 2**: Model training and optimization
- **Sprint 3**: Backend API development
- **Sprint 4**: Frontend UI/UX development
- **Sprint 5**: Integration and testing
- **Sprint 6**: Deployment and evaluation

## 📊 Features

- ✅ Image upload and disease detection
- ✅ Treatment recommendations
- ✅ User authentication
- ✅ Prediction history
- ✅ Visual analytics dashboard
- ✅ Cloud-ready deployment

## 🤝 Contributing

This project follows Scrum Agile methodology. Contributions are welcome!

## 📄 License

MIT License

