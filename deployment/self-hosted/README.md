# Self-Hosted Chatbot Deployment Guide

Complete guide for deploying chatbot solutions in self-hosted environments, including on-premises, private cloud, and edge computing scenarios.

## 🏠 Self-Hosted Deployment Options

### 1. Single Server Deployment
**Best for:** Small teams, development, proof-of-concept

```bash
# Minimum Requirements
CPU: 4 cores, 2.5GHz+
RAM: 8GB (16GB recommended)
Storage: 100GB SSD
Network: 100Mbps+
OS: Ubuntu 20.04 LTS, CentOS 8, RHEL 8
```

### 2. Multi-Server Cluster
**Best for:** Production environments, high availability

```bash
# Recommended Cluster Setup
- 3x Application Servers (Load Balanced)
- 2x Database Servers (Primary/Replica)
- 1x Reverse Proxy/Load Balancer
- 1x Monitoring/Logging Server
```

### 3. Container Orchestration
**Best for:** Scalable, cloud-native deployments

```bash
# Kubernetes Cluster Requirements
- 3x Master Nodes (HA Control Plane)
- 5+ Worker Nodes
- Persistent Storage (NFS/Ceph)
- Container Registry
```

## 🚀 Quick Deployment Scripts

### Ubuntu/Debian Installation
```bash
#!/bin/bash
# install-chatbot-ubuntu.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.11
sudo apt install -y python3.11 python3.11-pip python3.11-venv

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Clone chatbot repository
git clone https://github.com/dzp5103/Chatbot-solution.git
cd Chatbot-solution

# Run setup script
chmod +x deployment/self-hosted/setup.sh
sudo ./deployment/self-hosted/setup.sh

echo "🎉 Chatbot installation completed!"
echo "🌐 Access your chatbot at: http://$(hostname -I | awk '{print $1}')"
```

### CentOS/RHEL Installation
```bash
#!/bin/bash
# install-chatbot-centos.sh

# Update system
sudo yum update -y

# Install EPEL repository
sudo yum install -y epel-release

# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Python 3.11
sudo yum install -y python3.11 python3.11-pip

# Install PostgreSQL 14
sudo yum install -y postgresql14-server postgresql14
sudo /usr/pgsql-14/bin/postgresql-14-setup initdb
sudo systemctl start postgresql-14
sudo systemctl enable postgresql-14

# Install Redis
sudo yum install -y redis
sudo systemctl start redis
sudo systemctl enable redis

# Install Nginx
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3978/tcp
sudo firewall-cmd --reload

echo "🎉 CentOS/RHEL installation completed!"
```

## 🐳 Docker Deployment

### Production Docker Compose
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - rasa-chatbot
      - microsoft-bot
      - botpress-chatbot
    restart: unless-stopped
    networks:
      - chatbot-network

  # Rasa Chatbot Service
  rasa-chatbot:
    build:
      context: ./frameworks/rasa
      dockerfile: Dockerfile.production
    environment:
      - RASA_MODEL_PATH=/app/models
      - DATABASE_URL=postgresql://rasa:${RASA_DB_PASSWORD}@postgres:5432/rasa_db
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./data/rasa/models:/app/models
      - ./data/rasa/logs:/app/logs
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - chatbot-network
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
          cpus: '1.0'

  # Microsoft Bot Framework Service
  microsoft-bot:
    build:
      context: ./frameworks/microsoft-bot
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=3978
      - MicrosoftAppId=${MICROSOFT_APP_ID}
      - MicrosoftAppPassword=${MICROSOFT_APP_PASSWORD}
      - DATABASE_URL=postgresql://msbot:${MSBOT_DB_PASSWORD}@postgres:5432/msbot_db
    volumes:
      - ./data/microsoft-bot/logs:/app/logs
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - chatbot-network
    deploy:
      replicas: 2

  # Botpress Service
  botpress-chatbot:
    image: botpress/server:latest
    environment:
      - DATABASE_URL=postgres://botpress:${BOTPRESS_DB_PASSWORD}@postgres:5432/botpress_db
      - REDIS_URL=redis://redis:6379/1
      - BP_PRODUCTION=true
      - EXTERNAL_URL=https://yourdomain.com
    volumes:
      - ./data/botpress:/botpress/data
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - chatbot-network

  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=chatbot_main
      - POSTGRES_USER=chatbot_admin
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
      - ./database/backups:/backups
    restart: unless-stopped
    networks:
      - chatbot-network
    deploy:
      resources:
        limits:
          memory: 2G

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    restart: unless-stopped
    networks:
      - chatbot-network

  # Prometheus Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped
    networks:
      - chatbot-network

  # Grafana Dashboard
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    restart: unless-stopped
    networks:
      - chatbot-network

  # ELK Stack for Logging
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    restart: unless-stopped
    networks:
      - chatbot-network

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logging/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
    restart: unless-stopped
    networks:
      - chatbot-network

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    restart: unless-stopped
    networks:
      - chatbot-network

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
  elasticsearch_data:

