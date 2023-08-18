FROM node:16-alpine
ENV NODE_ENV=production
RUN apk update
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY src /app/src
RUN npm run build
CMD [ "node", "./build/server.js" ]