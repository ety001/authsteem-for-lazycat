FROM alpine:3.9 as stage
ARG TAG=master
RUN apk add --no-cache nodejs npm git python make g++
WORKDIR /app
ADD . /app
RUN cd /app && \
  git checkout ${TAG} && \
  npm install && \
  npm run build

FROM alpine:3.9

WORKDIR /app
RUN apk add --no-cache nodejs npm && \
  npm install express frameguard serve-static body-parser sqlite3 && \
  mkdir -p /app/db

COPY --from=stage /app/www /app/www
COPY --from=stage /app/start.js /app/start.js

EXPOSE 5000
CMD ["node", "./start.js"]