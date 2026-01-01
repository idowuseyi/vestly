This **`implementation.md`** provides a blueprint for an autonomous agent to build the **Ownership Ledger & Property Management API**. It is designed to be exhaustive, leaving no room for ambiguity regarding security, scoping, or business logic.

---

# Implementation Guide: Property Ownership Ledger API

## 1. Tech Stack & Project Architecture
*   **Runtime:** Node.js (v18+)
*   **Language:** TypeScript (Strict mode)
*   **Framework:** Express.js
*   **Database:** MongoDB via Mongoose
*   **Validation:** Zod
*   **Task Queue:** BullMQ + Redis
*   **Structure:** Feature-based modularity
```text
src/
  ├── config/         # Environment variables, DB connection
  ├── middleware/     # Auth, Error handling, Validation
  ├── modules/
  │   ├── properties/ # Routes, Controllers, Services, Models, Zod Schemas
  │   ├── units/
  │   ├── tenants/
  │   └── ledger/     # OwnershipCreditTransactions
  ├── shared/         # Base types, constants, scoping utils
  └── worker/         # BullMQ workers
```

---

## 2. Global Business Rules (Strict Enforcement)
1.  **Org-Scoping:** Every single query (find, update, etc.) must include `orgId` from the authenticated user context.
2.  **Ledger Immutability:** The `OwnershipCreditTransaction` collection must never allow `update` or `delete` operations.
3.  **Redemption Guard:** A tenant cannot redeem more than their current computed balance.
4.  **Balance Integrity:** Balance is a derived value. Any ledger entry with type `REDEEM` is a negative value in the sum; `EARN` and `ADJUST` (can be pos/neg) are additive.

---

## 3. Implementation Steps

### Step 1: Authentication Middleware
Implement a middleware that:
1.  Attempts to verify a JWT from the `Authorization: Bearer <token>` header.
2.  Fallback/Stub: If a specific env flag `AUTH_MODE=stub` is set, read identity from `x-user-id`, `x-org-id`, and `x-role`.
3.  Inject the identity into `req.user` with type: `{ userId: string, orgId: string, role: 'tenant' | 'landlord' | 'admin' }`.

### Step 2: Data Models (Mongoose + Zod)
**Property:**
*   Fields: `orgId` (indexed), `nickname`, `address: { street, city, state, zip }`.

**Unit:**
*   Fields: `propertyId` (indexed), `orgId` (indexed), `unitNumber`, `rent`.

**TenantProfile:**
*   Fields: `unitId` (indexed), `orgId` (indexed), `userId`, `name`, `email`.

**OwnershipCreditTransaction (The Ledger):**
*   Fields: `orgId`, `tenantId`, `unitId`, `type` (Enum: EARN, ADJUST, REDEEM), `amount` (Number), `memo`, `createdAt`.
*   **Safety:** Add a Mongoose pre-save hook to prevent updates/deletes.

### Step 3: Scoping Utility
Create a helper function `applyOrgScope(query: any, req: Request)` that merges `{ orgId: req.user.orgId }` into any MongoDB query object to prevent cross-tenant data leaks.

### Step 4: Ledger Logic & Balance
Implement two methods for balance in the Ledger Service:
1.  **Aggregation Pipeline:** A high-performance MongoDB `$match` and `$group` query summing the `amount`.
2.  **TypeScript Logic:** Fetching all records for a `tenantId` and calculating the sum in-memory (for the endpoint `/balance`).

### Step 5: Endpoints Implementation

#### Properties & Units
*   `POST /properties`: Landlord/Admin only.
*   `GET /properties`: Filter by `city`, `state`. Scoped by `orgId`.
*   `POST /properties/:id/units`: Validate that the Property exists and belongs to the current `orgId`.

#### Tenants
*   `POST /units/:id/tenants`: Create a tenant profile linked to a unit.
*   `GET /tenants/me`: Tenant role only. Return profile + unit details + property address.

#### Ownership Credits (The Ledger)
*   `POST /tenants/:id/credits/earn`: Landlord/Admin only.
*   `POST /tenants/:id/credits/redeem`: 
    *   **Logic:** Calculate balance first. If `balance < redemptionAmount`, return `400 Bad Request`.
    *   Insert a `REDEEM` record with a negative amount (or keep amount positive and handle type in logic).
*   `GET /tenants/:id/credits/ledger`: Pagination (limit/offset). Tenants can only see their own `id`.

### Step 6: Async Jobs (BullMQ)
*   Endpoint: `POST /properties/:id/valuation/snapshot`.
*   **Job Logic:** Collect property details, count of units, sum of total rent, and current aggregate ownership credits for all tenants in that property.
*   Write result to a `ValuationSnapshot` collection.

---

## 4. Testing Requirements (Jest + Supertest)
The agent must provide a `tests/` directory with:
1.  **Auth Scoping Test:** Attempt to `GET /properties/:id` using a valid JWT but for a property belonging to a different `orgId`. Expect `404` or `403`.
2.  **Redemption Rule Test:** Create a tenant with 100 credits. Attempt to redeem 150. Expect `400`.
3.  **Balance Derivation Test:** Insert 3 `EARN` transactions and 1 `REDEEM`. Verify the `/balance` endpoint returns the correct mathematical sum.

---

## 5. Deployment & Documentation
*   **README.md:** Include:
    *   Setup instructions (`npm install`, `docker-compose up`).
    *   The **Indexing Strategy Note**: Explain that `orgId` is indexed on all collections to ensure $O(1)$ or $O(\log n)$ lookup speed for multi-tenant queries. Explain that `tenantId` in the ledger is indexed for fast balance calculation.
*   **OpenAPI Spec:** Generate a `swagger.json` or `openapi.yaml` at the root.
*   **Docker:** Provide a `docker-compose.yml` with MongoDB, Redis, and the Node App.

---
