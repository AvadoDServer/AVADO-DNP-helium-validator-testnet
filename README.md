Automated setup steps:

1. Get latest version of Helium wallet software:
    1. Download from GitHub releases URL, e.g `https://github.com/helium/helium-wallet-rs/releases/download/v1.5.4/helium-wallet-v1.5.4-x86-64-linux.tar.gz`
    2. Extract download
2. Create Docker image from Dockerfile, which:
    1. Derives from image `quay.io/team-helium/validator:latest-val-amd64`
    2. Copies Helium wallet binary to `/opt/wallet/bin/wallet`
    3. Adds `/opt/wallet/bin` to `$PATH`.
    4. Installs `libc6-compat` and symlinks `/lib/ld-linux-x86-64.so.2` to `/lib/libc.musl-x86_64.so.1` (see <https://dustri.org/b/error-loading-shared-library-ld-linux-x86-64so2-on-alpine-linux.html>)
3. Run miner image as daemon (detached/`-d`)
4. Follow documented process for creating wallet and getting testnet funds from faucet:
    1. Run `wallet create basic --network testnet`, interactively choose a wallet passphrase (actually, envvar `HELIUM_WALLET_PASSWORD` allows us to do this non-interactively, see <https://docs.helium.com/mine-hnt/validators/validator-wallet/> and <https://github.com/helium/helium-wallet-rs#environment-variables>) --- NOTE: Should we support `--seed`?
    2. Report wallet address from output to the user
    3. Tell user to submit form at <https://faucet.helium.wtf/>, providing their wallet address
    4. Watch output of `wallet balance` to check when balance has updated
5. Follow documented process for staking tokens:
    1. Get miner address and stake funds with `wallet validators stake $(miner peer addr | sed -E 's#^/p2p/##') 10000 --commit`, providing password via envvar `HELIUM_WALLET_PASSWORD`

Caveats:

- [Alpine's glibc](https://github.com/sgerrand/alpine-pkg-glibc) (v2.33) doesn't support certain symbols needed by Helium wallet (v1.5.4), so we currently deploy the wallet in a separate container based on Ubuntu rather than Alpine. We don't need to install nay other dependencies in Ubuntu.
