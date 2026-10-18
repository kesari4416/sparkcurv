FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as an unprivileged user
RUN useradd --create-home --uid 10001 app && chown -R app /app
USER app

EXPOSE 8001

# Secrets come from the environment (docker run --env-file .env), never from the image.
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port 8001 --workers ${WEB_CONCURRENCY:-4}"]
