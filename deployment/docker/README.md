# Docker Deployment Guide

This directory contains Docker configurations for deploying chatbot solutions across different environments.

## Structure

```
docker/
├── images/          # Custom Docker images
├── compose/         # Docker Compose configurations
├── swarm/          # Docker Swarm configurations
└── README.md       # This file
```

## Quick Start

### Single Container Deployment

```bash
# Build and run a basic chatbot
docker build -t my-chatbot .
docker run -p 5005:5005 my-chatbot
```

### Multi-Service Deployment

```bash
# Use docker-compose for full stack
docker-compose up -d
```

## Available Configurations

### 1. Basic Development Setup

**File:** `compose/development.yml`

```bash
docker-compose -f compose/development.yml up
```

**Features:**
- Single chatbot service
- Local file mounts
- Debug logging
- Hot reload

### 2. Production Setup

**File:** `compose/production.yml`

```bash
docker-compose -f compose/production.yml up -d
```

**Features:**
- Multi-replica services
- Database persistence
- Load balancing
- SSL termination
- Health checks
- Monitoring

### 3. Multi-Framework Setup

**File:** `compose/multi-framework.yml`

Deploy multiple chatbot frameworks simultaneously:

```bash
docker-compose -f compose/multi-framework.yml up -d
```

**Services:**
- Rasa chatbot (port 5005)
- Botpress chatbot (port 3000)
- Microsoft Bot (port 3978)
- Shared database
- Reverse proxy

## Environment Variables

Create `.env` file:

```bash
# Database
DB_HOST=localhost
DB_USER=chatbot
DB_PASSWORD=secure_password
DB_NAME=chatbot_db

# API Keys
OPENAI_API_KEY=your_key_here
DIALOGFLOW_PROJECT_ID=your_project

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_char_key

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL=info
```

## Custom Images

### Building Custom Images

```bash
# Build Rasa image
docker build -f images/rasa.Dockerfile -t custom-rasa .

# Build Botpress image
docker build -f images/botpress.Dockerfile -t custom-botpress .

# Build multi-stage image
docker build --target production -t chatbot-prod .
```

### Base Images Available

1. **rasa-base** - Optimized Rasa environment
2. **botpress-base** - Botpress with plugins
3. **node-chatbot** - Node.js chatbot runtime
4. **python-nlp** - Python with ML libraries

## Docker Swarm Deployment

For production clusters:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c swarm/chatbot-stack.yml chatbot

# Scale services
docker service scale chatbot_rasa=3
```

## Security Best Practices

### 1. Secrets Management

```bash
# Create secrets
echo "db_password" | docker secret create db_password -
echo "api_key" | docker secret create api_key -

# Use in compose
secrets:
  - db_password
  - api_key
```

### 2. Network Security

```yaml
networks:
  frontend:
    driver: overlay
  backend:
    driver: overlay
    internal: true
```

### 3. User Security

```dockerfile
# Don't run as root
RUN adduser --disabled-password --gecos '' chatbot
USER chatbot
```

## Monitoring and Logging

### Integrated Monitoring Stack

```bash
# Deploy with monitoring
docker-compose -f compose/production.yml -f compose/monitoring.yml up -d
```

**Includes:**
- Prometheus metrics
- Grafana dashboards
- ELK log aggregation
- Jaeger tracing

### Log Management

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Performance Optimization

### 1. Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

### 2. Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5005/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 3. Caching

```yaml
volumes:
  - model_cache:/app/models
  - npm_cache:/root/.npm
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   docker ps
   netstat -tulpn | grep :5005
   ```

2. **Memory Issues**
   ```bash
   # Monitor resource usage
   docker stats
   docker system df
   ```

3. **Network Issues**
   ```bash
   # Debug networking
   docker network ls
   docker network inspect bridge
   ```

### Debug Mode

```bash
# Run with debug
docker-compose -f compose/debug.yml up

# Access container
docker exec -it chatbot_rasa_1 bash

# View logs
docker-compose logs -f rasa
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build and Deploy
  run: |
    docker build -t chatbot:${{ github.sha }} .
    docker tag chatbot:${{ github.sha }} chatbot:latest
    docker-compose up -d
```

### Automated Testing

```bash
# Test container health
docker-compose -f compose/test.yml run --rm test
```

## Multi-Environment Support

### Development
```bash
docker-compose -f compose/development.yml up
```

### Staging
```bash
docker-compose -f compose/staging.yml up -d
```

### Production
```bash
docker-compose -f compose/production.yml up -d
```

## Backup and Recovery

### Database Backup

```bash
# Backup
docker exec postgres pg_dump -U user dbname > backup.sql

# Restore
docker exec -i postgres psql -U user dbname < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v chatbot_data:/data -v $(pwd):/backup alpine tar czf /backup/data.tar.gz -C /data .

# Restore volumes
docker run --rm -v chatbot_data:/data -v $(pwd):/backup alpine tar xzf /backup/data.tar.gz -C /data
```

## Advanced Configurations

### Custom Networks

```yaml
networks:
  chatbot_frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Service Discovery

```yaml
external_links:
  - service_name:alias
```

### Load Balancing

```yaml
deploy:
  replicas: 3
  update_config:
    parallelism: 1
    delay: 10s
```

This Docker deployment guide provides comprehensive configuration options for deploying chatbot solutions at any scale, from development to production environments.