networks:
  chatbot-network:
    driver: bridge
```

### Environment Configuration
```bash
# .env.production
# Database Configuration
POSTGRES_PASSWORD=your-secure-postgres-password
RASA_DB_PASSWORD=your-rasa-db-password
MSBOT_DB_PASSWORD=your-msbot-db-password
BOTPRESS_DB_PASSWORD=your-botpress-db-password
REDIS_PASSWORD=your-redis-password

# Bot Framework Configuration
MICROSOFT_APP_ID=your-microsoft-app-id
MICROSOFT_APP_PASSWORD=your-microsoft-app-password

# Monitoring Configuration
GRAFANA_PASSWORD=your-grafana-password

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/private.key

# Backup Configuration
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
```

## ⚙️ Kubernetes Deployment

### Namespace and Resources
```yaml
# k8s/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: chatbot-production
  labels:
    name: chatbot-production
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: chatbot-quota
  namespace: chatbot-production
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    persistentvolumeclaims: "10"
```

### Application Deployment
```yaml
# k8s/rasa-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rasa-chatbot
  namespace: chatbot-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rasa-chatbot
  template:
    metadata:
      labels:
        app: rasa-chatbot
    spec:
      containers:
      - name: rasa
        image: rasa/rasa:3.6.0
        ports:
        - containerPort: 5005
        env:
        - name: RASA_MODEL_PATH
          value: "/app/models"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: rasa-db-url
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /
            port: 5005
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 5005
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: rasa-models
          mountPath: /app/models
        - name: rasa-config
          mountPath: /app/config
      volumes:
      - name: rasa-models
        persistentVolumeClaim:
          claimName: rasa-models-pvc
      - name: rasa-config
        configMap:
          name: rasa-config
---
apiVersion: v1
kind: Service
metadata:
  name: rasa-service
  namespace: chatbot-production
spec:
  selector:
    app: rasa-chatbot
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5005
  type: ClusterIP
```

### Ingress Configuration
```yaml
# k8s/ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: chatbot-ingress
  namespace: chatbot-production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - chatbot.yourdomain.com
    secretName: chatbot-tls
  rules:
  - host: chatbot.yourdomain.com
    http:
      paths:
      - path: /rasa
        pathType: Prefix
        backend:
          service:
            name: rasa-service
            port:
              number: 80
      - path: /microsoft-bot
        pathType: Prefix
        backend:
          service:
            name: microsoft-bot-service
            port:
              number: 80
      - path: /botpress
        pathType: Prefix
        backend:
          service:
            name: botpress-service
            port:
              number: 80
```

## 🔒 Security Configuration

### Firewall Setup (UFW)
```bash
#!/bin/bash
# security/firewall-setup.sh

# Enable UFW
sudo ufw --force enable

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH access (change port as needed)
sudo ufw allow 22/tcp

# HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Bot Framework (if needed)
sudo ufw allow 3978/tcp

# Database (internal only)
sudo ufw allow from 10.0.0.0/8 to any port 5432

# Redis (internal only)
sudo ufw allow from 10.0.0.0/8 to any port 6379

# Monitoring
sudo ufw allow 9090/tcp  # Prometheus
sudo ufw allow 3001/tcp  # Grafana

# Log dropped packets
sudo ufw logging on

echo "🔒 Firewall configured successfully"
```

### SSL/TLS Certificate Setup
```bash
#!/bin/bash
# security/ssl-setup.sh

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate Let's Encrypt certificate
sudo certbot --nginx -d yourdomain.com -d chatbot.yourdomain.com

# Set up auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run

