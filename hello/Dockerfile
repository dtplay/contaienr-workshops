FROM node:latest

ENV APP_PORT=3000 APP_DIR=/app

WORKDIR ${APP_DIR}

ADD main.js .
ADD package.json .
ADD package-lock.json .
ADD public public

RUN npm install

HEALTHCHECK --interval=5m --timeout=5s \
	CMD curl -f http://localhost:${APP_PORT} || exit 1

EXPOSE ${APP_PORT}

ENTRYPOINT [ "node", "main.js" ]
