FROM node:22-slim

RUN apt-get update && apt-get install -yq \
  build-essential \
  python3

RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install --legacy-peer-deps

COPY . .

ENV NODE_ENV=production
RUN make build

CMD ["bash", "-c", "make db-migrate && npm start"]