echo "🔐 SSL certificates configured successfully"
```

### Nginx Security Configuration
```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Upstream servers
    upstream rasa_backend {
        least_conn;
        server rasa-chatbot:5005 max_fails=3 fail_timeout=30s;
    }

    upstream microsoft_bot_backend {
        least_conn;
        server microsoft-bot:3978 max_fails=3 fail_timeout=30s;
    }

    # Main server block
    server {
        listen 443 ssl http2;
        server_name chatbot.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/private.key;

        # Rate limiting
        limit_req zone=api burst=20 nodelay;

        # Rasa API
        location /rasa/ {
            proxy_pass http://rasa_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_timeout 60s;
        }

        # Microsoft Bot Framework
        location /microsoft-bot/ {
            proxy_pass http://microsoft_bot_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_timeout 60s;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\\n";
            add_header Content-Type text/plain;
        }
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name chatbot.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }
}
```

## 📊 Monitoring and Maintenance

### Automated Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "🗄️ Backing up PostgreSQL databases..."
docker exec postgres pg_dumpall -U chatbot_admin > $BACKUP_DIR/postgres_$DATE.sql

# Application data backup
echo "📁 Backing up application data..."
tar -czf $BACKUP_DIR/app_data_$DATE.tar.gz /var/lib/docker/volumes/

# Models backup
echo "🤖 Backing up AI models..."
tar -czf $BACKUP_DIR/models_$DATE.tar.gz ./data/*/models/

# Configuration backup
echo "⚙️ Backing up configurations..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz ./nginx/ ./monitoring/ ./.env*

# Cleanup old backups
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "*.sql" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed: $DATE"
```

### Health Check Script
```bash
#!/bin/bash
# scripts/health-check.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🏥 Chatbot Health Check"
echo "======================"

# Check Docker services
echo -n "Docker Services: "
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Issues detected${NC}"
fi

# Check HTTP endpoints
echo -n "Rasa API: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost/rasa/ | grep -q "200"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
fi

echo -n "Microsoft Bot: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost/microsoft-bot/health | grep -q "200"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
fi

# Check database
echo -n "Database: "
if docker exec postgres pg_isready -U chatbot_admin | grep -q "accepting connections"; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Connection issues${NC}"
fi

# Check disk space
echo -n "Disk Space: "
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}✅ ${DISK_USAGE}% used${NC}"
elif [ $DISK_USAGE -lt 90 ]; then
    echo -e "${YELLOW}⚠️ ${DISK_USAGE}% used${NC}"
else
    echo -e "${RED}❌ ${DISK_USAGE}% used - Critical${NC}"
fi

# Check memory usage
echo -n "Memory Usage: "
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -lt 80 ]; then
    echo -e "${GREEN}✅ ${MEM_USAGE}% used${NC}"
elif [ $MEM_USAGE -lt 90 ]; then
    echo -e "${YELLOW}⚠️ ${MEM_USAGE}% used${NC}"
else
    echo -e "${RED}❌ ${MEM_USAGE}% used - Critical${NC}"
fi

echo ""
echo "Health check completed at $(date)"
```

## 🚀 Performance Optimization

### System Optimization
```bash
#!/bin/bash
# scripts/optimize-system.sh

# Kernel parameters for high-performance networking
cat > /etc/sysctl.d/99-chatbot-performance.conf << EOF
# Network performance
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.core.netdev_max_backlog = 30000
net.ipv4.tcp_congestion_control = bbr

# File descriptor limits
fs.file-max = 1000000
fs.nr_open = 1000000
EOF

# Apply changes
sysctl -p /etc/sysctl.d/99-chatbot-performance.conf

# Docker daemon optimization
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
EOF

# Restart Docker
systemctl restart docker

echo "🚀 System optimization completed"
```

## 📋 Maintenance Checklist

### Daily Tasks
- [ ] Check service health status
- [ ] Review error logs
- [ ] Monitor resource usage
- [ ] Verify backup completion

### Weekly Tasks
- [ ] Update security patches
- [ ] Review performance metrics
- [ ] Test backup restoration
- [ ] Clean up old logs

### Monthly Tasks
- [ ] Full system update
- [ ] Security vulnerability scan
- [ ] Performance optimization review
- [ ] Capacity planning assessment

This comprehensive self-hosted deployment guide provides everything needed to deploy, secure, monitor, and maintain chatbot solutions in self-managed environments.