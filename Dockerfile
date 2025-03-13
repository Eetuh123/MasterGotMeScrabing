FROM node:18

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \ 
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY src/ ./src/

CMD ["node", "src/index.js"]