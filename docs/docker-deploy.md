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

## 4. Check status

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

## 5. Open the site

- Website: `http://SERVER_IP:3000`
- Admin: `http://SERVER_IP:3000/admin`

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
- If port `3000` is already in use, change `FRONTEND_PORT` in `.env`
