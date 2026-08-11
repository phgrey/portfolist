#!/bin/sh

tailscaled --state=/var/lib/tailscale/tailscaled.state \
  --socket=/var/run/tailscale/tailscaled.sock &

sleep 2
if [ -n "$TAILSCALE_AUTHKEY" ]; then
  tailscale up --authkey="${TAILSCALE_AUTHKEY}" \
    --hostname="portfolist" --accept-routes
fi
tailscale funnel --bg 3000

node dist/server.cjs

