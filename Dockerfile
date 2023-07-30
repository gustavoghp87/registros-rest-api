FROM node:16-alpine
ENV NODE_ENV=production
RUN apk update
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY . .
RUN ls -a
RUN npm install
CMD [ "node", "./build/server.js" ]