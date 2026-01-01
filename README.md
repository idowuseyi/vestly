# Vestly API - Property Ownership Ledger

A production-ready multi-tenant property management API with ownership credit tracking, built with Express.js, MongoDB, and BullMQ.

## 🚀 Features

- **Multi-tenant Architecture**: Strict organization-level data isolation with `orgId` scoping
- **Ownership Credit Ledger**: Immutable, append-only transaction ledger for tracking tenant ownership credits
- **Secure Authentication**: JWT-based authentication with stub mode for development/testing
- **Role-Based Access Control**: Granular permissions for tenants, landlords, and admins
- **Async Job Processing**: BullMQ integration for property valuation snapshots
- **Comprehensive Validation**: Zod schemas for all inputs
- **Type Safety**: TypeScript with strict mode enabled
- **API Documentation**: Swagger UI for interactive API exploration
- **Full Test Coverage**: Integration and unit tests with Jest

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0 (or MongoDB Atlas)
- Redis >= 6.0
- Docker & Docker Compose (optional, for containerized deployment)

## 🛠️ Installation

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd vestly
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB and Redis** (if not using Docker)

   ```bash
   # MongoDB
   mongod --dbpath /path/to/data

   # Redis
   redis-server
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Run the worker process** (in a separate terminal)
   ```bash
   npm run dev:worker
   ```

### Docker Deployment

1. **Start all services**

   ```bash
   docker-compose up -d
   ```

2. **View logs**

   ```bash
   docker-compose logs -f api
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## 📚 API Documentation

Once the server is running, access the interactive Swagger UI at:

```
http://localhost:8080/api-docs
```

## 🔑 Authentication

### JWT Mode (Production)

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Stub Mode (Development/Testing)

Set `AUTH_MODE=stub` in your `.env` file and use custom headers:

```
x-user-id: <user-id>
x-org-id: <org-id>
x-role: tenant | landlord | admin
```

## 🏗️ Architecture

### Database Indexing Strategy

All collections implement **compound indexes on `orgId`** to ensure optimal query performance in multi-tenant scenarios:

- **Properties**: Indexed on `{orgId, createdAt}`, `{orgId, 'address.city'}`, `{orgId, 'address.state'}`
- **Units**: Indexed on `{orgId, propertyId}`, `{orgId, unitNumber}`
- **Tenants**: Indexed on `{orgId, userId}`, `{orgId, unitId}`
- **OwnershipCreditTransactions**: Indexed on `{orgId, tenantId, createdAt}`

These indexes provide **O(log n)** lookup performance for organization-scoped queries, preventing full collection scans and ensuring fast response times even with millions of records.

### Ledger Immutability

The `OwnershipCreditTransaction` model enforces **append-only behavior** through Mongoose pre-hooks:

- All `update` operations are blocked
- All `delete` operations are blocked
- Only `create` operations are allowed

This ensures the integrity and audit trail of all credit transactions.

### Balance Calculation

The system implements **two balance calculation methods**:

1. **MongoDB Aggregation Pipeline** (Default): High-performance server-side calculation
   - Uses `$match` to filter by orgId and tenantId
   - Uses `$group` with conditional `$sum` for transaction types
   - Optimal for production use

2. **In-Memory Calculation**: JavaScript-based calculation for validation
   - Fetches all transactions and calculates in TypeScript
   - Used for testing and verification

### Business Rules

1. **Organization Scoping**: Every database query includes `orgId` filter
2. **Ledger Immutability**: Transactions cannot be modified or deleted
3. **Redemption Guard**: Tenants cannot redeem more credits than their balance
4. **Balance Integrity**:
   - `EARN`: Adds to balance (positive)
   - `ADJUST`: Can be positive or negative
   - `REDEEM`: Subtracts from balance (negative)

## 🧪 Testing

### Run all tests

```bash
npm test
```

### Run with coverage

```bash
npm run test:coverage
```

### Run integration tests only

```bash
npm run test:integration
```

### Key Test Cases

1. **Auth Scoping Test**: Validates that users cannot access resources from other organizations
2. **Redemption Rule Test**: Ensures tenants cannot redeem more credits than available
3. **Balance Derivation Test**: Verifies correct balance calculation across transaction types

## 📁 Project Structure

