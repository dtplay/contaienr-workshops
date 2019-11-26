FROM node:latest

ENV APP_PORT=3000 APP_DIR=app APP_DEFAULT_CITY='singapore'

WORKDIR ${APP_DIR}

ADD main.js .
ADD package.json .
ADD package-lock.json .
ADD views views

RUN npm install 

HEALTHCHECK --interval=15s --timeout=10s \
	CMD curl -f http://localhost:${APP_PORT}/health || exit 1

EXPOSE ${APP_PORT}

ENTRYPOINT [ "node", "main.js" ]

CMD [ "" ]
