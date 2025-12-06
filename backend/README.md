# Event Attendance Backend

Backend API for the Event Attendance Monitoring System

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## Folder Structure

```
backend/
├── config/           # Configuration files
├── models/          # Sequelize models (User, Event, etc.)
├── controllers/     # Request handlers
├── routes/          # API route definitions
├── services/        # Business logic
├── middleware/      # Express middleware
├── utils/           # Utility functions
├── jobs/            # Background jobs
├── migrations/      # Database migrations
├── seeders/         # Database seeders
└── server.js        # Application entry point
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests with coverage
- `npm run migrate` - Run pending database migrations
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

## API Documentation

See [../docs/API.md](../docs/API.md) for complete API documentation.

## Database

- **Type:** PostgreSQL 12+
- **ORM:** Sequelize 6+
- **Connection:** Configured in `config/database.js`

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRY`
- `PORT`, `NODE_ENV`, `CORS_ORIGIN`

## Contributing

Follow guidelines in [../CONTRIBUTING.md](../CONTRIBUTING.md)
