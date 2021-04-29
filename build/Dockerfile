# Final image --- Helium miner/validator with REST wizard
FROM quay.io/team-helium/validator:latest-val-amd64

RUN apk add npm supervisor

RUN mkdir -p /app/monitor
WORKDIR /app/monitor
COPY monitor/package.json ./
COPY monitor/server.js ./
RUN npm i --production

COPY files/supervisord.conf /app/
ENTRYPOINT supervisord -n -c /app/supervisord.conf

