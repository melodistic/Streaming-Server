FROM node:16

WORKDIR /app

COPY package.json .

RUN npm install -g ts-node typescript

RUN npm install

COPY . .

CMD ["npm", "start"]
