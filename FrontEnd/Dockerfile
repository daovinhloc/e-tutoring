FROM node:18-alpine

WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Xóa package-lock.json để tránh xung đột dependency
RUN rm -f package-lock.json

# Cài đặt dependencies với force
RUN npm install --force

# Sao chép toàn bộ code nguồn
COPY . .

# Mở cổng 5173
EXPOSE 5173

# Cấu hình để Vite chấp nhận kết nối từ bên ngoài
ENV HOST=0.0.0.0

# Khởi chạy ứng dụng
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]