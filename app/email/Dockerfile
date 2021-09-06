FROM node

WORKDIR /home/app

COPY package.json .
COPY node_modules .
COPY dist ./dist

ENTRYPOINT [ "npm", "run", "start" ]