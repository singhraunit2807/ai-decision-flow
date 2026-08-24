FROM python:3.11-slim

WORKDIR /app
COPY nova/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY nova /app/nova
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["uvicorn", "nova.app:app", "--host", "0.0.0.0", "--port", "8000"]
