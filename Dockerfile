FROM node:boron-slim
COPY /public        /app/public
COPY /views         /app/views
COPY /libs          /app/libs
COPY /app.js        /app
COPY /package.json  /app
COPY /mongodb.json* /app
WORKDIR             /app
EXPOSE 3000
RUN npm install
CMD npm start