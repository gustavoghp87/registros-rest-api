FROM node:9.7.1
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run tsc
CMD ["npm", "start"]
