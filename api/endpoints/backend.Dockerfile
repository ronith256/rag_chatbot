FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY api/endpoints/requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

COPY api/endpoints/ /app
COPY config/firebase.json /app/
COPY config/.backend.env /app/.backend.env

ENV PYTHONPATH=/app
ENV MONGO_URI=mongodb://mongodb:27017
ENV DB_NAME=rag_db

# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5984"]
CMD ["python3", "./main.py"]
