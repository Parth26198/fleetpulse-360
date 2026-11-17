# FLEETPULSE 360 — Production Deployment & Operations Guide

**Application:** FLEETPULSE 360 Enterprise Fleet Management Platform  
**Target Environments:** Ubuntu 22.04 / 24.04 LTS | Debian 12 | Windows Server 2022  
**Database Engines:** MySQL 8.0 (Production) | SQLite (Development / Staging)  
**Process Manager:** PM2 Cluster Mode / Docker Compose  
**Reverse Proxy:** Nginx with SSL (Let's Encrypt)  

---

## 1. Production Architecture Overview

```
                      HTTPS (Port 443)
                             │
                             ▼
                    ┌─────────────────┐
                    │      Nginx      │
                    │  Reverse Proxy  │
                    └────────┬────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   ┌─────────────────┐               ┌─────────────────┐
   │ React 18 SPA    │               │ Express REST    │
   │ Static Assets   │               │ (PM2 Cluster)   │
   │ /var/www/dist   │               │ http://127.0.0.1:5000
   └─────────────────┘               └────────┬────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │ MySQL 8.0 RDBMS │
                                     │ utf8mb4 / InnoDB│
                                     └─────────────────┘
```

---

## 2. Environment Variables Reference Guide

Configure your production environment variables in `backend/.env`.

| Variable | Required | Default | Production Value Example | Description |
|---|---|---|---|---|
| `PORT` | Yes | `5000` | `5000` | Local port for Express API service. |
| `NODE_ENV` | Yes | `development` | `production` | Enables performance optimizations, disables verbose stack traces. |
| `DATABASE_URL` | Yes | `file:./dev.db` | `mysql://app_user:StrongPass99!@127.0.0.1:3306/fleetpulse360` | Connection string for MySQL 8 instance. |
| `JWT_SECRET` | Yes | - | `a8f9c2d7e4b10...` (64+ char random hex) | High-entropy cryptographic key for HMAC SHA-256 JWT signing. |
| `JWT_EXPIRES_IN`| No | `7d` | `24h` or `7d` | Lifetime of issued authentication tokens. |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | `https://fleetpulse360.yourdomain.com` | Allowed CORS origin for browser requests. |

---

## 3. Database Migration: SQLite to MySQL 8

FLEETPULSE 360 includes a dual-schema configuration:
- Local development schema: `backend/prisma/schema.prisma` (SQLite)
- Production enterprise schema: `backend/prisma/schema.mysql.prisma` (MySQL 8 with native enums and indexing)

### Step 3.1: Create MySQL Database & Dedicated User
Log in to your MySQL 8 instance:
```sql
CREATE DATABASE fleetpulse360 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'fleet_app'@'127.0.0.1' IDENTIFIED BY 'YourSecurePasswordHere123!';
GRANT ALL PRIVILEGES ON fleetpulse360.* TO 'fleet_app'@'127.0.0.1';
FLUSH PRIVILEGES;
```

### Step 3.2: Configure Production `.env`
Update `backend/.env`:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="mysql://fleet_app:YourSecurePasswordHere123!@127.0.0.1:3306/fleetpulse360"
JWT_SECRET="generate-a-64-character-cryptographic-hash-here"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="https://fleetpulse360.yourdomain.com"
```

### Step 3.3: Deploy Schema to MySQL
Execute Prisma DB Push targeting the MySQL schema:
```powershell
# Windows
node ./node_modules/prisma/build/index.js db push --schema=./prisma/schema.mysql.prisma

# Linux / macOS
npx prisma db push --schema=./prisma/schema.mysql.prisma
```

### Step 3.4: Seed Initial Enterprise Data
Populate vehicles, attendance, payroll, expenses, and client rate cards:
```powershell
# Windows
node ./node_modules/ts-node/dist/bin.js prisma/seed.ts

# Linux / macOS
npx ts-node prisma/seed.ts
```

---

## 4. Step-by-Step Linux / Ubuntu Host Deployment

### Step 4.1: Install Dependencies
```bash
# Update repositories
sudo apt update && sudo apt upgrade -y

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs mysql-server nginx git

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### Step 4.2: Build Backend Application
```bash
cd /var/www/fleetpulse360/backend
npm ci --omit=dev
npm run build
```

### Step 4.3: Build Frontend Application
```bash
cd /var/www/fleetpulse360/frontend
npm ci
npm run build
# Output directory: /var/www/fleetpulse360/frontend/dist
```

### Step 4.4: Configure PM2 Process Manager
Create `/var/www/fleetpulse360/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'fleetpulse-api',
      script: './backend/dist/src/server.js',
      instances: 'max', // Multi-core cluster mode
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      exp_backoff_restart_delay: 100,
      max_memory_restart: '1G'
    }
  ]
};
```

Launch with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 4.5: Configure Nginx Reverse Proxy & SSL
Create `/etc/nginx/sites-available/fleetpulse360`:
```nginx
server {
    listen 80;
    server_name fleetpulse360.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fleetpulse360.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/fleetpulse360.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fleetpulse360.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend Static SPA
    root /var/www/fleetpulse360/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

Enable site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/fleetpulse360 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Dockerized Deployment (Optional Alternative)

For orchestrated environments (AWS ECS, GCP Cloud Run, DigitalOcean Kubernetes), use the following Docker configurations.

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_DATABASE: fleetpulse360
      MYSQL_ROOT_PASSWORD: RootPassword99!
      MYSQL_USER: fleet_user
      MYSQL_PASSWORD: UserPassword99!
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: "mysql://fleet_user:UserPassword99!@db:3306/fleetpulse360"
      JWT_SECRET: "strong-secret-production-key"
      FRONTEND_URL: "http://localhost"
    depends_on:
      - db
    ports:
      - "5000:5000"

  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  mysql_data:
```

---

## 6. Backup, Healthcheck & Disaster Recovery

### 6.1 Automated Daily Database Backup
Add a cron job under `/etc/cron.daily/fleetpulse-backup`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/fleetpulse360"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

mysqldump -u fleet_app -p'YourSecurePasswordHere123!' --single-transaction --quick fleetpulse360 | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Retain last 30 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete
```

### 6.2 Healthcheck & Synthetic Monitoring
Configure your monitoring tool (e.g., Uptime Kuma, Datadog, Prometheus) to poll the health endpoint:
- **Endpoint:** `GET https://fleetpulse360.yourdomain.com/api/health`
- **Expected Status:** `HTTP 200 OK`
- **Expected Payload:**
  ```json
  {
    "status": "ONLINE",
    "service": "FLEETPULSE 360 Enterprise API",
    "version": "1.0.0",
    "timestamp": "2026-11-16T..."
  }
  ```
