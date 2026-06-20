# U TECH CRM Backend — Development Guidelines

## Code Quality Standards

### Module System
- Use CommonJS (`require` / `module.exports`) — the project is `"type": "commonjs"`
- Never mix ESM (`import`/`export`) syntax

### Error Handling Pattern
- Always wrap async DB/external service calls in `try/catch`
- Pass errors to Express via `next(err)` in controllers, or `reject(err)` in Promise-based services
- Global error handler (`errorHandler.js`) is the single place for HTTP error responses:
  ```js
  res.status(status).json({ success: false, message });
  ```
- In production, scrub internal 500 error messages from responses

### Response Shape
- Error responses: `{ success: false, message: '...' }`
- Success responses from controllers: use direct JSON, e.g. `res.json({ data, pagination })`
- Paginated responses always use `formatPaginatedResponse(data, totalCount, page, limit)`

### Async DB Access
- Always use the shared pool from `src/config/db.js` — never create new connections
- Destructure results: `const [rows] = await pool.query(sql, params)`
- Use parameterized queries — never string-interpolate user input into SQL

---

## Structural Conventions

### Layering
```
Route → Controller → Service/Util → DB (pool.query)
```
- Routes: only apply middleware and call controller methods
- Controllers: handle req/res, call services, return HTTP responses
- Services: business logic, external API calls, file I/O — no req/res objects
- Utils: pure functions, no side effects on DB or network

### Middleware Ordering in app.js
```
helmet → cors → morgan → express.json → express.urlencoded → routes → errorHandler
```
- `errorHandler` must always be the last `app.use()`
- Auth middleware (`auth.js`) is applied at router level, not globally

### File Naming
- Controllers: `fooController.js`
- Routes: `fooRoutes.js` (app.js uses this convention; ignore `foo.routes.js` duplicates)
- Services: `fooService.js` or descriptive name (`aiEngine.js`, `saveAuditLog.js`)
- Middleware: `camelCase.js`
- Utils: `camelCase.js`

---

## Patterns

### Graceful Feature Degradation
Services with optional external dependencies initialize conditionally and fall back to local logic:
```js
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
// later...
if (!openai) { /* rule-based fallback */ }
```
Apply this pattern for any optional integration (AI, SMS, email).

### RBAC Contact Masking
Always apply contact masking before returning lead/customer data to lower-privileged roles:
```js
// Single entity
const safeEntity = maskEntityContacts(entity, req.user.role);
// List
const safeList = maskListContacts(rows, req.user.role);
```
Roles that see unmasked data: `'Super Admin'`, `'Admin'`, `'Sales Manager'`

### Pagination
Use shared helpers for all list endpoints:
```js
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

const { limit, offset, page } = getPaginationParams(req.query);
const [rows] = await pool.query('SELECT ... LIMIT ? OFFSET ?', [...params, limit, offset]);
const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM ...');
res.json(formatPaginatedResponse(rows, total, page, limit));
```

### JWT Auth Middleware
Applied at route level:
```js
const auth = require('../middleware/auth');
router.get('/', auth, controller.list);
```
Token must be in `Authorization: Bearer <token>` header. Attaches decoded payload to `req.user`.

### Role Guard
```js
const roleGuard = require('../middleware/roleGuard');
router.delete('/:id', auth, roleGuard(['Admin', 'Super Admin']), controller.delete);
```

### File Uploads
Use the shared `upload` middleware from `src/middleware/upload.js`:
```js
const upload = require('../middleware/upload');
router.post('/', auth, upload.single('attachment'), controller.create);
```
- Allowed types: `.jpg`, `.jpeg`, `.png`, `.pdf`
- Max size: 5 MB
- Files saved to `uploads/` directory (auto-created if missing)
- Filename pattern: `{fieldname}-{timestamp}-{random}{ext}`

### PDF Generation
Call `generateBrandedPDF(type, docData)` from `pdfService.js`. It returns a Promise:
```js
const { generateBrandedPDF } = require('../services/pdfService');
const { relativePath, filePath } = await generateBrandedPDF('Quotation', {
  no, date, customerName, customerMobile, address,
  items, subtotal, gst_amount, total_amount
});
```
- `type` values: `'Quotation'`, `'ProformaInvoice'`, `'WorkOrder'`, `'AMCContract'`
- Files saved to `uploads/` directory

### Audit Logging
Call `saveAuditLog` service after any significant state-changing operation (create, update, status change).

### AI Engine Usage
```js
const { generateResponse, matchProductRequirements, profileLead } = require('../services/aiEngine');

// WhatsApp/chat auto-reply
const reply = await generateResponse(userMessage, fromNumber);

// Match products to requirement text
const matched = await matchProductRequirements(requirementText);

// Lead profiling
const profile = await profileLead(leadName, requirement, score);
// Returns: { profileGrade: 'HOT'|'WARM'|'COLD', summary, recommendedActions[] }
```

---

## Documentation Standards

### JSDoc on all exported functions
Every exported function must have a JSDoc comment with `@param`, `@returns`, and a one-line description:
```js
/**
 * Brief description of what this function does.
 * @param {string} paramName - Description
 * @returns {Promise<object>} Description of resolved value
 */
```

### Inline Comments
- Use inline comments to label major sections within long functions (e.g. `// --- HEADER ---`, `// --- TABLE ITEMS ---`)
- Avoid commenting obvious code

---

## Security Checklist
- Never commit real secrets — use `.env` (already in `.gitignore`)
- Always use parameterized SQL queries
- Apply `helmet()` (already in app.js — do not remove)
- Apply `rateLimiter` on auth and sensitive routes
- Apply `exportGuard` middleware on data export endpoints
- Sanitize/validate all incoming request data via `express-validator` and the `validate` middleware
- Scrub 500 error messages in production (already in `errorHandler.js`)
