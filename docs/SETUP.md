# Setup & Installation Guide

## System Requirements

### Minimum Requirements
- **Node.js:** v18.0.0 or later (LTS)
- **npm:** v9.0.0 or yarn 3.6.0+
- **Database:** PostgreSQL 12+ or MySQL 8+
- **RAM:** 2 GB minimum
- **Disk Space:** 500 MB minimum
- **Git:** v2.25.0 or later

### Recommended
- **Node.js:** v20.x LTS or latest stable
- **PostgreSQL:** 15+ (recommended over MySQL for Sequelize)
- **RAM:** 4 GB for comfortable development
- **IDE:** Visual Studio Code with extensions

---

## Prerequisites Installation

### macOS

#### Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Install Node.js
```bash
brew install node
```

#### Install PostgreSQL
```bash
brew install postgresql@15
brew services start postgresql@15

# Create initial databases (optional)
createdb event_attendance_system
```

#### Verify Installation
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
psql --version    # Should be 15+
```

### Ubuntu/Debian

```bash
# Update package manager
sudo apt update

# Install Node.js (using NodeSource repository)
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify Installation
node --version
npm --version
psql --version
```

### Windows

#### Using Chocolatey (recommended)
```powershell
# Install Chocolatey if not installed
# Run PowerShell as Administrator, then:

# Install Node.js
choco install nodejs

# Install PostgreSQL
choco install postgresql

# Verify Installation
node --version
npm --version
psql --version
```

#### Manual Installation
1. **Node.js:** Download from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)
3. Follow installer wizards
4. Add to PATH if necessary

---

## Project Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/event-attendance-system.git
cd event-attendance-system

# Verify you're on the correct branch
git branch -a
git checkout develop  # or main for production
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# nano .env  (on macOS/Linux)
# code .env  (open in VS Code)
```

#### .env Configuration

```env
# Environment
NODE_ENV=development

# Server
PORT=5000
HOST=localhost

# Database Configuration
DB_DIALECT=postgres          # postgres or mysql
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=event_attendance_system

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_at_least_32_characters
JWT_EXPIRY=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# External APIs
QR_API_BASE_URL=https://api.qrserver.com/v1

# Logging
LOG_LEVEL=debug
```

#### Database Setup

**Using PostgreSQL:**
```bash
# Connect as postgres user
psql -U postgres

# Inside psql:
CREATE DATABASE event_attendance_system;
CREATE USER event_user WITH PASSWORD 'secure_password';
ALTER USER event_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE event_attendance_system TO event_user;
\q

# Update .env with credentials:
# DB_USERNAME=event_user
# DB_PASSWORD=secure_password
```

**Using MySQL:**
```bash
# Connect to MySQL
mysql -u root -p

# Inside MySQL:
CREATE DATABASE event_attendance_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'event_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON event_attendance_system.* TO 'event_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Update .env:
# DB_DIALECT=mysql
# DB_USERNAME=event_user
# DB_PASSWORD=secure_password
# DB_PORT=3306
```

#### Run Migrations

```bash
# Run all pending migrations
npm run migrate

# Verify database schema
# PostgreSQL:
psql -U postgres -d event_attendance_system -c "\dt"

# MySQL:
mysql -u root -p event_attendance_system -e "SHOW TABLES;"
```

#### Start Backend

```bash
# Development mode (with nodemon auto-reload)
npm run dev

# Or production mode
npm start

# You should see:
# Server running on http://localhost:5000
# Database connected successfully
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env
```

#### .env Configuration

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Feature Flags
REACT_APP_ENABLE_QR_SCANNING=true
REACT_APP_DEBUG_MODE=true
```

#### Start Frontend

```bash
# Development mode
npm start

# Frontend should open automatically at http://localhost:3000
# If not, manually navigate to it

# You should see:
# Compiled successfully!
# On http://localhost:3000
```

---

## Project Structure Verification

After setup, verify the directory structure:

```
event-attendance-system/
├── backend/
│   ├── config/              ✓ Configuration files
│   ├── controllers/         ✓ API controllers
│   ├── models/              ✓ Sequelize models
│   ├── routes/              ✓ API routes
│   ├── middleware/          ✓ Express middleware
│   ├── services/            ✓ Business logic
│   ├── utils/               ✓ Helper functions
│   ├── migrations/          ✓ Database migrations
│   ├── node_modules/        ✓ Dependencies
│   ├── .env                 ✓ Environment config
│   ├── package.json         ✓ Dependencies manifest
│   └── server.js            ✓ Entry point
├── frontend/
│   ├── src/
│   │   ├── components/      ✓ React components
│   │   ├── pages/           ✓ Page components
│   │   ├── services/        ✓ API layer
│   │   ├── hooks/           ✓ Custom hooks
│   │   └── App.jsx          ✓ Main app
│   ├── node_modules/        ✓ Dependencies
│   ├── .env                 ✓ Environment config
│   └── package.json         ✓ Dependencies manifest
├── docs/
│   ├── ARCHITECTURE.md      ✓ Architecture
│   ├── API.md               ✓ API docs
│   ├── DATABASE_SCHEMA.md   ✓ Schema
│   └── DEPLOYMENT.md        ✓ Deployment guide
├── README.md                ✓ Project README
└── PHASE_1_SPECIFICATION.md ✓ Specification
```

---

## Verification Tests

### 1. Backend Health Check

```bash
cd backend

