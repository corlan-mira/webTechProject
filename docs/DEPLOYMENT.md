 Deployment Guide

Production deployment guide for the Event Attendance Monitoring System.

---

 Pre-Deployment Checklist

 Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] No console.log() in production code
- [ ] No hardcoded credentials
- [ ] Error handling implemented

 Security
- [ ] JWT secret changed from default (min  characters)
- [ ] Database password changed
- [ ] CORS origins configured correctly
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Sequelize ORM)
- [ ] Password hashing (bcrypt + rounds)

 Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Database schema documented
- [ ] Environment variables documented
- [ ] Deployment instructions written

 Testing
- [ ] Backend API tested with Postman/Thunder Client
- [ ] Frontend builds without errors
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness checked
- [ ] Error scenarios tested

 Database
- [ ] Migrations tested on staging
- [ ] Database backups configured
- [ ] Rollback plan documented
- [ ] Indices created for performance

---

 Deployment Options

 Option : Traditional Server (VPS)

Best for: Full control, custom requirements

 Requirements
- Linux VPS (Ubuntu .+ recommended)
- SSH access
- + CPU cores, + GB RAM

 Steps

. Setup Server
```bash
 SSH into server
ssh user@your_server_ip

 Update system
sudo apt update && sudo apt upgrade -y

 Install Node.js
curl -sL https://deb.nodesource.com/setup_.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib

 Install PM (process manager)
sudo npm install -g pm
```

. Clone Repository
```bash
 Clone repo
git clone https://github.com/your-org/event-attendance-system.git
cd event-attendance-system

 Install dependencies
cd backend
npm install
cd ../frontend
npm install
cd ..
```

. Configure Environment
```bash
 Backend configuration
nano backend/.env

 Set:
 NODE_ENV=production
 PORT=
 DATABASE_URL=postgres://user:pass@localhost:/db
 JWT_SECRET=your_super_secret_key_min__chars
 CORS_ORIGIN=https://yourdomain.com
```

. Setup Database
```bash
cd backend

 Create database user
sudo -u postgres psql << EOF
CREATE DATABASE event_attendance_system;
CREATE USER event_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE event_attendance_system TO event_user;
EOF

 Run migrations
npm run migrate
```

. Build Frontend
```bash
cd frontend

 Build production bundle
npm run build

 Output in ./build/
```

. Configure Nginx Reverse Proxy
```bash
 Install Nginx
sudo apt install -y nginx

 Create config
sudo nano /etc/nginx/sites-available/event-app

 Add configuration:
server {
    listen ;
    server_name yourdomain.com;

     Frontend
    location / {
        root /path/to/frontend/build;
        try_files $uri /index.html;
    }

     Backend API
    location /api/ {
        proxy_pass http://localhost:;
        proxy_http_version .;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

 Enable site
sudo ln -s /etc/nginx/sites-available/event-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

. Setup SSL with Let's Encrypt
```bash
 Install Certbot
sudo apt install -y certbot python-certbot-nginx

 Get certificate
sudo certbot certonly --nginx -d yourdomain.com

 Auto-renewal
sudo systemctl enable certbot.timer
```

. Start Backend with PM
```bash
cd backend

 Start application
pm start server.js --name "event-api"

 Configure auto-start
pm startup
pm save

 Monitor logs
pm logs event-api
```

---

 Option : Heroku (PaaS)

Best for: Quick deployment, minimal DevOps

 Requirements
- Heroku account (free or paid)
- Heroku CLI installed
- Git repository

 Steps

. Install Heroku CLI
```bash
 macOS
brew tap heroku/brew && brew install heroku

 Ubuntu/Linux
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

 Windows
choco install heroku-cli
```

. Login & Create Apps
```bash
 Login to Heroku
heroku login

 Create backend app
heroku create event-api-backend

 Create frontend app
heroku create event-app-frontend
```

. Configure Backend
```bash
cd backend

 Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key
heroku config:set CORS_ORIGIN=https://event-app-frontend.herokuapp.com

 Add PostgreSQL database
heroku addons:create heroku-postgresql:hobby-dev

 Create Procfile
echo "web: node server.js" > Procfile

 Create package.json at root if needed
```

. Deploy Backend
```bash
 Deploy to Heroku
git push heroku main

 Run migrations
heroku run npm run migrate

 View logs
heroku logs --tail
```

. Deploy Frontend
```bash
cd frontend

 Set API endpoint
heroku config:set REACT_APP_API_BASE_URL=https://event-api-backend.herokuapp.com/api

 Build and deploy
npm run build
 Deploy build folder to event-app-frontend
```

---

 Option : Docker & Container Registry

Best for: Containerized deployment, cloud platforms (AWS, GCP, Azure)

 Dockerfile Example

backend/Dockerfile:
```dockerfile
FROM node:-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --only=production

COPY . .

EXPOSE 

CMD ["node", "server.js"]
```

frontend/Dockerfile:
```dockerfile
FROM node:-alpine AS build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 

CMD ["nginx", "-g", "daemon off;"]
```

Build & Run:
```bash
 Build images
docker build -f backend/Dockerfile -t event-api:latest backend/
docker build -f frontend/Dockerfile -t event-app:latest frontend/

 Run containers
docker run -e DATABASE_URL=postgres://... -p : event-api:latest
docker run -p : event-app:latest
```

Push to Registry:
```bash
 AWS ECR
aws ecr get-login-password --region us-east- | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-.amazonaws.com
docker tag event-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-.amazonaws.com/event-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-.amazonaws.com/event-api:latest
```

---

 Option : AWS Elastic Beanstalk

Best for: AWS-native deployment with auto-scaling

```bash
 Install EB CLI
