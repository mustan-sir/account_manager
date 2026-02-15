# Infrastructure Notes

- Local runtime uses `docker-compose.yml` at repository root.
- For cloud hosting later, build and publish images from:
  - `apps/api/Dockerfile`
  - `apps/web/Dockerfile`
- Use managed Postgres and set `DATABASE_URL` accordingly.
