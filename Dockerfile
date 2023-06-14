FROM node:16-alpine
ENV NODE_ENV=production
ENV PORT 3000
RUN apk update
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY . .
RUN ls -a
RUN npm install
# RUN npm install -g typescript
# RUN npm run build
EXPOSE 3000
CMD [ "node", "./build/server.js" ]