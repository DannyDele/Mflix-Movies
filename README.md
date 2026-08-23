# Ecommerce Admin API

REST API backend for the ecommerce admin dashboard. Feature-based architecture with local disk file storage.

## Quick Start

```bash
npm install
npm run dev      # start server
npm run seed     # populate sample data (requires MongoDB)
```

Default admin: `admin@store.com` / `Admin@123`

## Architecture

Each feature lives in its own folder under `features/`:

```
features/
  auth/          → auth.routes.js, auth.controller.js, auth.service.js, auth.repository.js, auth.model.js, auth.constants.js
  dashboard/
  orders/
  products/
  customers/
  inventory/
  discounts/
  reviews/
  analytics/
  notifications/
  settings/
```

## API Base URL

```
/api/v1/admin
```

## Endpoints

### Auth

Login sets **httpOnly** cookies (`accessToken`, `refreshToken`). Frontend must use `credentials: "include"` (or axios `withCredentials: true`). Set `CLIENT_URL` in `.env` to your frontend origin.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login — sets access + refresh cookies |
| POST | `/auth/refresh` | Rotate tokens from refresh cookie |
| POST | `/auth/logout` | Clear cookies + revoke refresh |
| GET | `/auth/me` | Current admin (cookie or Bearer) |
| PATCH | `/auth/change-password` | Change password (revokes sessions) |
| PATCH | `/auth/two-factor` | Toggle 2FA |
| GET | `/auth/permissions` | List assignable permission keys |
| GET/POST/PATCH/DELETE | `/auth/admins` | Admin accounts (`isSuperAdmin`, `isAdmin`, `permissions[]`) |
| GET/POST/PATCH/DELETE | `/auth/team` | Alias of `/auth/admins` |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard?range=7d\|30d\|90d` | KPIs, revenue trend, top products, recent orders, low-stock alerts |

### Orders
| Method | Path | Description |
|--------|------|-------------|
| GET | `/orders` | List (search, filter, sort, paginate) |
| GET | `/orders/:id` | Order details + timeline |
| POST | `/orders` | Create order |
| PATCH | `/orders/:id/status` | Update fulfillment/payment status |
| POST | `/orders/:id/notes` | Add internal note |
| POST | `/orders/:id/refund` | Issue refund |
| PATCH | `/orders/bulk` | Bulk actions (mark_shipped, cancel) |

### Products
| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List with filters |
| GET | `/products/:id` | Product details |
| POST | `/products` | Create product |
| PUT/PATCH | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| POST | `/products/:id/images` | Upload images (multipart, local disk) |
| DELETE | `/products/:id/images` | Remove image URL |
| PATCH | `/products/bulk/status` | Bulk status update |

### Customers
| Method | Path | Description |
|--------|------|-------------|
| GET | `/customers` | List |
| GET | `/customers/:id` | Details + orders + refunds |
| POST | `/customers` | Create |
| PATCH | `/customers/:id/block` | Block/unblock |
| POST | `/customers/:id/notes` | Add note |

### Inventory
| Method | Path | Description |
|--------|------|-------------|
| GET | `/inventory` | Stock levels table |
| GET | `/inventory/history` | Adjustment log |
| POST | `/inventory/:productId/restock` | Restock |
| POST | `/inventory/:productId/adjust` | Manual adjustment |

### Discounts
| Method | Path | Description |
|--------|------|-------------|
| GET | `/discounts` | List coupons |
| POST | `/discounts` | Create coupon |
| POST | `/discounts/validate` | Validate code |

### Reviews
| Method | Path | Description |
|--------|------|-------------|
| GET | `/reviews` | List reviews |
| PATCH | `/reviews/:id/approve` | Approve |
| PATCH | `/reviews/:id/reject` | Reject |
| PATCH | `/reviews/:id/flag` | Flag |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics?range=30d` | Sales analytics |
| GET | `/analytics/export` | Export report (mock) |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/notifications/settings` | Notification preferences matrix |
| PATCH | `/notifications/settings/:eventType` | Update single event |
| GET | `/notifications/history` | Notification log |
| PATCH | `/notifications/history/:id/read` | Mark read |

### Settings
| Method | Path | Description |
|--------|------|-------------|
| GET | `/settings` | All settings |
| PUT | `/settings/store` | Store profile |
| POST | `/settings/store/logo` | Upload logo (local disk) |
| PUT | `/settings/payments` | Payment gateways |
| PUT | `/settings/shipping` | Shipping zones/rates |

## File Uploads

Images stored locally in `uploads/` and served at `/uploads/{folder}/{filename}`.

- Product images: `POST /products/:id/images` (field: `images`, multipart)
- Store logo: `POST /settings/store/logo` (field: `images`, multipart)

## Auth

Protected routes read the `accessToken` **httpOnly cookie** automatically (preferred).  
`Authorization: Bearer <accessToken>` still works for Swagger/API clients.

Public auth routes: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, and bootstrap `POST /auth/admins` when no admins exist.

## Query Params (common)

- `page`, `limit` — pagination
- `sortBy`, `sortOrder` — sorting (asc/desc)
- `search` — text search

## Env Variables

```
PORT=8080
BASE_URL=http://localhost:8080
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://...
JWT_ACCESS_SECRET=change-me-access
JWT_REFRESH_SECRET=change-me-refresh
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```
