FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY server.js ./
COPY routes.js ./
COPY db.js ./

EXPOSE 4005

CMD ["node", "server.js"]
