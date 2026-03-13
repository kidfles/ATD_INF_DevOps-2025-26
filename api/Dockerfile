
FROM node:20.12.2-alpine

# Stel de werkmap in 
WORKDIR /app

# Kopieer eerst de package configs en installeer afhankelijkheden
COPY package*.json ./
RUN npm install

# Neem alle overige code mee 
COPY . .

EXPOSE 3000

CMD ["npm", "start"]