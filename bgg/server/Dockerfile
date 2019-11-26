FROM node:latest

ENV APP_PORT=3000 APP_DIR=/app  \
	BGG_DB_HOST='127.0.0.1' BGG_DB_PORT=3306 \
	BGG_DB_USER=root BGG_DB_PASSWORD=changeit

WORKDIR ${APP_DIR}

ADD main.js .
ADD package.json .

ADD bootstrap_public bootstrap_public
ADD bootstrap_views bootstrap_views
ADD lib lib
ADD public public
ADD views views

RUN npm install

HEALTHCHECK --interval=60s --start-period=60s \
	CMD curl -f http://localhost:${APP_PORT}/health || exit 1

EXPOSE ${APP_PORT}

ENTRYPOINT [ "node", "main.js" ]

CMD [ "--html" ]
