# Troubleshooting Guide

## Common Errors & Fixes

### 1. Database Connection Issues

**Error:** `Can't connect to PostgreSQL server`
**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs ai-booking-postgres-1

# Verify connection string in .env
# Ensure POSTGRES_HOST, PORT, USER, PASSWORD are correct

# Test connection
docker exec -it ai-booking-postgres-1 psql -U postgres -d ai_booking -c "SELECT 1"
```

**Error:** `relation "tenants" does not exist`
**Solution:**
```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Or initialize directly
docker-compose exec backend python -c "import asyncio; from app.core.database import init_db; asyncio.run(init_db())"
```

### 2. Redis Connection Issues

**Error:** `Error connecting to Redis`
**Solution:**
```bash
# Check Redis status
docker ps | grep redis

# Verify REDIS_URL in .env
# Default: redis://localhost:6379/0

# Test connection
docker exec -it ai-booking-redis-1 redis-cli ping
# Should return: PONG
```

### 3. RabbitMQ Connection Issues

**Error:** `Connection refused: connect` or `No connection could be made`
**Solution:**
```bash
# Check RabbitMQ status
docker ps | grep rabbitmq

# Access management UI at http://localhost:15672 (guest/guest)

# Ensure RABBITMQ_URL is correct
# Default: amqp://guest:guest@localhost:5672/

# Restart RabbitMQ
docker restart ai-booking-rabbitmq-1
```

### 4. Backend Won't Start

**Error:** `ModuleNotFoundError: No module named 'app'`
**Solution:**
```bash
# Ensure you're in the backend directory
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install all dependencies
pip install -r requirements.txt
```

**Error:** `Address already in use`
**Solution:**
```bash
# Find what's using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Linux/Mac

# Kill the process or use a different port
uvicorn app.main:app --reload --port 8001
```

### 5. Frontend Issues

**Error:** `Module not found: Can't resolve 'lucide-react'`
**Solution:**
```bash
cd frontend
npm install
```

**Error:** `Error: connect ECONNREFUSED ::1:8000`
**Solution:**
```bash
# Ensure backend is running
# For Next.js, API requests are proxied via next.config.js rewrites
# Check apiFetch utility in src/lib/utils.ts
# Default: NEXT_PUBLIC_API_URL=/api/v1
```

### 6. Docker Issues

**Error:** `Port conflicts` (ports already in use)
**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :5432  # Windows
lsof -i :5432  # Linux/Mac

# Stop conflicting services or change docker-compose ports
```

**Error:** `docker-compose: command not found`
**Solution:**
```bash
# Install Docker Compose
# Windows: Included with Docker Desktop
# Linux: sudo apt-get install docker-compose
# Mac: Included with Docker Desktop
```

**Error:** Container keeps restarting
**Solution:**
```bash
# Check logs
docker logs ai-booking-backend-1

# Common causes:
# - Database not ready (depends_on health check issue)
# - Environment variables missing
# - Port conflicts

# Force rebuild
docker-compose up -d --build
```

### 7. AI/OpenAI Issues

**Error:** `openai.RateLimitError`
**Solution:**
```bash
# Check your OpenAI API key and usage limits
# Implement rate limiting (already included via slowapi)
# Reduce API call frequency
```

**Error:** `openai.AuthenticationError`
**Solution:**
```bash
# Verify OPENAI_API_KEY in .env
# Ensure the key has sufficient permissions
# Check for extra whitespace or quotes in the key
```

### 8. Payment Webhook Issues

**Error:** Webhook signature verification failed
**Solution:**
```bash
# Ensure webhook secret matches in Stripe dashboard
# Check request signature headers
# Verify endpoint URL is correct (ngrok for local testing)
```

### 9. Kubernetes Deployment Issues

**Error:** `CrashLoopBackOff`
**Solution:**
```bash
# Check pod logs
kubectl logs -n ai-booking <pod-name>

# Check pod details
kubectl describe pod -n ai-booking <pod-name>

