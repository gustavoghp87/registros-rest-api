FROM node:16-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
RUN npm install --save-dev typescript ts-node
RUN npm run build
EXPOSE 8080
CMD [ "ts-node", "dist/index.js" ]
