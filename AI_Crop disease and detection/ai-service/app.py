from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
from PIL import Image
import cv2
from tensorflow import keras
from tensorflow.keras.models import load_model
from werkzeug.utils import secure_filename
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', './uploads')
MODEL_PATH = os.getenv('MODEL_PATH', './models/crop_disease_model.h5')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 10485760))  # 10MB
DEFAULT_MODEL_CLASS_LABELS = [label.strip() for label in os.getenv(
    'MODEL_CLASS_LABELS',
    'Tomato___healthy,Tomato___Early_blight,Tomato___Late_blight,Potato___Early_blight,Potato___Late_blight'
).split(',') if label.strip()]

def load_class_labels_from_artifacts():
    """Load class labels from known artifact locations."""
    env_path = os.getenv('MODEL_LABELS_PATH')
    model_dir = os.path.dirname(MODEL_PATH) if MODEL_PATH else '.'
    model_name = os.path.splitext(os.path.basename(MODEL_PATH))[0] if MODEL_PATH else 'crop_disease_model'

    candidate_paths = [
        env_path,
        os.path.join(model_dir, 'class_labels.json'),
        os.path.join(model_dir, f'{model_name}_labels.json'),
        os.path.join(model_dir, f'{model_name}.labels.json'),
        os.path.join(os.path.dirname(__file__), '../ml-model/class_labels.json'),
        os.path.join(os.path.dirname(__file__), '../ml-model/artifacts/class_labels.json')
    ]

    for candidate in candidate_paths:
        if not candidate:
            continue
        resolved = os.path.abspath(candidate)
        if not os.path.exists(resolved):
            continue
        try:
            with open(resolved, 'r', encoding='utf-8') as handle:
                data = json.load(handle)
            labels = data.get('labels') if isinstance(data, dict) else data
            if isinstance(labels, list) and labels:
                parsed = [str(label).strip() for label in labels if str(label).strip()]
                if parsed:
                    print(f"✅ Loaded {len(parsed)} class labels from {resolved}")
                    return parsed
        except Exception as error:
            print(f"⚠️ Failed to parse class labels from {resolved}: {error}")

    print("⚠️ Using fallback class labels from environment/default values.")
    return DEFAULT_MODEL_CLASS_LABELS

def load_model_metadata_from_artifacts():
    """Load optional model metadata exported by training script."""
    candidate_paths = [
        os.getenv('MODEL_METADATA_PATH'),
        os.path.join(os.path.dirname(MODEL_PATH), 'model_metadata.json'),
        os.path.join(os.path.dirname(__file__), '../ml-model/artifacts/model_metadata.json')
    ]
    for candidate in candidate_paths:
        if not candidate:
            continue
        resolved = os.path.abspath(candidate)
        if not os.path.exists(resolved):
            continue
        try:
            with open(resolved, 'r', encoding='utf-8') as handle:
                metadata = json.load(handle)
            print(f"✅ Loaded model metadata from {resolved}")
            return metadata
        except Exception as error:
            print(f"⚠️ Failed to parse model metadata from {resolved}: {error}")
    return {}

MODEL_CLASS_LABELS = load_class_labels_from_artifacts()
MODEL_METADATA = load_model_metadata_from_artifacts()

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load model (lazy loading)
model = None

def load_ai_model():
    """Load the trained CNN model"""
    global model
    if model is None:
        try:
            if os.path.exists(MODEL_PATH):
                model = load_model(MODEL_PATH)
                print(f"✅ Model loaded successfully from {MODEL_PATH}")
            else:
                print(f"⚠️  Model file not found at {MODEL_PATH}. Using mock predictions.")
        except Exception as e:
            print(f"❌ Error loading model: {e}. Using mock predictions.")
    return model

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_path):
    """Preprocess image for model prediction"""
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image")
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize to 224x224 (standard for most CNN models)
        img = cv2.resize(img, (224, 224))
        
        # Normalize pixel values to [0, 1]
        img = img.astype('float32') / 255.0
        
        # Expand dimensions for batch
        img = np.expand_dims(img, axis=0)
        
        return img
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

def get_disease_recommendations(disease_name, plant_type):
    """Get treatment recommendations based on disease"""
    recommendations = []
    
    # Disease-specific recommendations
    disease_db = {
        'Early Blight': {
            'fertilizer': {
                'name': 'Potassium-rich fertilizer',
                'description': 'Helps strengthen plant resistance',
                'application': 'Apply every 2 weeks',
                'dosage': '2-3 kg per 100 sq meters'
            },
            'pesticide': {
                'name': 'Copper-based fungicide',
                'description': 'Effective against fungal diseases',
                'application': 'Spray every 7-10 days',
                'dosage': '2-3 ml per liter of water'
            },
            'organic': {
                'name': 'Neem oil solution',
                'description': 'Natural antifungal treatment',
                'application': 'Spray weekly',
                'dosage': '5-10 ml per liter of water'
            }
        },
        'Late Blight': {
            'fertilizer': {
                'name': 'Balanced NPK fertilizer',
                'description': 'Provides essential nutrients',
                'application': 'Apply monthly',
                'dosage': '1-2 kg per 100 sq meters'
            },
            'pesticide': {
                'name': 'Mancozeb fungicide',
                'description': 'Broad-spectrum fungicide',
                'application': 'Spray every 5-7 days',
                'dosage': '2-3 g per liter of water'
            },
            'organic': {
                'name': 'Baking soda solution',
                'description': 'Natural fungicide',
                'application': 'Spray every 3-5 days',
                'dosage': '1 tablespoon per liter of water'
            }
        },
        'Healthy': {
            'fertilizer': {
                'name': 'General purpose fertilizer',
                'description': 'Maintain plant health',
                'application': 'Apply monthly',
                'dosage': '1 kg per 100 sq meters'
            }
        }
    }
    
    if disease_name in disease_db:
        disease_info = disease_db[disease_name]
        for treatment_type, info in disease_info.items():
            recommendations.append({
                'treatmentType': treatment_type,
                **info
            })
    else:
        # Default recommendations
        recommendations = [
            {
                'treatmentType': 'fertilizer',
                'name': 'Balanced NPK fertilizer',
                'description': 'General purpose fertilizer',
                'application': 'Apply as per package instructions',
                'dosage': 'Follow manufacturer guidelines'
            },
            {
                'treatmentType': 'organic',
                'name': 'Organic compost',
                'description': 'Improve soil health naturally',
                'application': 'Apply monthly',
                'dosage': '5-10 kg per 100 sq meters'
            }
        ]
    
    return recommendations