# Verify configmap and secret are properly mounted
kubectl get configmap -n ai-booking ai-booking-config -o yaml
kubectl get secret -n ai-booking ai-booking-secrets -o yaml
```

**Error:** `ImagePullBackOff`
**Solution:**
```bash
# Check if the image exists in the registry
# For local images, use: imagePullPolicy: IfNotPresent
# For private registries, create imagePullSecret
```

**Error:** `Pending` pod status
**Solution:**
```bash
# Check resource availability
kubectl describe pod -n ai-booking <pod-name>

# Common causes:
# - Insufficient cluster resources
# - PVC not binding (check storage class)
# - Node selector / taints not matching
```

### 10. Multi-Tenant Issues

**Error:** Data leaking between tenants
**Solution:**
```bash
# Check that all queries include tenant_id filter
# Verify API endpoints pass tenant_id correctly
# Ensure database indexes on tenant_id columns exist
```

## Debugging Steps

### Enable Debug Logging

```bash
# Set DEBUG=true in .env
# Backend logs will show SQL queries and event details
```

### Check API Response

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test with verbose flag
curl -v http://localhost:8000/api/v1/bookings/slots?tenant_id=demo
```

### Database Debugging

```bash
# Connect to database
docker exec -it ai-booking-postgres-1 psql -U postgres -d ai_booking

# List tables
\dt

# Check records
SELECT * FROM tenants;
SELECT * FROM bookings LIMIT 10;
```

### Redis Debugging

```bash
# Connect to Redis
docker exec -it ai-booking-redis-1 redis-cli

# List keys
KEYS *
```

### RabbitMQ Debugging

```bash
# Access management UI: http://localhost:15672 (guest/guest)

# Check queues and messages in the Queues tab
# Check bindings and exchanges in the Exchanges tab
```

## Logs Analysis

### Backend Logs

```bash
# Follow backend logs
docker-compose logs -f backend

# Filter specific errors
docker-compose logs backend | grep -i error
docker-compose logs backend | grep -i exception
```

### Database Logs

```bash
# Follow PostgreSQL logs
docker-compose logs -f postgres

# Enable query logging (temporarily)
docker exec -it ai-booking-postgres-1 psql -U postgres -c "ALTER SYSTEM SET log_statement = 'all';"
docker restart ai-booking-postgres-1
```

## API Failure Handling

### Common HTTP Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate booking time |
| 422 | Validation Error | Schema validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Server-side exception |

## Performance Issues

### Slow API Responses

```bash
# Check database query performance
# Look for missing indexes
docker exec -it ai-booking-postgres-1 psql -U postgres -d ai_booking -c "SELECT schemaname, tablename, indexname FROM pg_indexes WHERE tablename = 'bookings';"

# Check connection pool
# Default pool_size=20, max_overflow=10
# Increase if needed in app/core/database.py
```

### High Memory Usage

```bash
# Monitor container resource usage
docker stats

# Check for memory leaks in Python
# Use tracemalloc or memray for profiling
```

## Recovery Procedures

### Database Recovery

```bash
# Restore from backup
cat backup.sql | docker exec -i ai-booking-postgres-1 psql -U postgres ai_booking

# Reset database (drop and recreate)
docker exec -i ai-booking-postgres-1 psql -U postgres -c "DROP DATABASE IF EXISTS ai_booking;"
docker exec -i ai-booking-postgres-1 psql -U postgres -c "CREATE DATABASE ai_booking;"
docker-compose exec backend python seed.py
```

### Full Application Reset

```bash
# Stop and remove all containers with volumes
docker-compose down -v

# Rebuild and start fresh
docker-compose up -d --build

# Seed data
docker-compose exec backend python seed.py
```

## Contact & Support

For issues not covered in this guide:
- Open a GitHub issue
- Check API documentation at `/docs`
- Review the codebase for similar patterns

## Quick Fixes Checklist

- [ ] Is Docker running?
- [ ] Are all containers healthy? (`docker-compose ps`)
- [ ] Is PostgreSQL accessible?
- [ ] Is Redis accessible?
- [ ] Is RabbitMQ accessible?
- [ ] Are environment variables set correctly?
- [ ] Have you run migrations?
- [ ] Have you seeded the database?
- [ ] Are the correct ports exposed?
- [ ] Is the JWT token valid/not expired?
- [ ] Is the tenant slug correct?
