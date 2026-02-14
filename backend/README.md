Food Management Backend

Stack: Node.js, Express, MongoDB (Mongoose), JWT

Quick start

1. Copy `.env.example` to `.env` and fill values (set `MONGO_URI` and `JWT_SECRET`).
2. Install dependencies:

```bash
cd backend
npm install
# or pnpm install
```

3. Run dev server:

```bash
npm run dev
```

Seed data

Run the included seed script to create a sample staff user and sample menu items:

```bash
npm run seed
# set optional environment variables for seed:
# SEED_STAFF_EMAIL and SEED_STAFF_PASSWORD
```

API endpoints

- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login (returns JWT)
- `GET /api/menu` — list menu (public)
- `POST /api/orders` — create order (student, auth required)
- `PUT /api/orders/:id/status` — update order status (staff)

Example fetch calls

Login (student):

```js
const res = await fetch('http://localhost:5000/api/auth/login', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ email: 'student@example.com', password: 'password123' })
});
const data = await res.json();
const token = data.token;
```

Get menu:

```js
const res = await fetch('http://localhost:5000/api/menu');
const menu = await res.json();
```

Place order (student):

```js
await fetch('http://localhost:5000/api/orders', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
	body: JSON.stringify({ items: [{ food: '<foodId>', qty: 2 }], note: 'No onions' })
});
```

Update order status (staff):

```js
await fetch('http://localhost:5000/api/orders/<orderId>/status', {
	method: 'PUT',
	headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${staffToken}` },
	body: JSON.stringify({ status: 'Confirmed' })
});
```

Deployment notes — Render

- Create a new Web Service.
- Link your repository and set the build command to `npm install && npm run build` (optional) and start command to `npm start` or `node src/index.js`.
- Set environment variables in Render dashboard: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, and any seed values.
- Use the `npm run seed` command in a one-off job to populate initial data.

Environment variables
---------------------

The backend expects the following environment variables (set them in `.env` or your deployment settings):

- `MONGO_URI`: MongoDB connection string. If omitted, the app falls back to `mongodb://127.0.0.1:27017/foodmanagement`.
- `PORT`: Port to run the server (default: `5000`).
- `JWT_SECRET`: Secret used to sign JWT tokens (required for production).
- `JWT_EXPIRES_IN`: JWT expiry string (e.g. `7d`).
- `NODE_ENV`: `development` or `production`.
- `DB_MAX_RETRIES`: (optional) number of initial DB connect retries (default: `8`).
- `DB_BASE_DELAY_MS`: (optional) base delay for exponential backoff in ms (default: `500`).

Logs
----
The backend writes connection logs to `backend/logs/backend.log` (created automatically). In development logs are also printed to console.

Deployment notes — Railway

- Create a new project and add a Node.js service.
- Add the `MONGO_URI` and `JWT_SECRET` environment variables in Railway settings.
- Set the start command to `npm start` and deploy. Run `npm run seed` using Railway's run/one-off command to seed initial data.

Security & production tips

- Use a strong `JWT_SECRET` and rotate if necessary.
- Set `NODE_ENV=production` and ensure CORS origins are set appropriately in `src/index.js` if exposing to specific frontends.
- For production, consider adding rate limiting and request validation.

Postman

Use the included `postman_collection.json` for quick API testing (import into Postman).
