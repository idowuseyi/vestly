# 🔐 API Authentication Guide

## Quick Start - Two Authentication Modes

The API supports **two authentication modes**:

### 1️⃣ **Stub Mode** (Development - EASIEST)

Use HTTP headers instead of JWT tokens - perfect for testing!

### 2️⃣ **JWT Mode** (Production)

Use proper JWT tokens via login

---

## 🚀 Option 1: Stub Mode (Recommended for Testing)

### Enable Stub Mode

Set in your environment:

```bash
AUTH_MODE=stub
```

Or in `docker-compose.yml`:

```yaml
environment:
  - AUTH_MODE=stub
```

### How to Use

Add these headers to **any request**:

```http
x-user-id: user-123
x-org-id: org-123
x-role: landlord
```

**Example with cURL:**

```bash
curl -X POST http://localhost:8080/api/v1/properties \
  -H "x-user-id: user-123" \
  -H "x-org-id: org-123" \
  -H "x-role: landlord" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "Downtown Apartments",
    "address": {
      "street": "123 Main St",
      "city": "Boston",
      "state": "MA",
      "zip": "02101"
    }
  }'
```

**In Swagger UI:**

1. Click "Authorize" button (🔓 icon)
2. Skip the Bearer token
3. Or manually add headers in your HTTP client

---

## 🔑 Option 2: JWT Mode (Production)

### Step 1: Register a User

**No authentication required** for registration:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@example.com",
    "password": "SecurePassword123!",
    "name": "John Landlord",
    "role": "landlord",
    "orgId": "org-123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "status_code": 201,
  "data": {
    "user": { ...user details... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 2: Save the Token

Copy the `token` value from the response.

### Step 3: Use Token for Other Endpoints

Add to Authorization header:

```bash
curl -X GET http://localhost:8080/api/v1/properties \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**In Swagger UI:**

1. Click "Authorize" button (🔓)
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize"
4. Click "Close"
5. Now all requests will include the token!

---

## 🔧 Current Configuration

Check your current mode:

```bash
# In Docker
docker compose exec api printenv AUTH_MODE

# Or check docker-compose.yml
grep AUTH_MODE docker-compose.yml
```

**Default:** `jwt` (Production mode)

---

## 📝 Endpoints That DON'T Require Auth

Only these endpoints work without authentication:

- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Get token
- `GET /health` - Health check
- `GET /api-docs` - Swagger UI

**All other endpoints require authentication!**

---

## 🛠️ Switching to Stub Mode

### For Docker (Recommended for Testing):

1. Edit `docker-compose.yml`:

```yaml
api:
  environment:
    - AUTH_MODE=stub # Add or change this line
```

2. Restart:

```bash
docker compose down
docker compose up -d
```

### For Local Development:

Create `.env` file:

```bash
AUTH_MODE=stub
```

---

## 🎯 Swagger UI Quick Fix

If you want to test immediately in Swagger:

**Option A - Enable Stub Mode** (restart required):

1. Edit `docker-compose.yml` → Set `AUTH_MODE=stub`
2. `docker compose restart api`
3. Use Swagger with stub headers

**Option B - Use JWT** (no restart):

1. Go to Swagger: http://localhost:8080/api-docs
2. Find `POST /api/v1/auth/register`
3. Click "Try it out"
4. Fill in the request body
5. Execute
6. Copy the `token` from response
7. Click "Authorize" at top
8. Enter: `Bearer <your-token>`
9. Now all endpoints will work!

---

## 💡 Pro Tips

### For Development/Testing

Use **Stub Mode** - much easier, no need to manage tokens

### For Production

Use **JWT Mode** - proper security with expiring tokens

### Token Expiry

Tokens expire after **24 hours**. Just login again to get a new one!

### Multiple Organizations

Each user belongs to one `orgId`. Users can only see data from their own organization (multi-tenant isolation).

---

## 🐛 Troubleshooting

**"No token provided"** → Either:

- Use stub mode with headers, OR
- Login first to get a token

**"Unauthorized"** → Token expired or invalid

- Login again to get fresh token

**"Forbidden"** → Your role doesn't have permission

- Check role: `tenant`, `landlord`, or `admin`
- Some endpoints require `landlord` or `admin` role

---

## 📚 Example Workflow

### Complete Example (JWT Mode):

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "landlord",
    "orgId": "org-999"
  }' | jq -r '.data.token')

# 2. Create Property (using token)
curl -X POST http://localhost:8080/api/v1/properties \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "Test Building",
    "address": {
      "street": "456 Oak Ave",
      "city": "Seattle",
      "state": "WA",
      "zip": "98101"
    }
  }'

# 3. Get all properties
curl -X GET "http://localhost:8080/api/v1/properties" \
  -H "Authorization: Bearer $TOKEN"
```

---

**Choose the mode that works best for you and you're all set!** 🚀
