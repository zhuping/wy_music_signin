FROM node:10
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY *.js src/
EXPOSE 4000
RUN ls -la src/*
ENTRYPOINT [ "node", "src/server.js" ]