FROM node:boron-slim
COPY /public        /app/public
COPY /views         /app/views
COPY /libs          /app/libs
COPY /app.js        /app
COPY /routes.js     /app
COPY /package.json  /app
COPY /mongodb.json* /app
WORKDIR             /app
EXPOSE 3000
RUN apt update && \
    apt install -y python build-essential
RUN npm install -g node-gyp && \
    npm install
CMD npm start