# Docker Deployment Guide

This guide provides comprehensive instructions for deploying chatbot solutions using Docker and Docker Compose.

## 🐳 Quick Start

```bash
# Choose your framework and deploy
cd frameworks/rasa/
docker-compose up -d

# Or deploy all frameworks
cd deployment/docker/
docker-compose -f multi-framework.yml up -d
```

## 📋 Prerequisites

- Docker 20.0+
- Docker Compose 2.0+
- 8GB RAM recommended
- 20GB disk space

## 🏗️ Project Structure

```
deployment/docker/
├── 📁 rasa/                      # Rasa-specific Docker configs
│   ├── Dockerfile               # Production Rasa image
│   ├── docker-compose.yml       # Development setup
│   └── docker-compose.prod.yml  # Production setup
├── 📁 botpress/                 # Botpress Docker configs
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf               # Reverse proxy config
├── 📁 chatterbot/               # ChatterBot Docker configs
│   ├── Dockerfile
│   └── docker-compose.yml
├── 📁 nginx/                    # Shared Nginx configurations
│   ├── default.conf
│   └── ssl.conf
├── 📁 monitoring/               # Monitoring stack
│   ├── prometheus.yml
│   ├── grafana/
│   └── docker-compose.monitoring.yml
├── 📄 multi-framework.yml       # All frameworks in one stack
├── 📄 .env.example             # Environment variables template
└── 📖 README.md                # This file
```

## 🚀 Individual Framework Deployment

### Rasa Deployment

```bash
cd frameworks/rasa/

# Development deployment
docker-compose up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Scale action servers
docker-compose up -d --scale rasa-actions=3
```

**Services:**
- **Rasa Server** - Port 5005
- **Action Server** - Port 5055  
- **Duckling** - Port 8000
- **Redis** - Port 6379
- **PostgreSQL** - Port 5432

### Botpress Deployment

```bash
cd frameworks/botpress/

# Start Botpress with dependencies
docker-compose up -d

# Access Botpress Studio
open http://localhost:3000
```

**Services:**
- **Botpress** - Port 3000
- **PostgreSQL** - Port 5432
- **Redis** - Port 6379
- **Nginx** - Port 80

### ChatterBot Deployment

```bash
cd frameworks/chatterbot/

# Start Python chatbot
docker-compose up -d

# Test the API
curl http://localhost:5000/health
```

**Services:**
- **ChatterBot API** - Port 5000
- **SQLite** - File-based database

## 🌐 Multi-Framework Deployment

Deploy all chatbot frameworks simultaneously:

```bash
cd deployment/docker/

# Start all frameworks
docker-compose -f multi-framework.yml up -d

# Check status
docker-compose -f multi-framework.yml ps

# View logs
docker-compose -f multi-framework.yml logs -f
```

**Access Points:**
- **Rasa** - http://localhost:5005
- **Botpress** - http://localhost:3000
- **ChatterBot** - http://localhost:5000
- **Nginx Gateway** - http://localhost:80

## ⚙️ Configuration

### Environment Variables

Create `.env` file from template:

```bash
cp .env.example .env
# Edit .env with your configurations
```

**Required Variables:**
```bash
# Database Configuration
POSTGRES_DB=chatbots
POSTGRES_USER=chatbot_user
POSTGRES_PASSWORD=secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key

# External APIs
WEATHER_API_KEY=your_weather_api_key
OPENAI_API_KEY=your_openai_key

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=admin_password
```

### Volume Mounts

**Persistent Data:**
```yaml
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  rasa_models:
    driver: local
  botpress_data:
    driver: local
  nginx_certs:
    driver: local
```

**Bind Mounts for Development:**
```yaml
volumes:
  - ./frameworks/rasa/data:/app/data
  - ./frameworks/rasa/models:/app/models
  - ./frameworks/botpress/flows:/app/flows
  - ./frameworks/chatterbot/src:/app/src
```

## 🔒 Security Configuration

### SSL/TLS Setup

```bash
# Generate SSL certificates
mkdir -p nginx/certs
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout nginx/certs/chatbot.key \
  -out nginx/certs/chatbot.crt

# Update nginx.conf with SSL
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/certs/chatbot.crt;
    ssl_certificate_key /etc/nginx/certs/chatbot.key;
}
```

### Network Security

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true

services:
  nginx:
    networks:
      - frontend
      - backend
  
  postgres:
    networks:
      - backend  # Database not exposed to frontend
```

### Secret Management

```bash
# Use Docker secrets for production
echo "secure_password" | docker secret create postgres_password -

# Reference in compose file
secrets:
  postgres_password:
    external: true

services:
  postgres:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
```

## 📊 Monitoring & Logging

### Prometheus & Grafana

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
open http://localhost:3001
# Default: admin / admin_password
```

**Monitored Metrics:**
- Container resource usage
- Request rates and response times
- Database connections
- Redis memory usage
- Custom chatbot metrics

### Centralized Logging

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

# Or use external log driver
logging:
  driver: "fluentd"
  options:
    fluentd-address: "localhost:24224"
    tag: "chatbot.{{.Name}}"
```

### Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5005/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🔧 Production Optimizations

### Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'  
      memory: 2G
```

### Auto-scaling

```yaml
deploy:
  replicas: 3
  update_config:
    parallelism: 1
    delay: 10s
    failure_action: rollback
  restart_policy:
    condition: on-failure
    delay: 5s
    max_attempts: 3
```

### Performance Tuning

```yaml
# PostgreSQL optimizations
environment:
  POSTGRES_SHARED_BUFFERS: 256MB
  POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
  POSTGRES_WORK_MEM: 4MB

# Redis optimizations  
command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru

# Nginx optimizations
worker_processes: auto
worker_connections: 1024
```

## 🚨 Troubleshooting

### Common Issues

**1. Port conflicts**
```bash
# Check port usage
netstat -tulpn | grep :5005

# Use different ports
environment:
  - RASA_PORT=5006
```

**2. Memory issues**
```bash
# Check container memory usage
docker stats

# Increase memory limits
deploy:
  resources:
    limits:
      memory: 8G
```

**3. Database connection errors**
```bash
# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Health Check Commands

```bash
# Check all services
docker-compose ps

# Test service endpoints
curl http://localhost:5005/api/health  # Rasa
curl http://localhost:3000/api/health  # Botpress
curl http://localhost:5000/health      # ChatterBot

# Check logs
docker-compose logs -f rasa-server
docker-compose logs -f botpress
docker-compose logs -f chatterbot
```

### Performance Diagnostics

```bash
# Container resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Network connectivity
docker exec rasa-server ping postgres
docker exec botpress ping redis

# Database connections
docker exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Docker Swarm Mode](https://docs.docker.com/engine/swarm/)
- [Container Security Best Practices](https://docs.docker.com/engine/security/)
- [Production Deployment Guide](https://docs.docker.com/engine/swarm/stack-deploy/)

## 🤝 Contributing

1. Test your Docker configurations locally
2. Ensure all services start without errors
3. Add health checks for new services
4. Update documentation for configuration changes
5. Include monitoring for new components

## 📄 License

This deployment configuration is part of the Chatbot Solutions repository and follows the same license terms.

## 🏷️ Version

**Docker Version**: 20.0+  
**Compose Version**: 2.0+  
**Last Updated**: 2024