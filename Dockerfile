FROM alpine:3.9
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
EXPOSE 80
COPY --from=0 /app/docker_config/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /app/docker_config/supervisord.conf /etc/supervisord.conf
COPY --from=0 /app/backend/server.js /app/server.js
COPY --from=0 /app/www /app

RUN apk add --no-cache nodejs npm supervisor nginx && \
  mkdir -p /run/nginx && \
  npm install express sqlite3

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisord.conf"]
