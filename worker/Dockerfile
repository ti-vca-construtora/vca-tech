# Dockerfile para o Worker Playwright
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código do worker
COPY index.js ./

# Instalar browsers do Playwright
RUN npx playwright install chromium

# Comando para executar o worker
CMD ["node", "index.js"]
