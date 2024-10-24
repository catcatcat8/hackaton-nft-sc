# Backend

## Getting started

Install the required dependencies

```
yarn
```

Download SSL certificates

Linux (Bash)/macOS (Zsh):

```bash
mkdir -p ~/.mongodb && \
wget "https://storage.yandexcloud.net/cloud-certs/CA.pem" \
     --output-document ~/.mongodb/root.crt && \
chmod 0644 ~/.mongodb/root.crt
```

Windows (Powershell):

```powershell
mkdir $HOME\.mongodb; curl.exe -o $HOME\.mongodb\root.crt https://storage.yandexcloud.net/cloud-certs/CA.pem
```

Fill in the `.env` (the real ones will be attached to the disk):

```
PINATA_JWT=
GATEWAY_URL=

DB_USER=
DB_PASS=
DB_HOSTS=
DB_HOME=
```

Launch the backend locally:

```bash
yarn start
```
