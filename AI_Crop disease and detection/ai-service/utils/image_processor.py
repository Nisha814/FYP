"""
Image processing utilities for crop disease detection
"""

import cv2
import numpy as np
from PIL import Image
import os

def preprocess_image(image_path, target_size=(224, 224)):
    """
    Preprocess image for model prediction
    
    Args:
        image_path: Path to image file
        target_size: Target size (width, height)
    
    Returns:
        Preprocessed image array
    """
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image: {image_path}")
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize
        img = cv2.resize(img, target_size)
        
        # Normalize pixel values to [0, 1]
        img = img.astype('float32') / 255.0
        
        # Expand dimensions for batch
        img = np.expand_dims(img, axis=0)
        
        return img
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")

def validate_image(image_path):
    """
    Validate image file
    
    Args:
        image_path: Path to image file
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not os.path.exists(image_path):
        return False, "Image file not found"
    
    try:
        img = Image.open(image_path)
        img.verify()
        return True, None
    except Exception as e:
        return False, f"Invalid image file: {str(e)}"

def enhance_image(image_path, output_path=None):
    """
    Enhance image quality for better prediction
    
    Args:
        image_path: Path to input image
        output_path: Path to save enhanced image (optional)
    
    Returns:
        Enhanced image array
    """
    img = cv2.imread(image_path)
    
    # Convert to LAB color space
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # Apply CLAHE to L channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    
    # Merge channels
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    
    if output_path:
        cv2.imwrite(output_path, enhanced)
    
    return enhanced

