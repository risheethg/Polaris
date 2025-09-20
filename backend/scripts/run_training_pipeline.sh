#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "Starting Step 1: Data Preprocessing..."
python 1_preprocess_data.py

echo "Starting Step 2: Model Training..."
python 2_train_model.py

echo "Training pipeline finished successfully."