FROM python:3.9-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8085

# Use waitress as the production WSGI server (already in requirements.txt)
# DB connection params can be overridden at runtime via environment variables:
#   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
CMD ["waitress-serve", "--host=0.0.0.0", "--port=8085", "main:app"]
