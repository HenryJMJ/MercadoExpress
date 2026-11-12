FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --production

COPY server.js ./
COPY routes.js ./
COPY db.js ./
COPY redis.js ./

EXPOSE 4006

CMD ["node", "server.js"]
