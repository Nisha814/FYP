"""
CNN Model Training Script for Crop Disease Detection
This script trains a Convolutional Neural Network to classify crop diseases from leaf images.
"""

import os
import json
import hashlib
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix

# Set random seeds for reproducibility
tf.random.set_seed(42)
np.random.seed(42)

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.001
TRAIN_DIR = './data/train'
VAL_DIR = './data/validation'
TEST_DIR = './data/test'
MODEL_SAVE_PATH = '../ai-service/models/crop_disease_model.h5'

def export_class_labels(class_names):
    """Export class labels for runtime auto-discovery."""
    export_payload = {
        'labels': class_names,
        'label_count': len(class_names)
    }
    export_paths = [
        '../ai-service/models/class_labels.json',
        './artifacts/class_labels.json'
    ]

    for export_path in export_paths:
        export_dir = os.path.dirname(export_path)
        if export_dir:
            os.makedirs(export_dir, exist_ok=True)
        with open(export_path, 'w', encoding='utf-8') as handle:
            json.dump(export_payload, handle, indent=2)
        print(f"✅ Exported class labels to: {export_path}")

def compute_dataset_hash(directories, mode='metadata'):
    """Compute stable hash from dataset files metadata or bytes."""
    hasher = hashlib.sha256()
    discovered_files = []
    for dataset_dir in directories:
        if not os.path.exists(dataset_dir):
            continue
        for root, _, files in os.walk(dataset_dir):
            for file_name in sorted(files):
                file_path = os.path.join(root, file_name)
                try:
                    stat = os.stat(file_path)
                    rel_path = os.path.relpath(file_path, dataset_dir)
                    discovered_files.append(f"{dataset_dir}:{rel_path}:{stat.st_size}:{int(stat.st_mtime)}")
                except OSError:
                    continue

    for entry in sorted(discovered_files):
        hasher.update(entry.encode('utf-8'))

    if mode == 'bytes':
        for dataset_dir in directories:
            if not os.path.exists(dataset_dir):
                continue
            for root, _, files in os.walk(dataset_dir):
                for file_name in sorted(files):
                    file_path = os.path.join(root, file_name)
                    try:
                        with open(file_path, 'rb') as file_handle:
                            while True:
                                chunk = file_handle.read(1024 * 1024)
                                if not chunk:
                                    break
                                hasher.update(chunk)
                    except OSError:
                        continue

    return hasher.hexdigest()

def export_training_metadata(class_names, class_indices):
    """Export runtime metadata for model introspection."""
    dataset_hash_mode = os.getenv('DATASET_HASH_MODE', 'metadata').strip().lower()
    if dataset_hash_mode not in ['metadata', 'bytes']:
        dataset_hash_mode = 'metadata'

    metadata = {
        'model_version': os.getenv('MODEL_VERSION', '1.0.0'),
        'class_index_map': class_indices,
        'class_names': class_names,
        'dataset_hash': compute_dataset_hash([TRAIN_DIR, VAL_DIR, TEST_DIR], mode=dataset_hash_mode),
        'dataset_hash_mode': dataset_hash_mode,
        'image_size': IMG_SIZE,
        'batch_size': BATCH_SIZE,
        'epochs': EPOCHS,
        'learning_rate': LEARNING_RATE
    }

    export_paths = [
        '../ai-service/models/model_metadata.json',
        './artifacts/model_metadata.json'
    ]

    for export_path in export_paths:
        export_dir = os.path.dirname(export_path)
        if export_dir:
            os.makedirs(export_dir, exist_ok=True)
        with open(export_path, 'w', encoding='utf-8') as handle:
            json.dump(metadata, handle, indent=2)
        print(f"✅ Exported training metadata to: {export_path}")

