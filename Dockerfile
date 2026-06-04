# Stage 1: Build the Vue 3 Vite application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Fallback routing for SPA (Vue Router history mode)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Expose default port (optional, Cloud Run handles this)
EXPOSE 8080

# Start Nginx server, injecting Cloud Run's PORT env variable into the config
CMD sed -i -e 's/listen 80;/listen '"${PORT:-8080}"';/g' /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"