def infer_plant_identity(plant_type, disease_name):
    """Infer plant identity and high-level category."""
    normalized = (plant_type or "").strip().lower()
    known = {
        "tomato": "vegetable",
        "potato": "vegetable",
        "pepper": "vegetable",
        "chili": "vegetable",
        "cucumber": "vegetable",
        "brinjal": "vegetable",
        "eggplant": "vegetable",
        "apple": "fruit",
        "orange": "fruit",
        "banana": "fruit",
        "grape": "fruit",
        "mango": "fruit",
        "strawberry": "fruit"
    }

    if normalized in known:
        return plant_type.strip().title(), known[normalized]

    disease_to_plant = {
        "Early Blight": ("Tomato", "vegetable"),
        "Late Blight": ("Potato", "vegetable"),
        "Bacterial Spot": ("Pepper", "vegetable"),
        "Leaf Mold": ("Tomato", "vegetable"),
        "Healthy": ("Unknown", "other")
    }
    return disease_to_plant.get(disease_name, ("Unknown", "other"))

def parse_model_label(raw_label):
    """Parse labels like Tomato___Early_blight into fields."""
    clean = (raw_label or "").strip()
    if not clean:
      return ("Unknown", "Unknown", "other", False)

    parts = clean.replace("__", "_").split("___")
    if len(parts) == 2:
      plant_raw, disease_raw = parts[0], parts[1]
    else:
      segments = clean.split("_")
      plant_raw = segments[0] if segments else "Unknown"
      disease_raw = "_".join(segments[1:]) if len(segments) > 1 else "Unknown"

    plant = plant_raw.replace("_", " ").title()
    disease = disease_raw.replace("_", " ").title()
    is_healthy = disease.lower() == "healthy"
    identified_plant, plant_category = infer_plant_identity(plant, disease)
    return (identified_plant, disease, plant_category, is_healthy)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'message': 'AI Service is running',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict disease from uploaded image"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        plant_type = request.form.get('plantType', 'Unknown')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only images are allowed.'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Preprocess image
        try:
            processed_image = preprocess_image(filepath)
        except Exception as e:
            os.remove(filepath)  # Clean up
            return jsonify({'error': f'Error processing image: {str(e)}'}), 400
        
        # Load model
        ai_model = load_ai_model()
        
        # Make prediction
        if ai_model is not None:
            try:
                predictions = ai_model.predict(processed_image, verbose=0)
                predicted_class = np.argmax(predictions[0])
                confidence = float(predictions[0][predicted_class] * 100)
                
                raw_label = MODEL_CLASS_LABELS[predicted_class] if predicted_class < len(MODEL_CLASS_LABELS) else 'Unknown___Unknown'
                identified_plant, disease, plant_category, is_healthy = parse_model_label(raw_label)
            except Exception as e:
                print(f"Model prediction error: {e}")
                # Fallback to mock prediction
                disease = 'Early Blight'
                confidence = 85.5
                is_healthy = False
                identified_plant, plant_category = infer_plant_identity(plant_type, disease)
        else:
            # Mock prediction for development/testing
            disease = 'Early Blight'
            confidence = 85.5
            is_healthy = False
            identified_plant, plant_category = infer_plant_identity(plant_type, disease)
        
        # Get recommendations
        recommendations = get_disease_recommendations(disease, plant_type or identified_plant)
        
        # Clean up uploaded file (optional)
        # os.remove(filepath)
        
        return jsonify({
            'success': True,
            'disease': disease,
            'confidence': round(confidence, 2),
            'isHealthy': is_healthy,
            'plantType': plant_type,
            'identifiedPlant': identified_plant,
            'plantCategory': plant_category,
            'recommendations': recommendations
        })
        
    except Exception as e:
        print(f"Error in predict endpoint: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    ai_model = load_ai_model()
    
    if ai_model is None:
        return jsonify({
            'model_loaded': False,
            'message': 'Model not loaded'
        })
    
    return jsonify({
        'model_loaded': True,
        'model_path': MODEL_PATH,
        'input_shape': str(ai_model.input_shape) if hasattr(ai_model, 'input_shape') else 'Unknown',
        'metadata': MODEL_METADATA
    })

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)

