FROM node:8.11.1
WORKDIR /app
COPY . /app/
RUN npm cache clean --force && npm install
CMD node --max-old-space-size=4096 app.js
EXPOSE 8084

# This default user is created in the openshift/base-centos7 image
USER 1001
