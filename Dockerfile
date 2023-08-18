FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY src /app/src
RUN npm run tsc

FROM node:16-alpine

WORKDIR /app
COPY --from=builder /app/build /app/build
COPY package*.json ./
RUN npm install --production

CMD [ "node", "./build/server.js" ]
