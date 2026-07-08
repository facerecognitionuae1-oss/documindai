# Easy Hostinger Deployment For DocuMind AI

This guide is for your exact setup:

```text
Domain: documindai.tech
AI provider: OpenAI
GitHub: not required
```

## Step 1: Buy Hostinger VPS

Use a Hostinger VPS with Ubuntu.

Recommended:

```text
2 GB RAM minimum
4 GB RAM better
Ubuntu OS
```

Hostinger will give you:

```text
VPS IP address
root password
```

## Step 2: Point The Domain To The VPS

In Hostinger DNS for `documindai.tech`, set:

```text
A record: @    -> YOUR_SERVER_IP
A record: www  -> YOUR_SERVER_IP
```

## Step 3: Upload The Project From Your PC

Open PowerShell in this project folder.

Replace `YOUR_SERVER_IP` with the Hostinger VPS IP:

```powershell
ssh root@YOUR_SERVER_IP "mkdir -p /var/www/documindai"
scp server.js package.json package-lock.json ecosystem.config.cjs extract_local_text.py requirements.txt .env.example root@YOUR_SERVER_IP:/var/www/documindai/
scp -r public deploy root@YOUR_SERVER_IP:/var/www/documindai/
```

That uploads only the files needed for production.

It does not upload:

```text
.env
node_modules
data
local uploaded files
local API keys
```

## Step 4: Run The Installer On Hostinger

SSH into the VPS:

```powershell
ssh root@YOUR_SERVER_IP
```

Then run:

```bash
cd /var/www/documindai
chmod +x deploy/hostinger-install.sh
bash deploy/hostinger-install.sh
```

The installer asks for:

```text
Admin email
Admin password
OpenAI API key
```

Then it automatically installs and configures:

```text
Node.js
PostgreSQL
Nginx
PM2
SSL certificate
Production .env file
DocuMind AI app
```

## Step 5: Open The Website

After install:

```text
https://documindai.tech
```

If SSL is not ready yet:

```text
http://documindai.tech
```

## If SSL Fails

Wait 10-30 minutes for DNS to update, then run this on the VPS:

```bash
certbot --nginx -d documindai.tech -d www.documindai.tech
```

## Updating The App Later

From your PC, upload the changed files again:

```powershell
scp server.js package.json package-lock.json ecosystem.config.cjs extract_local_text.py requirements.txt .env.example root@YOUR_SERVER_IP:/var/www/documindai/
scp -r public deploy root@YOUR_SERVER_IP:/var/www/documindai/
```

Then restart on the VPS:

```bash
cd /var/www/documindai
npm ci --omit=dev
pm2 restart documindai
```

