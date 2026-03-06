# Gebruik een vaste versie van NodeJS (bijv. versie 20)
FROM node:20

# Stel de werkmap in binnen de container
WORKDIR /app

# Kopieer eerst de package configs en installeer afhankelijkheden
# Dit doen we apart voor efficiëntere Docker caching
COPY package*.json ./
RUN npm install

# Neem alle overige code mee in de image
COPY . .

# Environment variabelen instellen voor PORT en MONGO_URL
ENV PORT=12345
ENV MONGO_URL="mongodb://localhost:27017/mijn_database"

# Expose de interne poort (hetzelfde als de ENV PORT)
EXPOSE 12345

# Startcommando instellen
CMD ["npm", "start"]