```
src/
├── config/           # Environment and database configuration
├── middleware/       # Auth, validation, error handling
├── modules/
│   ├── auth/        # User authentication
│   ├── properties/  # Property management
│   ├── units/       # Unit management
│   ├── tenants/     # Tenant profiles
│   ├── ledger/      # Ownership credit transactions
│   └── valuation/   # Property valuation snapshots
├── shared/          # Common types, utilities, response formatters
├── app.ts           # Express application setup
├── server.ts        # API server entry point
└── worker.ts        # BullMQ worker entry point
```

## 🔐 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes by default)
- **JWT Expiration**: Tokens expire after 24 hours
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Zod schemas on all endpoints
- **SQL Injection Prevention**: Mongoose sanitization
- **XSS Protection**: Express built-in escaping

## 🚦 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Properties

- `POST /api/v1/properties` - Create property (landlord/admin)
- `GET /api/v1/properties` - List properties with filters
- `GET /api/v1/properties/:id` - Get property details
- `PUT /api/v1/properties/:id` - Update property
- `DELETE /api/v1/properties/:id` - Delete property

### Units

- `POST /api/v1/properties/:id/units` - Create unit (landlord/admin)
- `GET /api/v1/properties/:id/units` - List units for property
- `GET /api/v1/units/:id` - Get unit details
- `PUT /api/v1/units/:id` - Update unit
- `DELETE /api/v1/units/:id` - Delete unit

### Tenants

- `POST /api/v1/units/:id/tenants` - Create tenant (landlord/admin)
- `GET /api/v1/tenants/me` - Get current tenant profile (tenant only)
- `GET /api/v1/tenants/:id` - Get tenant details
- `GET /api/v1/tenants` - List all tenants (landlord/admin)

### Ownership Credits (Ledger)

- `POST /api/v1/tenants/:id/credits/earn` - Award credits (landlord/admin)
- `POST /api/v1/tenants/:id/credits/adjust` - Adjust credits (landlord/admin)
- `POST /api/v1/tenants/:id/credits/redeem` - Redeem credits
- `GET /api/v1/tenants/:id/credits/ledger` - Get transaction history
- `GET /api/v1/tenants/:id/credits/balance` - Get current balance

### Valuation

- `POST /api/v1/properties/:id/valuation/snapshot` - Trigger snapshot job
- `GET /api/v1/properties/:id/valuation/snapshots` - Get snapshot history

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Verify MongoDB is running: `mongosh`
- Check connection string in `.env`
- For Atlas: Whitelist your IP address

### Redis Connection Issues

- Verify Redis is running: `redis-cli ping`
- Check `REDIS_HOST` and `REDIS_PORT` in `.env`

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

## 📝 Environment Variables

| Variable           | Description                           | Default       |
| ------------------ | ------------------------------------- | ------------- |
| `NODE_ENV`         | Environment mode                      | `development` |
| `PORT`             | Server port                           | `8080`        |
| `MONGODB_URI`      | MongoDB connection string             | Required      |
| `REDIS_HOST`       | Redis host                            | `localhost`   |
| `REDIS_PORT`       | Redis port                            | `6379`        |
| `JWT_SECRET`       | JWT signing secret (min 32 chars)     | Required      |
| `JWT_EXPIRES_IN`   | Token expiration                      | `24h`         |
| `AUTH_MODE`        | Authentication mode (`jwt` or `stub`) | `jwt`         |
| `API_VERSION`      | API version prefix                    | `v1`          |
| `SWAGGER_USERNAME` | Swagger UI username (optional)        | -             |
| `SWAGGER_PASSWORD` | Swagger UI password (optional)        | -             |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Express.js, MongoDB, and TypeScript
- Uses BullMQ for reliable job processing
- Zod for runtime type validation
- Jest and Supertest for testing

---

## 💡 If I had more time…

This section outlines potential improvements, new features, and enhancements that I would have liked to implement if I had more time. These would make the system more robust, scalable, and feature-rich.

### 🔔 Notifications & Communication

- **Email Service Integration**
  - Transactional emails for registration, password reset, and critical actions
  - Email notifications for credit transactions, property updates
  - Integration with SendGrid, AWS SES, or Postmark

- **Real-time Notifications**
  - WebSocket implementation for live updates
  - Push notifications for mobile applications
  - In-app notification center with read/unread states

- **SMS Notifications**
  - Two-factor authentication via SMS
  - Critical alerts for high-value transactions
  - Integration with Twilio or AWS SNS

