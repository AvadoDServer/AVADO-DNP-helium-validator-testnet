Automated setup steps:

1. Get latest version of Helium wallet software:
    1. Download from GitHub releases URL, e.g `https://github.com/helium/helium-wallet-rs/releases/download/v1.5.4/helium-wallet-v1.5.4-x86-64-linux.tar.gz`
    2. Extract download
2. Create Docker image from Dockerfile, which:
    1. Derives from image `quay.io/team-helium/validator:latest-val-amd64`
    2. Copies Helium wallet binary to `/opt/wallet/bin/wallet`
    3. Adds `/opt/wallet/bin` to `$PATH`.
3. Run Docker image as daemon (detached/`-d`)
4. Follow documented process for creating wallet and getting testnet funds from faucet:
    1. Run `docker exec -it helium wallet --format json create basic --network testnet > out.json`, interactively choose a wallet passphrase (actually, envvar `HELIUM_WALLET_PASSWORD` allows us to do this non-interactively, see <https://docs.helium.com/mine-hnt/validators/validator-wallet/> and <https://github.com/helium/helium-wallet-rs#environment-variables>) --- NOTE: Should we support `--seed`?
    2. Report wallet address from `out.json` to the user
    3. Automatically submit form at <https://faucet.helium.wtf/>, providing user's wallet address (HOW?)
    4. Watch output of `docker exec helium wallet --format json balance` to check when balance has updated
5. Follow documented process for staking tokens:
    1. Get miner address and stake funds with `docker exec helium wallet validators stake $(docker exec helium miner peer addr | sed -E 's#^/p2p/##') 10000 --commit`, providing password via envvar `HELIUM_WALLET_PASSWORD`
