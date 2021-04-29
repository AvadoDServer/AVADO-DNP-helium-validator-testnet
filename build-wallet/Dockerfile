FROM ubuntu:20.04

# Import wallet binary, add to PATH
RUN ["mkdir", "-p", "/opt/wallet/bin"]
COPY ["./wallet", "/opt/wallet/bin/wallet"]
ENV PATH="${PATH}:/opt/wallet/bin"

# Create directory to store wallet data in and move there
# so that `-f` needn't be specified all the time
RUN ["mkdir", "-p", "/root/wallet"]
WORKDIR /root/wallet

ENTRYPOINT ["wallet", "--format", "json"]
CMD []
