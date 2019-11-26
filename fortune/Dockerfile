FROM node:latest

## How an image is build
# Set environment variables
ENV APP_ROOT=/app 
ENV APP_PORT=3000

# create the directory and cd into in
WORKDIR ${APP_ROOT}

# Copy files into the image
# files will be copied into /app
ADD main.js .
ADD package.json .
ADD public public 
ADD views views

# run some command 
RUN npm install

## How an image is provision/run

# what port our container will be exposing
EXPOSE ${APP_PORT}

# add healthcheck to the application
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:${APP_PORT}/health > /dev/null || exit 1

# node main.js 3000
ENTRYPOINT [ "node", "main.js" ]

CMD [ "" ]