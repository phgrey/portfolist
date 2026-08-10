#!/bin/sh

# 1. Start Tailscale daemon in userspace mode
/app/tailscaled --tunedev=socks5 --socket=/var/run/tailscale/tailscaled.sock &

# 2. Wait briefly and log in using your injected Auth Key env variable
/app/tailscale --socket=/var/run/tailscale/tailscaled.sock up \
  --authkey="${TAILSCALE_AUTHKEY}" \
  --hostname="firebase-node-app"

/app/tailscale serve 3000 \
  --service=svc:portfolist \
  --authkey="${TAILSCALE_AUTHKEY}"

# 3. Boot your native Node.js application
node dist/server.cjs
