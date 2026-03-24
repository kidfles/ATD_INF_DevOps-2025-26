# --- STAGE 1: Build (Production) ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# --- STAGE 2: Run (Production) ---
FROM nginx:alpine
COPY --from=build /app/dist/client/browser /usr/share/nginx/html

# Script om de API URL in config.json aan te passen op basis van een environment variable
RUN printf "#!/bin/sh\n\
if [ -n \"\$API_URL\" ]; then\n\
  echo \"{\\\"apiUrl\\\": \\\"\$API_URL\\\"}\" > /usr/share/nginx/html/assets/config.json\n\
fi\n\
exec \"\$@\"" > /entrypoint.sh && chmod +x /entrypoint.sh

# Nginx config voor SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
