# Bước 1: Sử dụng image Python làm base
FROM python:3.9-slim

# Bước 2: Cài đặt thư viện cần thiết
WORKDIR /app  # Đặt thư mục làm việc là /app trong container
COPY requirements.txt /app/  # Sao chép tệp requirements.txt vào container
RUN pip install --no-cache-dir -r requirements.txt  # Cài đặt các thư viện từ requirements.txt

# Bước 3: Sao chép mã nguồn vào container
COPY . /app/  # Sao chép toàn bộ mã nguồn vào thư mục /app

# Bước 4: Chạy lệnh collectstatic để chuẩn bị tệp tĩnh cho Django
RUN python manage.py collectstatic --noinput

# Bước 5: Mở cổng ứng dụng
EXPOSE 8000  # Mở cổng 8000 để ứng dụng Django có thể truy cập

# Bước 6: Đặt lệnh mặc định để chạy ứng dụng Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]  # Chạy server Django
