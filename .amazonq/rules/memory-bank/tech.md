# U TECH CRM Backend — Technology Stack

## Runtime
- **Node.js** (CommonJS modules — `"type": "commonjs"`)
- **Express 4.18** — HTTP framework

## Database
- **MySQL** — primary data store
- **mysql2 3.x** — promise-based driver with connection pooling (limit: 10)
- Default DB: `utech_crm`, port `3306`

## Authentication & Security
- **jsonwebtoken 9.x** — JWT signing/verification, default expiry `7d`
- **bcryptjs 2.x** — password hashing
- **helmet 7.x** — HTTP security headers
- **express-rate-limit 7.x** — API rate limiting
- **express-validator 7.x** — input validation

## Services & Integrations
| Package | Purpose |
|---|---|
| `openai ^4.28` | AI engine (GPT models) |
| `pdfkit ^0.13` | PDF quotation generation |
| `nodemailer ^9` | Email notifications |
| `twilio ^4.22` | SMS notifications |
| `axios ^1.6` | HTTP client (webhook/external API calls) |
| `razorpay ^2.9` | Payment gateway |
| `multer ^1.4.5-lts` | File upload handling |
| `uuid ^11` | Unique ID generation |

## Dev Tooling
- **nodemon 3.x** — dev auto-restart
- **jest 30.x** — test framework
- **supertest 7.x** — HTTP integration testing
- **cross-env 10.x** — cross-platform env vars in scripts

## NPM Scripts
| Command | Action |
|---|---|
| `npm start` | Run production server (`node src/server.js`) |
| `npm run dev` | Run dev server with nodemon |
| `npm test` | Run Jest test suite |
| `npm run db:check` | Run DB diagnostic script |

## Environment Variables (`.env`)
| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | Server listen port |
| `NODE_ENV` | `development` | Environment mode |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | `` | MySQL password |
| `DB_NAME` | `utech_crm` | MySQL database name |
| `JWT_SECRET` | `dev_secret` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry |

## Docker
- `docker/Dockerfile` — containerized backend image
- `docker/docker-compose.yml` — multi-service compose setup

## Setup Scripts
- `setup-crm.ps1` — Windows PowerShell automated setup (8 steps: node check, npm install, DB check, schema import, tests, start)
- `setup-crm.bat` — Windows batch equivalent
