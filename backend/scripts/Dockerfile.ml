# Use a Python base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the machine learning script and any necessary data
COPY scripts/knn_algo.py .
COPY scraper/scrapped_job.json .

# Define the command to run the script
CMD ["python", "knn_algo.py"]