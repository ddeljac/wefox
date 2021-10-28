FROM node:14.17.0

ENV NODE_ENV development

WORKDIR /app

COPY package*.json /app/
COPY tsconfig.json /app/

RUN npm install

COPY . .

# RUN npm run build

VOLUME /app

CMD [ "npm", "start:dev" ]
