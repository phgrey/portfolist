#!/bin/sh

# # # gcloud+tailscale needed
tailscaled --state=/var/lib/tailscale/tailscaled.state \
  --tun=userspace-networking \
  --socket=/var/run/tailscale/tailscaled.sock &

sleep 2
if [ -n "$TAILSCALE_AUTHKEY" ]; then
  tailscale up --authkey="${TAILSCALE_AUTHKEY}" \
    --hostname="portfolist" --accept-routes
fi
tailscale funnel --bg $PORT

node dist/server.cjs

