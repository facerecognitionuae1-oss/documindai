#!/usr/bin/env bash
set -euo pipefail

DOMAIN="documindai.tech"
APP_NAME="documindai"
APP_DIR="/var/www/${APP_NAME}"
DB_NAME="documindai"
DB_USER="documindai_user"
NODE_MAJOR="22"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run this as root on your Hostinger VPS."
  exit 1
fi

echo ""
echo "DocuMind AI Hostinger installer"
echo "Domain: ${DOMAIN}"
echo ""

read -r -p "Admin email [admin@documindai.tech]: " ADMIN_EMAIL
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@documindai.tech}"

read -r -s -p "Admin password: " ADMIN_PASSWORD
echo ""
if [ -z "${ADMIN_PASSWORD}" ]; then
  echo "Admin password is required."
  exit 1
fi

read -r -s -p "OpenAI API key: " OPENAI_API_KEY
echo ""
if [ -z "${OPENAI_API_KEY}" ]; then
  echo "OpenAI API key is required."
  exit 1
fi

DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)"
SESSION_SECRET="$(openssl rand -base64 48 | tr -d '\n')"

echo ""
echo "Installing system packages..."
apt-get update
apt-get install -y curl unzip nginx postgresql postgresql-contrib certbot python3-certbot-nginx openssl

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js ${NODE_MAJOR}..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "Creating PostgreSQL database..."
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\\gexec
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

sudo -u postgres psql -d "${DB_NAME}" <<SQL
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER SCHEMA public OWNER TO ${DB_USER};
SQL

cd "${APP_DIR}"

echo "Writing production .env..."
cat > .env <<ENV
NODE_ENV=production
PORT=3000
LLM_PROVIDER=openai
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_MODEL=gpt-5.5
OPENAI_IMAGE_MODEL=gpt-image-1
ANTHROPIC_API_KEY=
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL=claude-sonnet-4-20250514
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
SESSION_SECRET=${SESSION_SECRET}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENV

echo "Installing app dependencies..."
npm ci --omit=dev

echo "Starting app with PM2..."
pm2 delete "${APP_NAME}" >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs --name "${APP_NAME}"
pm2 save
pm2 startup systemd -u root --hp /root >/tmp/pm2-startup.txt || true
bash /tmp/pm2-startup.txt >/dev/null 2>&1 || true

echo "Configuring Nginx..."
cat > "/etc/nginx/sites-available/${APP_NAME}" <<NGINX
server {
  listen 80;
  server_name ${DOMAIN} www.${DOMAIN};

  client_max_body_size 100M;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX

ln -sf "/etc/nginx/sites-available/${APP_NAME}" "/etc/nginx/sites-enabled/${APP_NAME}"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo ""
echo "Trying to install SSL. This only works after your domain DNS points to this VPS."
if certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "${ADMIN_EMAIL}" --redirect; then
  echo "SSL installed."
else
  echo "SSL did not install yet. Point DNS to this VPS, then run:"
  echo "certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
fi

echo ""
echo "Deployment complete."
echo "Open: https://${DOMAIN}"
echo "If SSL is not ready yet, try: http://${DOMAIN}"
