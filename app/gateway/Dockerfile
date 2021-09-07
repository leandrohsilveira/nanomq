FROM node

ENV PORT=8080

WORKDIR /home/app

COPY package.json package.json
COPY dist dist

EXPOSE ${PORT}

ENTRYPOINT [ "npm", "run", "start" ]