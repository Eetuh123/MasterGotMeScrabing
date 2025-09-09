FROM node:20

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY src/ ./src/

RUN mkdir -p public
COPY public/ ./public/

CMD ["node", "src/index.js"]