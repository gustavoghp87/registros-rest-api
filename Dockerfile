FROM node:16-alpine
ENV NODE_ENV=production
RUN apk update
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY . .
RUN ls -a
RUN npm install
RUN npm run build
# EXPOSE 8080
CMD [ "node", "./build/server.js" ]