- **Notification Preferences**
  - User-configurable notification settings
  - Digest emails (daily/weekly summaries)
  - Channel preferences (email, SMS, push, in-app)

### 📊 Logging, Monitoring & Observability

- **Structured Logging**
  - Winston or Pino integration for structured JSON logs
  - Log aggregation with ELK Stack (Elasticsearch, Logstash, Kibana) or Datadog
  - Request ID tracking across services
  - Log levels by environment (verbose dev, error-only prod)

- **Application Performance Monitoring (APM)**
  - New Relic, Datadog APM, or Elastic APM integration
  - Request tracing and performance metrics
  - Slow query detection and optimization alerts
  - Memory leak detection

- **Metrics & Analytics**
  - Prometheus + Grafana for custom metrics
  - Business metrics dashboards (transactions per day, user growth)
  - API endpoint performance metrics
  - Database query performance tracking

- **Error Tracking**
  - Sentry or Rollbar integration for error tracking
  - Automatic error categorization and deduplication
  - Error alerts with context and stack traces
  - User impact analysis

- **Health Checks & Uptime Monitoring**
  - Comprehensive health check endpoints (database, Redis, external APIs)
  - Uptime monitoring with PingDOM, UptimeRobot, or StatusCake
  - Status page for system health visibility
  - Automated incident response workflows

### 🔐 Security Enhancements

- **Advanced Authentication**
  - OAuth 2.0 / OpenID Connect integration
  - Social login (Google, Facebook, Apple)
  - Multi-factor authentication (MFA/2FA)
  - Biometric authentication for mobile
  - Session management and concurrent login handling

- **Password Management**
  - Password reset via email
  - Password strength requirements
  - Breach password detection (HaveIBeenPwned API)
  - Password expiration policies

- **API Security**
  - API key management system
  - Webhook signature verification
  - IP whitelisting for sensitive endpoints
  - Rate limiting per user/organization
  - CAPTCHA for public endpoints

- **Audit & Compliance**
  - Comprehensive audit logs for all actions
  - GDPR compliance features (data export, right to be forgotten)
  - SOC 2 compliance documentation
  - Data retention policies
  - Encryption at rest for sensitive data

- **Security Scanning**
  - Automated vulnerability scanning (Snyk, Dependabot)
  - OWASP ZAP security testing
  - Regular penetration testing
  - Static code analysis (SonarQube)

### 🚀 Scalability & Performance

- **Caching Strategy**
  - Redis caching for frequently accessed data
  - CDN integration for static assets
  - HTTP caching headers
  - Cache invalidation strategies

- **Database Optimization**
  - Read replicas for MongoDB
  - Database sharding strategy
  - Connection pooling optimization
  - Query performance optimization
  - Database backup and restore automation

- **Horizontal Scaling**
  - Kubernetes deployment configuration
  - Auto-scaling based on CPU/memory/request rate
  - Load balancer configuration (nginx, HAProxy, AWS ALB)
  - Session management for distributed systems

- **Background Job Optimization**
  - Job prioritization and retry strategies
  - Dead letter queue handling
  - Job monitoring dashboard
  - Batch processing for bulk operations

### 📱 New Features & Functionality

- **Payment Integration**
  - Stripe or PayPal integration for rent payments
  - Automated recurring payments
  - Payment history and invoicing
  - Credit/debit card tokenization
  - Payment plan management

- **Document Management**
  - Lease agreement uploads and storage
  - Digital signatures (DocuSign, HelloSign)
  - Document templates (leases, notices)
  - File versioning and audit trail
  - OCR for document parsing

- **Maintenance & Work Orders**
  - Tenant maintenance request submission
  - Work order tracking and assignment
  - Vendor management
  - Before/after photo uploads
  - Maintenance cost tracking

- **Financial Reporting**
  - Income and expense reports
  - Tax documentation generation
  - Profit and loss statements
  - Cash flow projections
  - Export to accounting software (QuickBooks, Xero)

- **Advanced Property Valuation**
  - Integration with real estate APIs (Zillow, Redfin)
  - Automated valuation models (AVM)
  - Market trend analysis
  - Comparative market analysis (CMA)
  - ROI calculators

- **Lease Management**
  - Lease term tracking
  - Automatic lease renewal reminders
  - Lease expiration dashboard
  - Rent escalation clauses
  - Move-in/move-out checklists

