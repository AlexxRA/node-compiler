FROM node:14

# Create app directory
WORKDIR /usr/src/compiler

# install node modules
COPY package*.json ./
RUN npm install

COPY . .

RUN apt-get install g++

EXPOSE 3000
CMD [ "npm", "run", "devStart" ]