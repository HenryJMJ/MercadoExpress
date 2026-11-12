FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY server.js ./
COPY middleware.js ./

EXPOSE 3000

CMD ["node", "server.js"]
