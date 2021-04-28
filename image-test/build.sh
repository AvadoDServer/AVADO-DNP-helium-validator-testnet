#!/bin/bash
version="1.5.4"

dirname="helium-wallet-v$version-x86-64-linux"
tarname="$dirname.tar.gz"

curl -LO "https://github.com/helium/helium-wallet-rs/releases/download/v$version/$tarname"
tar xvf "$tarname"
cp "$dirname/helium-wallet" ./wallet

docker build -t "avado-helium:$version" .
