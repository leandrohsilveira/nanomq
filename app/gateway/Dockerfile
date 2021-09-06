FROM node

ENV PORT=8080

WORKDIR /home/app

COPY package.json .
COPY node_modules .
COPY dist .

EXPOSE ${PORT}

ENTRYPOINT [ "npm", "run", "start" ]