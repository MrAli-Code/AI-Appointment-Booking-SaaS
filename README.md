# AI Appointment Booking SaaS

A production-ready, multi-tenant AI-powered appointment booking platform with bilingual support (English + Persian).

## Architecture

```
┌─────────────┐  ┌──────────┐  ┌───────────┐
│   Web App   │  │  Mobile  │  │ Chat Bot  │
│  Next.js    │  │  Flutter │  │ WhatsApp  │
└──────┬──────┘  └────┬─────┘  └─────┬─────┘
       │              │              │
       └──────────────┼──────────────┘
                      │
              ┌───────▼────────┐
              │   API Gateway  │
              │  FastAPI + JWT │
              └───────┬────────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐
│  Booking   │ │     AI     │ │  Payment   │
│  Engine    │ │ Orchestra  │ │  System    │
└──────┬─────┘ └──────┬─────┘ └──────┬─────┘
       │              │              │
       └──────────────┼──────────────┘
                      │
              ┌───────▼────────┐
              │   PostgreSQL   │
              │   Redis Cache  │
              │  RabbitMQ Bus  │
              └────────────────┘
```

## Features

### Core
- Multi-tenant SaaS architecture
- AI-powered booking assistant (replaces human receptionist)
- Real-time availability and conflict prevention
- Staff management with scheduling
- Service catalog with dynamic pricing
- Integrated payment processing
- Bilingual UI (English / Persian)
- Dark/Light mode

### AI Features
- Natural language booking via chat
- Smart slot suggestions
- Cancellation & rescheduling
- VIP customer prioritization
- Human escalation fallback
- Revenue optimization suggestions

### Tech Stack
- **Backend**: FastAPI (Python), SQLAlchemy, asyncpg
- **Frontend**: Next.js 14, TailwindCSS, ShadCN UI
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Message Bus**: RabbitMQ
- **AI**: OpenAI GPT-4 / LangChain
- **Container**: Docker & Docker Compose
- **Orchestration**: Kubernetes (optional)

## Quick Start

```bash
# Start all services
docker-compose up -d

# Seed demo data
docker-compose exec backend python seed.py

# Access
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Demo Credentials
- **Admin**: admin@demo.com / admin123
- **Tenant Slug**: demo

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/v1/       # REST API endpoints
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── ai/           # AI orchestration
│   │   ├── events/       # RabbitMQ event system
│   │   └── i18n/         # Translations
│   ├── seed.py           # Demo data seeder
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # UI components
│   │   ├── i18n/         # Language files
│   │   └── lib/          # Utilities
│   └── Dockerfile
├── kubernetes/            # K8s manifests
├── docker-compose.yml
└── docs/
    ├── INSTALLATION.md    # Full installation guide
    └── TROUBLESHOOTING.md # Debugging guide
```

## Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

MIT
