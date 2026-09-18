# AI Appointment Booking SaaS - Installation Guide

## Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.10
- **Docker** & Docker Compose (recommended)
- **PostgreSQL** 15+ (if running without Docker)
- **Redis** 7+ (if running without Docker)
- **RabbitMQ** 3.12+ (if running without Docker)

## Quick Start (Docker)

```bash
# 1. Clone the repository
git clone <repo-url> ai-booking-saas
cd ai-booking-saas

# 2. Start all services
docker-compose up -d

# 3. Run database migrations and seed data
docker-compose exec backend python seed.py

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# RabbitMQ UI: http://localhost:15672 (guest/guest)
```

## Manual Installation (Local Development)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env .env.local
# Edit .env.local with your settings

# Run database migrations
alembic upgrade head

# Seed demo data
python seed.py

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Access at http://localhost:3000
```

### 3. Required Services

Start PostgreSQL, Redis, and RabbitMQ:

**Using Docker:**
```bash
docker run -d --name postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_booking -p 5432:5432 postgres:16-alpine
docker run -d --name redis -p 6379:6379 redis:7-alpine
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management-alpine
```

## Environment Variables

### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_USER` | Yes | `postgres` | Database user |
| `POSTGRES_PASSWORD` | Yes | `postgres` | Database password |
| `POSTGRES_HOST` | Yes | `localhost` | Database host |
| `POSTGRES_PORT` | Yes | `5432` | Database port |
| `POSTGRES_DB` | Yes | `ai_booking` | Database name |
| `REDIS_URL` | Yes | `redis://localhost:6379/0` | Redis connection URL |
| `RABBITMQ_URL` | Yes | `amqp://guest:guest@localhost:5672/` | RabbitMQ connection URL |
| `JWT_SECRET` | Yes | - | JWT signing secret (change in production) |
| `JWT_ALGORITHM` | No | `HS256` | JWT algorithm |
| `JWT_EXPIRY_MINUTES` | No | `1440` | Token expiry time |
| `OPENAI_API_KEY` | No | - | OpenAI API key (for AI features) |
| `CORS_ORIGINS` | Yes | `http://localhost:3000` | Allowed CORS origins |

### Frontend (.env.local)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `/api/v1` | Backend API URL |

## Database Schema

The system uses PostgreSQL with the following main tables:

- **tenants** - Multi-tenant business accounts
- **users** - User accounts (customers, admins)
- **staff** - Business staff members
- **services** - Service offerings
- **bookings** - Appointment records
- **availability** - Staff availability schedule
- **payments** - Payment transactions
- **conversations** - AI chat conversations
- **messages** - Chat messages

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Bookings
- `GET /api/v1/bookings/slots` - Get available time slots
- `POST /api/v1/bookings/` - Create booking
- `PATCH /api/v1/bookings/{id}/cancel` - Cancel booking
- `PATCH /api/v1/bookings/{id}/reschedule` - Reschedule booking
- `GET /api/v1/bookings/my` - Get user's bookings
- `GET /api/v1/bookings/admin` - Get all bookings (admin)

### AI Chat
- `POST /api/v1/ai/chat` - Send message to AI assistant
- `GET /api/v1/ai/slots` - Get nearest available slots

### Payments
- `POST /api/v1/payments/` - Create payment
- `POST /api/v1/payments/{id}/confirm` - Confirm payment
- `POST /api/v1/payments/{id}/refund` - Refund payment

### Admin
- `GET /api/v1/admin/dashboard` - Dashboard stats
- `GET /api/v1/admin/analytics` - Analytics data
- `GET /api/v1/admin/bookings` - All bookings
- `GET /api/v1/admin/staff` - Staff list
- `GET /api/v1/admin/services` - Services list

### Webhooks
- `POST /api/v1/webhooks/payment/stripe` - Stripe webhook
- `POST /api/v1/webhooks/payment/zarinpal` - Zarinpal webhook

### Tenants
- `POST /api/v1/tenants/` - Create tenant
- `GET /api/v1/tenants/{slug}` - Get tenant info
- `POST /api/v1/tenants/services` - Create service
- `POST /api/v1/tenants/staff` - Create staff member
- `POST /api/v1/tenants/availability` - Set availability

## Production Deployment

### Building Docker Images

```bash
# Backend
docker build -t ai-booking-backend ./backend

# Frontend
docker build -t ai-booking-frontend ./frontend
```

### Docker Compose (Production)

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```bash
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secret.yaml
kubectl apply -f kubernetes/postgres.yaml
kubectl apply -f kubernetes/redis.yaml
kubectl apply -f kubernetes/rabbitmq.yaml
kubectl apply -f kubernetes/backend.yaml
kubectl apply -f kubernetes/frontend.yaml
kubectl apply -f kubernetes/ingress.yaml
```

### Environment-Specific Settings

**For production, ensure you:**
1. Change all default passwords and secrets
2. Set `ENV=production` and `DEBUG=false`
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Configure persistent volumes for PostgreSQL
6. Set up monitoring (Sentry, Prometheus)
7. Configure proper database backup strategy

### Multi-Tenant Setup

Each business (tenant) is isolated by `tenant_id` in all tables. To add a new tenant:

```bash
curl -X POST http://localhost:8000/api/v1/tenants/ \
  -H "Content-Type: application/json" \
  -d '{"name": "New Business", "slug": "new-business", "locale": "en"}'
```

### AI Features Setup

For AI features (intelligent chat assistant), set your OpenAI API key:

```bash
export OPENAI_API_KEY=sk-your-key-here
```

The AI system supports:
- Natural language booking
- Smart slot suggestions
- Multi-language responses (English/Persian)
- VIP customer detection
- Human escalation

## Backup & Recovery

### PostgreSQL Backup

```bash
docker exec ai-booking-postgres-1 pg_dump -U postgres ai_booking > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
cat backup.sql | docker exec -i ai-booking-postgres-1 psql -U postgres ai_booking
```

## Monitoring

- **Health Check**: `GET /health`
- **API Docs**: `/docs` (Swagger), `/redoc` (ReDoc)
- **RabbitMQ Dashboard**: `http://localhost:15672`