# Health check endpoint (should return 200 OK)
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-11-16T10:00:00Z"
# }
```

### 2. Database Connection

```bash
# Check database is responding
npm run db:test

# Expected output:
# Database connection successful!
# Tables created: users, event_groups, events, check_ins
```

### 3. API Endpoint Test

```bash
cd backend

# Run API tests (if available)
npm test

# Expected output:
# ✓ Authentication endpoints
# ✓ Event management endpoints
# ✓ Check-in endpoints
# ✓ Export endpoints
```

### 4. Frontend Build Test

```bash
cd frontend

# Build production bundle
npm run build

# Expected output:
# Build complete!
# Output: ./build/
# Size: ~200KB gzipped
```

---

## Development Workflow

### Starting Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start

# Terminal 3: Database management (optional)
# For PostgreSQL monitoring:
pgAdmin 4 (GUI) or psql CLI
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/TASK-ID-description

# Make changes
# ...

# Commit with message
git add .
git commit -m "feat(scope): description"

# Push to GitHub
git push origin feature/TASK-ID-description

# Create Pull Request on GitHub
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# All tests with coverage
npm run test:coverage
```

### Code Formatting

```bash
# Backend
cd backend
npm run lint      # Check for issues
npm run format    # Auto-format code

# Frontend
cd frontend
npm run lint
npm run format
```

---

## Common Setup Issues

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
# macOS/Linux:
lsof -i :5000

# Kill the process:
kill -9 <PID>

# Or use different port in .env:
PORT=5001
```

### Issue: "Database connection failed"

**Troubleshooting:**
```bash
# 1. Verify database is running
# PostgreSQL:
pg_isready -h localhost -p 5432

# MySQL:
mysql -u root -p -e "SELECT 1"

# 2. Check credentials in .env
cat backend/.env | grep DB_

# 3. Verify database exists
# PostgreSQL:
psql -l | grep event_attendance

# MySQL:
mysql -u root -p -e "SHOW DATABASES;"

# 4. Run migrations again
npm run migrate
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For global issues
npm cache clean --force
npm install -g npm@latest
```

### Issue: "CORS errors" in browser console

**Solution:**
```bash
# Update .env CORS_ORIGIN to match frontend URL
CORS_ORIGIN=http://localhost:3000

# Restart backend
npm run dev
```

### Issue: "JWT token expired" immediately

**Solution:**
```bash
# Check JWT_EXPIRY format in .env
JWT_EXPIRY=24h        # Valid
JWT_EXPIRY=86400      # Valid (seconds)
JWT_EXPIRY=24hours    # Invalid

# Or use longer expiry for development
JWT_EXPIRY=7d
```

---

## IDE Setup (VS Code)

### Recommended Extensions

1. **ES7+ React/Redux/React-Native snippets**
   - Extension: dsznajder.es7-react-js-snippets

2. **ESLint**
   - Extension: dbaeumer.vscode-eslint

3. **Prettier - Code formatter**
   - Extension: esbenp.prettier-vscode

4. **Thunder Client** (or Postman for API testing)
   - Extension: rangav.vscode-thunder-client

5. **PostgreSQL** (if using PostgreSQL)
   - Extension: ckolkman.vscode-postgres

6. **REST Client**
   - Extension: humao.rest-client

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact"
  ],
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Production Checklist

- [ ] Environment variables configured for production
- [ ] Database migrations tested
- [ ] Backend API tested with Postman/Thunder Client
- [ ] Frontend builds without errors
- [ ] CORS properly configured
- [ ] JWT secret changed from default
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] API documentation reviewed
- [ ] Code review completed

---

## Next Steps

1. **Create first event group:** POST `/api/event-groups`
2. **Create test event:** POST `/api/event-groups/:groupId/events`
3. **Test check-in:** POST `/api/events/:eventId/check-in/text`
4. **View attendance:** GET `/api/events/:eventId/attendance`
5. **Export data:** GET `/api/events/:eventId/attendance/export/csv`

---

## Support

For setup issues:
1. Check [troubleshooting section](#common-setup-issues)
2. Review [docs/API.md](./API.md) for endpoint examples
3. Check backend logs: `npm run dev` shows request/error logs
4. Check browser console: F12 → Console tab

## Additional Resources

- **Node.js Documentation:** https://nodejs.org/docs/
- **Express.js Guide:** https://expressjs.com/
- **React Documentation:** https://react.dev/
- **Sequelize Documentation:** https://sequelize.org/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
