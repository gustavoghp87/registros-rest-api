FROM node:16-alpine
ENV NODE_ENV=production
ENV PORT 8080
RUN apk update
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY . .
RUN ls -a
RUN npm install
# RUN npm install -g typescript
# RUN npm run build
EXPOSE 8080
CMD [ "node", "./build/server.js" ]