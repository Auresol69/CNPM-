# Dùng bản Python 3.9 Slim
FROM python:3.9-slim-bullseye

# 1. Cài thư viện hệ thống CƠ BẢN (Chỉ để chạy, không phải để build)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Tải file dlib đã biên dịch sẵn (Bỏ qua bước compile tốn RAM)
# Link này chứa file .whl cho Linux x86_64 (Render dùng kiến trúc này)
RUN wget https://github.com/davisking/dlib/releases/download/v19.22/dlib-19.22.99-cp39-cp39-linux_x86_64.whl

# 3. Cài dlib từ file vừa tải
RUN pip install dlib-19.22.99-cp39-cp39-linux_x86_64.whl

# 4. Cài các thư viện còn lại
COPY requirements.txt .
# Quan trọng: Loại bỏ dlib khỏi requirements.txt trước khi chạy lệnh này để tránh nó cài lại
RUN grep -v "dlib" requirements.txt > req_no_dlib.txt && \
    pip install --no-cache-dir -r req_no_dlib.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--timeout", "120"]