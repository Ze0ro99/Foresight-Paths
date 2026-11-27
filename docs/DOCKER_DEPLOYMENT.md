# Docker Deployment

This repository is a Next.js application configured for standalone output. The image runs the standalone server as a non-root user.

## Configure

1. Copy `.env.example` to `.env` and fill required values.
2. Keep `PI_NETWORK=Pi Testnet`, `PI_SANDBOX_MODE=true`, and payment, entitlement, and Mainnet approval flags false.
3. Supply `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` at build time when the browser bundle requires them. They are public values.
4. Never put `SUPABASE_SERVICE_ROLE_KEY` or other private credentials in build args, image labels, source control, or any `NEXT_PUBLIC_*` variable.

## Build and run

```sh
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f foresight-paths
```

Open http://localhost:3000. The port is bound to loopback only; use a TLS reverse proxy before exposing it externally.

## Smoke check

```sh
curl -fsS http://localhost:3000/api/health
```

Compose uses `/api/health` as its healthcheck. Verify the route exists and returns 2xx in this revision before relying on container health. This setup does not enable Pi payments, Mainnet, signing, or agent execution.

## Notes

- This branch currently has no package lockfile, so the build uses `npm install`. Add and review a lockfile, then use `npm ci` for reproducible dependency resolution.
- Next.js public environment values are build-time values. Rebuild the image when they change.
- The image tag is local (`foresight-paths:local`). Publish only after CI and the Docker build pass.
