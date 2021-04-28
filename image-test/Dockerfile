FROM quay.io/team-helium/validator:latest-val-amd64 as build

# Import wallet binary, add to PATH
RUN ["mkdir", "-p", "/opt/wallet/bin"]
COPY ["./wallet", "/opt/wallet/bin/wallet"]
ENV PATH="${PATH}:/opt/wallet/bin"

# Entrypoint and default arguments borrowed from base image
