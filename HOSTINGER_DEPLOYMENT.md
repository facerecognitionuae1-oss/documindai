# Hostinger Deployment Guide

This app is a Node.js UAEICP employee intelligence workspace. It needs a server runtime, writable file storage, environment variables, and preferably PostgreSQL for production.

## Recommended Hostinger Option

Use a Hostinger VPS or any Hostinger plan that explicitly supports long-running Node.js apps.

Shared static hosting is not enough because this project runs an Express server, handles uploads, stores generated reports/decks, calls AI providers, and keeps user/workspace history.

For this project, Hostinger VPS is the safest choice because it supports:

- Node.js/Express backend
- Multi-file uploads
- Generated reports, PowerPoint decks, and image outputs
- PostgreSQL
- PM2 process management
- Nginx reverse proxy and SSL

## Production Checklist

1. Install Node.js 20 or 22 LTS on the server.
2. Upload or clone this project onto the server.
3. Run dependencies:

```bash
npm ci --omit=dev
```

4. Create a production `.env` file:

```bash
NODE_ENV=production
PORT=3000
SESSION_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
OPENAI_API_KEY=replace-with-your-key
DATABASE_URL=postgres://user:password@host:5432/database
```

5. Start the app with PM2:

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

6. Put Nginx in front of the app and proxy traffic to port `3000`.

Example Nginx server block:

```nginx
server {
  server_name your-domain.com www.your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

7. Enable SSL from Hostinger/hPanel or with Certbot.
8. Configure automated backups for PostgreSQL and uploaded/generated files.

## PowerPoint Generation

Employees can generate `.pptx` files through the agent task panel by selecting `PowerPoint (.pptx)` as the output format, or by using the PowerPoint briefing prompt chip.

For best presentation generation, configure Claude/Anthropic in production:

```bash
ANTHROPIC_API_KEY=replace-with-your-anthropic-key
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

The Studio PowerPoint preset is set up to use Claude when it is configured.

Generated files are saved under:

```text
data/outputs/
```

On production, make sure this folder is backed up or mounted to durable storage.

## Multi-File Uploads

The app supports multi-file upload through the `documents` field and the backend accepts up to 50 files per workspace.

For production, make sure Nginx allows uploads large enough for your use case:

```nginx
client_max_body_size 100M;
```

If employees will upload large batches, increase this limit and confirm the server has enough disk space.

## Database Access

For production multi-user use, PostgreSQL is strongly recommended through `DATABASE_URL`.

If `DATABASE_URL` is not set, the app falls back to local SQLite storage:

```text
data/workspace.db
```

SQLite is fine for local development, but PostgreSQL is safer for a hosted employee-facing system.

## Hostinger Notes

- If using Hostinger VPS, this setup is straightforward with Node.js, PM2, Nginx, and PostgreSQL.
- If using Hostinger shared hosting, confirm that your plan supports Node.js apps before deploying.
- Ollama usually requires a VPS with enough RAM/CPU/GPU. It is not practical on basic shared hosting.
- Never upload your local `.env` with real API keys to public GitHub repositories.

## What Is Needed To Make It Live

To deploy this live, you need:

- Hostinger VPS login or hPanel access
- Domain name or subdomain
- Production `.env` values
- PostgreSQL database credentials
- OpenAI/Anthropic keys if those providers should work online
- Optional Ollama server only if you want local models in production
