# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Run via nginx + node
FROM node:20-alpine
RUN apk add --no-cache nginx
WORKDIR /app
COPY --from=build /app .
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY start.sh /start.sh
RUN sed -i 's/\r//' /start.sh && chmod +x /start.sh
EXPOSE 80
CMD ["/start.sh"]