def create_model(num_classes):
    """Create CNN model architecture"""
    model = keras.Sequential([
        # Input layer
        layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),
        
        # First Convolutional Block
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Second Convolutional Block
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Third Convolutional Block
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Fourth Convolutional Block
        layers.Conv2D(256, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(256, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Flatten and Dense Layers
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.5),
        
        # Output Layer
        layers.Dense(num_classes, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', 'top_3_accuracy']
    )
    
    return model

def create_data_generators():
    """Create data generators with augmentation"""
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # Only rescaling for validation and test
    val_test_datagen = ImageDataGenerator(rescale=1./255)
    
    # Create generators
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )
    
    val_generator = val_test_datagen.flow_from_directory(
        VAL_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    test_generator = val_test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    return train_generator, val_generator, test_generator

def plot_training_history(history):
    """Plot training history"""
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    # Plot accuracy
    axes[0].plot(history.history['accuracy'], label='Train Accuracy')
    axes[0].plot(history.history['val_accuracy'], label='Validation Accuracy')
    axes[0].set_title('Model Accuracy')
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Accuracy')
    axes[0].legend()
    axes[0].grid(True)
    
    # Plot loss
    axes[1].plot(history.history['loss'], label='Train Loss')
    axes[1].plot(history.history['val_loss'], label='Validation Loss')
    axes[1].set_title('Model Loss')
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('Loss')
    axes[1].legend()
    axes[1].grid(True)
    
    plt.tight_layout()
    plt.savefig('training_history.png')
    print("✅ Training history saved as 'training_history.png'")

def plot_confusion_matrix(y_true, y_pred, class_names):
    """Plot confusion matrix"""
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('confusion_matrix.png')
    print("✅ Confusion matrix saved as 'confusion_matrix.png'")

def main():
    """Main training function"""
    print("🚀 Starting Crop Disease Detection Model Training")
    print("=" * 60)
    
    # Check if data directories exist
    if not os.path.exists(TRAIN_DIR):
        print(f"❌ Training directory not found: {TRAIN_DIR}")
        print("📝 Please organize your dataset in the following structure:")
        print("   data/")
        print("   ├── train/")
        print("   │   ├── Healthy/")
        print("   │   ├── Early_Blight/")
        print("   │   └── ...")
        print("   ├── validation/")
        print("   └── test/")
        return
    
    # Create data generators
    print("\n📊 Loading and preprocessing data...")
    train_gen, val_gen, test_gen = create_data_generators()
    
    num_classes = len(train_gen.class_indices)
    class_names = list(train_gen.class_indices.keys())
    
    print(f"✅ Found {num_classes} classes: {class_names}")
    print(f"✅ Training samples: {train_gen.samples}")
    print(f"✅ Validation samples: {val_gen.samples}")
    print(f"✅ Test samples: {test_gen.samples}")
    export_class_labels(class_names)
    export_training_metadata(class_names, train_gen.class_indices)
    
    # Create model
    print("\n🏗️  Creating CNN model...")
    model = create_model(num_classes)
    model.summary()
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(
            MODEL_SAVE_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=0.00001,
            verbose=1
        )
    ]
    
    # Train model
    print("\n🎯 Training model...")
    history = model.fit(
        train_gen,
        epochs=EPOCHS,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate on test set
    print("\n📈 Evaluating on test set...")
    test_loss, test_accuracy, test_top3 = model.evaluate(test_gen, verbose=1)
    print(f"✅ Test Accuracy: {test_accuracy:.4f}")
    print(f"✅ Test Top-3 Accuracy: {test_top3:.4f}")
    
    # Generate predictions for classification report
    test_gen.reset()
    predictions = model.predict(test_gen, verbose=1)
    y_pred = np.argmax(predictions, axis=1)
    y_true = test_gen.classes
    
    # Classification report
    print("\n📊 Classification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names))
    
    # Plot results
    print("\n📉 Generating visualizations...")
    plot_training_history(history)
    plot_confusion_matrix(y_true, y_pred, class_names)
    
    print("\n✅ Training completed successfully!")
    print(f"✅ Model saved to: {MODEL_SAVE_PATH}")

if __name__ == '__main__':
    main()

