# Docker Compose Setup - Quick Reference

## Prerequisites
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## File Structure
```
workspace-root/
├── docker-compose.yml           ← Main orchestration file
├── docker-compose.override.yml  ← Development overrides (auto-reload)
├── .env                         ← Environment configuration
├── user-service/
│   └── Dockerfile              ← Already exists
├── product-service/
│   └── Dockerfile              ← Already exists
├── order-service/
│   └── Dockerfile              ← Already exists
├── payment-service/
│   └── Dockerfile              ← Already exists
└── frontend/
    └── Dockerfile              ← Just created
```

## Quick Start

### 1. Start All Services (Production Mode)
```bash
# From workspace root
docker-compose up -d

# View logs
docker-compose logs -f
```

### 2. Start with Auto-Reload (Development Mode)
```bash
# Docker Compose automatically uses docker-compose.override.yml
docker-compose up -d

# Services will auto-reload on code changes
```

### 3. Check Service Health
```bash
docker-compose ps

# All should show "healthy" status after ~30 seconds
```

### 4. Access Services
- **Frontend:** http://localhost:5173
- **User Service:** http://localhost:3001
- **Product Service:** http://localhost:3002
- **Order Service:** http://localhost:3003
- **Payment Service:** http://localhost:3004
- **MongoDB:** localhost:27017 (credentials: admin/password)

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
docker-compose logs -f product-service
docker-compose logs -f order-service
docker-compose logs -f payment-service
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Clean Everything (including data)
```bash
docker-compose down -v
```

### Rebuild Specific Service
```bash
docker-compose up -d --build user-service
```

### Run Command in Service Container
```bash
docker-compose exec user-service npm run dev
```

## Troubleshooting

### Port Already in Use
```powershell
# Windows PowerShell - Find and kill process using port
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# Or just rebuild:
docker-compose down && docker-compose up -d
```

### Container Keeps Restarting
```bash
docker-compose logs mongodb
docker-compose logs user-service
# Check the error messages
```

### MongoDB Connection Issues
```bash
# Wait 30 seconds for MongoDB to fully start
# Check MongoDB is healthy:
docker-compose ps mongodb

# Should see "healthy" status
```

### Frontend Can't Reach Backend
The frontend needs to use localhost (not container names) since it runs in the browser:
- Check [frontend/src/services/apiService.js](../frontend/src/services/apiService.js)
- Ensure URLs are `http://localhost:PORT`, not `http://service-name:PORT`

## Environment Variables

The `.env` file contains:
- `JWT_SECRET` - User service JWT key
- `STRIPE_API_KEY` - Stripe payment key (optional)
- `PAYPAL_CLIENT_ID` - PayPal credentials (optional)
- `PAYPAL_CLIENT_SECRET` - PayPal credentials (optional)
- `MONGODB_ROOT_USERNAME` - Default: admin
- `MONGODB_ROOT_PASSWORD` - Default: password

Edit `.env` to customize (especially production).

## Performance Tips

1. **Increase Docker Resource Limits:**
   - Docker Desktop → Settings → Resources
   - Allocate at least 4GB RAM, 2 CPUs

2. **Use Override File:**
   - `docker-compose.override.yml` provides volume mounts for hot-reload
   - Remove or rename if you don't want auto-reload

3. **Prune Unused Containers/Images:**
   ```bash
   docker system prune -a
   ```

## Production Considerations

For production deployment:
1. Change `JWT_SECRET` in `.env`
2. Change MongoDB credentials
3. Remove `volumes` mounts from services
4. Set `NODE_ENV=production` in services
5. Use a dedicated MongoDB instance
6. Set up proper logging/monitoring
7. Use `.dockerignore` files in each service (already exists)

## Integration with Frontend

The frontend requires API base URLs. If using Docker:
- Frontend runs at `http://localhost:5173`
- It makes requests to `http://localhost:3001`, etc. (from browser)
- Update [apiService.js](../frontend/src/services/apiService.js) if ports change

## Next Steps

1. ✅ Created `docker-compose.yml`
2. ✅ Created `docker-compose.override.yml`
3. ✅ Created `.env`
4. ✅ Created `frontend/Dockerfile`
5. Ready to run: `docker-compose up -d`
