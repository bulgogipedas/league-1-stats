# Liga 1 Analytics Backend

This backend keeps the React dashboard as a Vite app and adds a PostgreSQL data service.

## Start PostgreSQL

```bash
podman compose -f infra/podman-compose.yml up -d
```

PostgreSQL runs on `127.0.0.1:54329`.

## Seed the database

```bash
npm run preprocess
bun backend/seed.js
```

The seed script loads generated JSON from `public/data` into normalized tables:

- `teams`
- `standings`
- `matches`
- `players`
- `formations`
- `team_metrics`
- `league_summary`

It also creates views:

- `team_season_summary`
- `player_comparison_base`

## Start the API

```bash
bun backend/server.js
```

The API runs on `http://127.0.0.1:8787`.

Core endpoints:

- `GET /api/health`
- `GET /api/bootstrap`
- `GET /api/standings`
- `GET /api/players?limit=200`
- `GET /api/teams/:slug`
- `GET /api/teams/:slug/matches`
- `GET /api/teams/:slug/formations`

The frontend tries `VITE_API_BASE_URL` first and falls back to static JSON if the backend is offline.
