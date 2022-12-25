FROM node:18-alpine

WORKDIR /src/
RUN chown -R node:node /src/

COPY --chown=node:node package.json package-lock.json /src/

RUN npm ci --silent

COPY --chown=node:node . .

USER node
CMD npm start