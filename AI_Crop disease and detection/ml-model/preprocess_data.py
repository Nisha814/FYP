"""
Data Preprocessing Script
Organizes and preprocesses crop disease images for training.
"""

import os
import shutil
from pathlib import Path
import cv2
import numpy as np
from sklearn.model_selection import train_test_split

def organize_dataset(source_dir, output_dir, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15):
    """
    Organize dataset into train/validation/test splits
    
    Args:
        source_dir: Directory containing class folders
        output_dir: Output directory for organized dataset
        train_ratio: Ratio of training data
        val_ratio: Ratio of validation data
        test_ratio: Ratio of test data
    """
    assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 0.01, "Ratios must sum to 1.0"
    
    # Create output directories
    for split in ['train', 'validation', 'test']:
        os.makedirs(os.path.join(output_dir, split), exist_ok=True)
    
    # Get all class directories
    classes = [d for d in os.listdir(source_dir) 
               if os.path.isdir(os.path.join(source_dir, d))]
    
    print(f"Found {len(classes)} classes: {classes}")
    
    for class_name in classes:
        class_dir = os.path.join(source_dir, class_name)
        images = [f for f in os.listdir(class_dir) 
                  if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        print(f"\nProcessing {class_name}: {len(images)} images")
        
        # Split images
        train_imgs, temp_imgs = train_test_split(
            images, test_size=(1 - train_ratio), random_state=42
        )
        val_imgs, test_imgs = train_test_split(
            temp_imgs, test_size=(test_ratio / (val_ratio + test_ratio)), random_state=42
        )
        
        # Copy images to respective directories
        for split, img_list in [('train', train_imgs), ('validation', val_imgs), ('test', test_imgs)]:
            split_dir = os.path.join(output_dir, split, class_name)
            os.makedirs(split_dir, exist_ok=True)
            
            for img in img_list:
                src = os.path.join(class_dir, img)
                dst = os.path.join(split_dir, img)
                shutil.copy2(src, dst)
            
            print(f"  {split}: {len(img_list)} images")
    
    print("\n✅ Dataset organization completed!")

def preprocess_image(image_path, target_size=(224, 224)):
    """
    Preprocess a single image
    
    Args:
        image_path: Path to image file
        target_size: Target size (width, height)
    
    Returns:
        Preprocessed image array
    """
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    
    # Convert BGR to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Resize
    img = cv2.resize(img, target_size)
    
    # Normalize
    img = img.astype('float32') / 255.0
    
    return img

if __name__ == '__main__':
    # Example usage
    source_dir = './raw_data'
    output_dir = './data'
    
    if os.path.exists(source_dir):
        organize_dataset(source_dir, output_dir)
    else:
        print(f"Source directory not found: {source_dir}")
        print("Please organize your raw data in the following structure:")
        print("raw_data/")
        print("├── Healthy/")
        print("├── Early_Blight/")
        print("├── Late_Blight/")
        print("└── ...")

