# U TECH CRM Backend — Project Structure

## Directory Layout

```
backend/
├── src/
│   ├── app.js               # Express app setup, middleware stack, route mounting
│   ├── server.js            # HTTP server entry point (binds port)
│   ├── config/
│   │   ├── db.js            # MySQL connection pool (mysql2/promise)
│   │   └── env.js           # Centralized env variable exports with defaults
│   ├── controllers/         # Request handlers — thin layer, delegates to DB/services
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── leadController.js
│   │   ├── quotationController.js
│   │   └── workOrderController.js
│   ├── routes/              # Express routers — two naming conventions coexist
│   │   ├── authRoutes.js / auth.routes.js
│   │   ├── leadRoutes.js / lead.routes.js
│   │   ├── customerRoutes.js / customer.routes.js
│   │   ├── quotationRoutes.js / quotation.routes.js
│   │   ├── workOrderRoutes.js / workOrder.routes.js
│   │   ├── webhookRoutes.js / webhook.routes.js
│   │   └── healthRoutes.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verification middleware
│   │   ├── roleGuard.js     # RBAC role enforcement
│   │   ├── validate.js      # express-validator result handler
│   │   ├── errorHandler.js  # Global error handler (last middleware)
│   │   ├── rateLimiter.js   # express-rate-limit configuration
│   │   ├── exportGuard.js   # Guards data export routes
│   │   └── upload.js        # Multer file upload configuration
│   ├── services/
│   │   ├── aiEngine.js      # OpenAI integration for CRM intelligence
│   │   ├── pdfService.js    # PDFKit quotation document generation
│   │   ├── emailService.js  # Nodemailer email delivery
│   │   ├── smsService.js    # Twilio SMS delivery
│   │   ├── whatsappService.js # WhatsApp messaging via API
│   │   └── saveAuditLog.js  # Audit trail persistence
│   ├── utils/
│   │   ├── contactMasking.js   # Mask phone/email for privacy
│   │   ├── numberGenerator.js  # Generate quotation/work-order reference numbers
│   │   ├── pagination.js       # Reusable pagination helper
│   │   └── dbHealth.js         # DB connectivity health check
│   └── scripts/
│       └── dbDiagnostic.js  # Standalone DB diagnostic (npm run db:check)
├── tests/                   # Jest test suite
│   ├── auth.test.js
│   ├── database.test.js
│   ├── health-db.test.js
│   ├── lead.test.js / lead-db.test.js
│   ├── quotation.test.js
│   └── workorder.test.js
├── database/
│   ├── schema.sql           # Full DB schema definition
│   └── seed.sql             # Seed/sample data
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env / .env.example
├── package.json
├── setup-crm.ps1            # Automated Windows setup script
└── setup-crm.bat            # Automated Windows setup script (batch)
```

## Architectural Pattern
- **MVC-style layered architecture**: Routes → Controllers → Services/Utils → DB
- **No ORM**: Direct SQL via `mysql2/promise` connection pool
- **Middleware chain in app.js**: helmet → cors → morgan → json parser → routes → errorHandler
- **Dual route files**: Both `fooRoutes.js` and `foo.routes.js` exist — app.js uses `*Routes.js` convention
- **Config split**: `db.js` exports the pool directly; `env.js` exports named env vars with defaults
