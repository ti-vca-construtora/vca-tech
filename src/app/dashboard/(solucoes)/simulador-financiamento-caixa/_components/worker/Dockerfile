FROM mcr.microsoft.com/playwright:v1.48.0-focal

WORKDIR /app

COPY package.json ./
RUN npm install

COPY index.js ./

CMD ["npm", "start"]
