FROM node

WORKDIR /home/app

COPY package.json package.json
COPY dist dist

ENTRYPOINT [ "npm", "run", "start" ]