- **Tenant Portal**
  - Self-service rent payment
  - Maintenance request submission
  - Lease document access
  - Communication with landlords
  - Rental history and receipts

- **Landlord Dashboard**
  - Portfolio overview with key metrics
  - Vacancy tracking
  - Rent collection status
  - Maintenance queue
  - Financial summaries

### 🧪 Testing & Quality Assurance

- **Extended Test Coverage**
  - E2E testing with Playwright or Cypress
  - Load testing with k6 or Artillery
  - Chaos engineering for resilience testing
  - Contract testing for API consumers
  - Visual regression testing

- **Test Automation**
  - Automated test runs on PR creation
  - Test coverage requirements in CI/CD
  - Mutation testing for test quality
  - Automated accessibility testing

### 🔧 DevOps & Infrastructure

- **CI/CD Improvements**
  - Blue-green deployments
  - Canary releases
  - Automated rollback on failure
  - Feature flags for gradual rollouts
  - Deployment approval workflows

- **Infrastructure as Code**
  - Terraform or Pulumi for infrastructure provisioning
  - Environment parity (dev, staging, prod)
  - Disaster recovery plan and automation
  - Multi-region deployment

- **Container Orchestration**
  - Kubernetes manifests and Helm charts
  - Service mesh (Istio, Linkerd)
  - Container security scanning
  - Resource limits and quotas

- **Backup & Disaster Recovery**
  - Automated database backups
  - Point-in-time recovery
  - Multi-region replication
  - Disaster recovery runbooks
  - Regular restore testing

### 📝 Documentation & Developer Experience

- **Enhanced API Documentation**
  - Postman collections
  - Interactive code examples in multiple languages
  - API versioning strategy documentation
  - API changelog and deprecation notices
  - GraphQL alternative API

- **Developer Tools**
  - CLI tool for common operations
  - Database seeding scripts for testing
  - Development environment setup automation
  - API client SDKs (JavaScript, Python, Ruby)

- **User Documentation**
  - User guides and tutorials
  - Video walkthroughs
  - FAQ section
  - Integration guides for third-party tools

### 🌍 Internationalization & Localization

- **Multi-language Support**
  - i18n implementation for API responses
  - Multi-currency support
  - Timezone handling
  - Locale-specific date/number formatting

### 🤖 Automation & AI/ML

- **Intelligent Features**
  - Predictive analytics for rent pricing
  - Tenant credit risk scoring
  - Automated rent collection follow-ups
  - Smart property recommendations
  - Natural language processing for maintenance requests

- **Workflow Automation**
  - Zapier/Integromat integration
  - Custom workflow builder
  - Automated tenant screening
  - Lease renewal automation

### 📊 Reporting & Analytics

- **Advanced Analytics**
  - Custom report builder
  - Data export to CSV/Excel/PDF
  - Scheduled report delivery
  - Embedded analytics dashboards
  - Tenant behavior analytics

### 🔄 API & Integration Enhancements

- **Webhooks**
  - Event-driven webhooks for integrations
  - Webhook delivery retry logic
  - Webhook signature verification
  - Webhook event log

- **Third-Party Integrations**
  - Accounting software (QuickBooks, Xero)
  - Background check services
  - Property listing platforms (Zillow, Trulia)
  - Smart home integrations
  - Calendar integrations (Google Calendar, Outlook)

### 🎨 User Experience Improvements

- **Mobile Application**
  - Native iOS and Android apps
  - React Native or Flutter implementation
  - Offline mode support
  - Push notifications

- **Progressive Web App (PWA)**
  - Service worker for offline functionality
  - Add to home screen capability
  - Push notifications

- **Accessibility**
  - WCAG 2.1 Level AA compliance
  - Screen reader optimization
  - Keyboard navigation
  - High contrast mode

### 🏢 Enterprise Features

- **Multi-organization Management**
  - Organization hierarchy and sub-accounts
  - Cross-organization reporting
  - White-label capabilities
  - Custom branding per organization

- **Advanced Permissions**
  - Granular permission system
  - Custom roles and permissions
  - Team collaboration features
  - Delegation and approval workflows

- **SSO & Directory Integration**
  - SAML 2.0 support
  - Active Directory / LDAP integration
  - SCIM for user provisioning

---

**Built with ❤️ for property management**
