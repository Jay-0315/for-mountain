# Docker Deploy

## 1. Prepare the server

- Install Docker Desktop or Docker Engine
- Copy the project folder to the server PC
- Open a terminal in the project root

## 2. Create `.env`

```bash
cp .env.example .env
```

Fill in at least:

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `ADMIN_INIT_PASSWORD`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_TO`

## 3. Start the stack

```bash
docker compose up -d --build
```

Open port `80` on the server firewall and router.
If you already have a domain, also set `SITE_DOMAIN`, `ACME_EMAIL`, point the DNS A record to the server public IP, and open port `443`.

## 4. Check status

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

## 5. Open the site

- Without domain: `http://SERVER_PUBLIC_IP`
- With domain later: `https://YOUR_DOMAIN`
- Admin: `/admin`

## 6. Update after code changes

```bash
docker compose down
docker compose up -d --build
```

## 7. Backup

Important data is stored in Docker volumes:

- `mysql_data`
- `redis_data`

At minimum, back up the MySQL volume regularly.

## Notes

- Production now uses MySQL, not H2
- `service-categories` default data is seeded on backend startup
- Frontend container is bound to `127.0.0.1:${FRONTEND_PORT}` and exposed publicly through Caddy only
- If `SITE_DOMAIN` is empty, Caddy serves plain HTTP on port `80` for IP-based access
- If `SITE_DOMAIN` is set, Caddy automatically provisions and renews HTTPS certificates for that domain