pip install awsebcli

 Initialize Elastic Beanstalk
eb init

 Create environment
eb create event-app-prod

 Deploy
eb deploy

 View logs
eb logs

 Monitor
eb open
```

---

 Post-Deployment

 Database Backups

PostgreSQL Backup Schedule:
```bash
 Daily backup script (cron)
     pg_dump -U event_user event_attendance_system | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

 Or use Heroku automated backups
heroku pg:backups:schedule DATABASE_URL --at ": UTC"
```

 Monitoring & Logging

Application Monitoring:
- Setup error tracking: Sentry or Rollbar
- Monitor performance: New Relic or Datadog
- Log aggregation: ELK Stack or LogRocket

Example: Sentry Integration
```bash
npm install @sentry/node @sentry/tracing
```

```javascript
// backend/server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: .,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

 Health Checks

Implement health endpoint:
```javascript
// GET /api/health
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: "connected"
  });
});
```

Monitor with cron:
```bash
 Check every  minutes
/     curl -f http://yourdomain.com/api/health || alert
```

 Database Maintenance

Regular maintenance:
```sql
-- PostgreSQL vacuum
VACUUM ANALYZE;

-- Rebuild indices
REINDEX DATABASE event_attendance_system;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

 Performance Optimization

 Frontend Optimization
```bash
 Check bundle size
npm run build
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer build/stats.json
```

Optimization tips:
- Code splitting by route
- Lazy load components
- Compress images
- Enable gzip compression

 Backend Optimization
```bash
 Monitor memory/CPU
pm monit

 Enable clustering (Phase )
const cluster = require('cluster');
if (cluster.isMaster) {
  for (let i = ; i < numCPUs; i++) {
    cluster.fork();
  }
}
```

 Database Optimization
- Ensure all indices are created
- Monitor slow queries
- Regular VACUUM/ANALYZE

---

 SSL/TLS Certificate

 Using Let's Encrypt (Free)

```bash
 Certbot with automatic renewal
sudo certbot certonly --standalone -d yourdomain.com

 Configure Nginx to use certificate
server {
    listen  ssl http;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
}
```

---

 Rollback Plan

If deployment fails:

```bash
 Option : Revert to previous commit
git revert <commit-hash>
git push heroku main

 Option : Restore from backup
psql event_attendance_system < /backups/db_.sql.gz

 Option : Blue-green deployment (Phase )
 Maintain two identical production environments
 Switch traffic between them
```

---

 Environment Variables

 Production Settings
```env
 Node
NODE_ENV=production
PORT=

 Database
DB_DIALECT=postgres
DB_HOST=prod-database.example.com
DB_PORT=
DB_USERNAME=prod_user
DB_PASSWORD=VERY_SECURE_PASSWORD_MIN__CHARS
DB_NAME=event_attendance_system
DB_POOL_MIN=
DB_POOL_MAX=

 Security
JWT_SECRET=SUPER_SECRET_MIN__CHARACTERS_LONG
JWT_EXPIRY=h
BCRYPT_ROUNDS=

 API
CORS_ORIGIN=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com

 External Services
QR_API_BASE_URL=https://api.qrserver.com/v

 Monitoring
SENTRY_DSN=https://your-sentry-key@sentry.io/project-id
LOG_LEVEL=info
```

---

 Maintenance Windows

Plan maintenance during low-traffic times:

```bash
 Display maintenance page
 Update all dependencies with testing
npm update

 Run full test suite
npm test

 Deploy to staging first
 Verify before production deployment

 Deploy to production
git push heroku main

 Monitor for issues
heroku logs --tail
```

---

 Disaster Recovery

Data Loss Prevention:
.  Daily automated backups
.  Weekly backup verification
.  Cross-region backup copies
.  Documented recovery procedures
.  RPO:  hours
.  RTO:  hours

---

 Scaling (Phase )

Horizontal Scaling:
- Load balancer (NGINX, AWS ALB)
- Multiple backend instances
- Database read replicas
- Redis caching layer

Vertical Scaling:
- Increase server resources
- Optimize database queries
- Implement pagination limits

---

 Compliance & Security

 Data Protection
- [ ] Database encryption at rest
- [ ] TLS/SSL for data in transit
- [ ] Regular security audits
- [ ] GDPR compliance (if EU users)
- [ ] Data retention policies

 Access Control
- [ ] SSH key-based authentication
- [ ] Role-based database access
- [ ] Audit logging
- [ ] Regular credential rotation

---

 Troubleshooting

 Application Won't Start
```bash
 Check logs
npm run dev   See detailed error
heroku logs --tail
pm logs event-api

 Verify environment variables
echo $DATABASE_URL
echo $JWT_SECRET
```

 Database Connection Failed
```bash
 Test connection
psql -h prod-db-host -U username -d dbname

 Check credentials in .env
 Verify database is running and accessible
 Check network security groups/firewall
```

 Performance Issues
```bash
 Check slow queries
EXPLAIN ANALYZE SELECT ...;

 Monitor system resources
top
free -h
df -h

 Check Node.js memory
node --max-old-space-size= server.js
```

---

 Support & Escalation

For deployment issues:
. Check logs: `heroku logs --tail` or `pm logs`
. Review error messages carefully
. Check documentation: docs/DEPLOYMENT.md
. Contact platform support if needed

---

For setup instructions, see [SETUP.md](./SETUP.md)  
For API documentation, see [API.md](./API.md)  
For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
