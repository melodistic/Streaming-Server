FROM node:latest

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN mkdir music

CMD ["npm", "start"]
