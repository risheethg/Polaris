FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scripts/knn_algo.py .
COPY scraper/scrapped_job.json .

CMD ["python", "knn_algo.py"]