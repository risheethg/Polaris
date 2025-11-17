import pandas as pd
import json
import os
import joblib
import gcsfs
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, SpatialDropout1D
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# --- Configuration with GCS and Local Fallback ---
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET", "your-gcs-bucket-name-here")

# Define Local Paths
# This script assumes your input file has 'content' (the job description text)
# and 'job_category' (the label you want to predict).
LOCAL_INPUT_PATH = 'jobs_data_for_classification.json'
LOCAL_MODEL_DIR = 'saved_rnn_model'
LOCAL_RNN_MODEL_PATH = os.path.join(LOCAL_MODEL_DIR, 'rnn_classifier.keras')
LOCAL_TOKENIZER_PATH = os.path.join(LOCAL_MODEL_DIR, 'tokenizer.joblib')
LOCAL_ENCODER_PATH = os.path.join(LOCAL_MODEL_DIR, 'label_encoder.joblib')
LOCAL_PERFORMANCE_PATH = os.path.join(LOCAL_MODEL_DIR, 'model_performance.json')

# Define GCS Paths
GCS_INPUT_PATH = f"gs://{GCS_BUCKET_NAME}/{LOCAL_INPUT_PATH}"
GCS_MODEL_DIR = f"gs://{GCS_BUCKET_NAME}/{LOCAL_MODEL_DIR}"
GCS_RNN_MODEL_PATH = os.path.join(GCS_MODEL_DIR, 'rnn_classifier.keras')
GCS_TOKENIZER_PATH = os.path.join(GCS_MODEL_DIR, 'tokenizer.joblib')
GCS_ENCODER_PATH = os.path.join(GCS_MODEL_DIR, 'label_encoder.joblib')
GCS_PERFORMANCE_PATH = os.path.join(GCS_MODEL_DIR, 'model_performance.json')

# --- Model Hyperparameters ---
MAX_VOCAB_SIZE = 10000  # Max number of words to keep in the vocabulary
MAX_SEQ_LENGTH = 250    # Max length of job descriptions to consider
EMBEDDING_DIM = 128     # Dimension of the word embeddings
EPOCHS = 5
BATCH_SIZE = 32

def load_data(gcs_path: str, local_path: str) -> pd.DataFrame:
    """Tries to load data from GCS, falls back to local file."""
    try:
        print(f"Attempting to load data from GCS path: {gcs_path}")
        with gcsfs.GCSFileSystem().open(gcs_path, 'r') as f:
            data = json.load(f)
        print("Successfully loaded data from GCS.")
        return pd.DataFrame(data)
    except Exception as e:
        print(f"GCS load failed: {e}. Falling back to local file: {local_path}")
        try:
            df = pd.read_json(local_path)
            print("Successfully loaded data from local file.")
            return df
        except Exception as local_e:
            print(f"Fatal Error: Could not load data from local path either. {local_e}")
            return pd.DataFrame()

def save_joblib_object(obj, local_path, gcs_path):
    """Saves a joblib object (like Tokenizer/Encoder) locally and to GCS."""
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    joblib.dump(obj, local_path)
    print(f"Successfully saved object locally to '{local_path}'.")
    try:
        fs = gcsfs.GCSFileSystem()
        with fs.open(gcs_path, 'wb') as f:
            joblib.dump(obj, f)
        print(f"Successfully saved object to GCS at '{gcs_path}'.")
    except Exception as e:
        print(f"Could not save object to GCS: {e}. A local copy is available.")

def save_keras_model(model, local_path, gcs_path):
    """Saves a Keras model locally and to GCS."""
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    model.save(local_path)
    print(f"Successfully saved Keras model locally to '{local_path}'.")
    try:
        fs = gcsfs.GCSFileSystem()
        # For Keras models, upload the saved file from local disk
        fs.put(local_path, gcs_path)
        print(f"Successfully saved Keras model to GCS at '{gcs_path}'.")
    except Exception as e:
        print(f"Could not save Keras model to GCS: {e}. A local copy is available.")

def save_json_report(data, local_path, gcs_path):
    """Saves a JSON report file locally and attempts to save to GCS."""
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    with open(local_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Successfully saved JSON report locally to '{local_path}'.")
    try:
        fs = gcsfs.GCSFileSystem()
        with fs.open(gcs_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully saved JSON report to GCS at '{gcs_path}'.")
    except Exception as e:
        print(f"Could not save JSON report to GCS: {e}. A local copy is available.")

# --- Main Execution ---
jobs_df = load_data(GCS_INPUT_PATH, LOCAL_INPUT_PATH)

if jobs_df.empty or 'content' not in jobs_df.columns or 'job_category' not in jobs_df.columns:
    print("Aborting training. Input data is missing, empty, or lacks required 'content' or 'job_category' columns.")
else:
    # 1. Preprocessing and Feature Engineering for RNN
    print("Starting data preprocessing for RNN...")
    jobs_df.dropna(subset=['content', 'job_category'], inplace=True)
    
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(jobs_df['job_category'])
    num_classes = len(label_encoder.classes_)
    print(f"Found {num_classes} unique job categories.")

    tokenizer = Tokenizer(num_words=MAX_VOCAB_SIZE, oov_token="<OOV>")
    tokenizer.fit_on_texts(jobs_df['content'])
    X_sequences = tokenizer.texts_to_sequences(jobs_df['content'])
    X_padded = pad_sequences(X_sequences, maxlen=MAX_SEQ_LENGTH, padding='post', truncating='post')
    
    X_train, X_test, y_train, y_test = train_test_split(X_padded, y, test_size=0.2, random_state=42)
    print(f"Data split into {len(X_train)} training samples and {len(X_test)} testing samples.")

    # 2. Build and Compile RNN Model
    print("\nBuilding RNN model...")
    model = Sequential([
        Embedding(input_dim=MAX_VOCAB_SIZE, output_dim=EMBEDDING_DIM, input_length=MAX_SEQ_LENGTH),
        SpatialDropout1D(0.2),
        LSTM(64, dropout=0.2, recurrent_dropout=0.2),
        Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        loss='sparse_categorical_crossentropy',
        optimizer='adam',
        metrics=['accuracy']
    )
    model.summary()

    # 3. Train the RNN Model
    print(f"\nTraining RNN model for {EPOCHS} epochs...")
    history = model.fit(
        X_train, y_train,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        validation_data=(X_test, y_test),
        verbose=2
    )
    print("Model training complete.")
    
    # 4. Save Model and Preprocessing Artifacts
    print("\n--- Saving model artifacts ---")
    save_keras_model(model, LOCAL_RNN_MODEL_PATH, GCS_RNN_MODEL_PATH)
    save_joblib_object(tokenizer, LOCAL_TOKENIZER_PATH, GCS_TOKENIZER_PATH)
    save_joblib_object(label_encoder, LOCAL_ENCODER_PATH, GCS_ENCODER_PATH)

    # 5. Evaluate and Save Performance
    print("\n--- Evaluating final model ---")
    final_loss, final_accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"Final Validation Loss: {final_loss:.4f}")
    print(f"Final Validation Accuracy: {final_accuracy:.4f}")
    
    performance_report = {
        'final_validation_loss': final_loss,
        'final_validation_accuracy': final_accuracy,
        'num_classes': num_classes,
        'training_samples': len(X_train),
        'hyperparameters': {
            'max_vocab_size': MAX_VOCAB_SIZE,
            'max_seq_length': MAX_SEQ_LENGTH,
            'embedding_dim': EMBEDDING_DIM,
            'epochs': EPOCHS
        }
    }
    save_json_report(performance_report, LOCAL_PERFORMANCE_PATH, GCS_PERFORMANCE_PATH)