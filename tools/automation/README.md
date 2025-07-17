# Automation Tools

Collection of CI/CD scripts, deployment automation, and monitoring tools for chatbot solutions.

## 🚀 Quick Start

```bash
# Run deployment automation
cd tools/automation/
./scripts/deploy-all.sh

# Setup monitoring
./scripts/setup-monitoring.sh

# Run health checks
./scripts/health-check.sh
```

## 📋 Available Tools

### Deployment Automation
- **deploy-all.sh** - Deploy all chatbot frameworks
- **deploy-framework.sh** - Deploy specific framework
- **rollback.sh** - Rollback to previous version
- **scale-services.sh** - Auto-scale based on load

### CI/CD Integration
- **github-actions/** - GitHub Actions workflows
- **jenkins/** - Jenkins pipeline configurations
- **gitlab-ci/** - GitLab CI configurations
- **azure-devops/** - Azure DevOps pipelines

### Monitoring & Alerts
- **setup-monitoring.sh** - Setup Prometheus & Grafana
- **health-check.sh** - Comprehensive health monitoring
- **alert-manager.yml** - Alert configurations
- **dashboards/** - Grafana dashboard templates

### Testing Automation
- **run-tests.sh** - Execute all test suites
- **load-test.sh** - Performance testing
- **security-scan.sh** - Security vulnerability scanning
- **backup-restore.sh** - Database backup automation

## 🏗️ Project Structure

```
tools/automation/
├── 📁 scripts/                   # Automation scripts
│   ├── deploy-all.sh            # Complete deployment
│   ├── deploy-framework.sh      # Single framework deployment
│   ├── health-check.sh          # Health monitoring
│   ├── setup-monitoring.sh      # Monitoring setup
│   ├── backup-restore.sh        # Data management
│   ├── load-test.sh             # Performance testing
│   └── security-scan.sh         # Security scanning
├── 📁 ci-cd/                     # CI/CD configurations
│   ├── github-actions/          # GitHub Actions workflows
│   ├── jenkins/                 # Jenkins pipelines
│   ├── gitlab-ci/               # GitLab CI configs
│   └── azure-devops/            # Azure DevOps pipelines
├── 📁 monitoring/                # Monitoring configurations
│   ├── prometheus/              # Prometheus configs
│   ├── grafana/                 # Grafana dashboards
│   ├── alertmanager/            # Alert configurations
│   └── exporters/               # Custom metric exporters
├── 📁 terraform/                # Infrastructure as Code
│   ├── aws/                     # AWS infrastructure
│   ├── gcp/                     # Google Cloud infrastructure
│   ├── azure/                   # Azure infrastructure
│   └── modules/                 # Reusable Terraform modules
└── 📖 README.md                 # This file
```

## 🔧 Script Usage

### Deployment Scripts

**Deploy All Frameworks:**
```bash
./scripts/deploy-all.sh [environment]
# Example: ./scripts/deploy-all.sh production
```

**Deploy Specific Framework:**
```bash
./scripts/deploy-framework.sh <framework> [environment]
# Example: ./scripts/deploy-framework.sh rasa staging
```

**Rollback Deployment:**
```bash
./scripts/rollback.sh <framework> [version]
# Example: ./scripts/rollback.sh botpress v1.2.3
```

### Monitoring Scripts

**Setup Monitoring Stack:**
```bash
./scripts/setup-monitoring.sh
# Installs Prometheus, Grafana, and AlertManager
```

**Health Check:**
```bash
./scripts/health-check.sh
# Returns: OK, WARNING, or CRITICAL with details
```

**Load Testing:**
```bash
./scripts/load-test.sh <target_url> [duration] [users]
# Example: ./scripts/load-test.sh http://localhost:5005 5m 100
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Chatbots

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: ./tools/automation/scripts/run-tests.sh

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy All Frameworks
        run: ./tools/automation/scripts/deploy-all.sh production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  monitor:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - name: Health Check
        run: ./tools/automation/scripts/health-check.sh
      - name: Load Test
        run: ./tools/automation/scripts/load-test.sh ${{ env.PRODUCTION_URL }}
```

### Jenkins Pipeline

```groovy
// jenkins/Jenkinsfile
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        KUBECONFIG = credentials('kubeconfig')
    }
    
    stages {
        stage('Test') {
            steps {
                sh './tools/automation/scripts/run-tests.sh'
            }
        }
        
        stage('Build') {
            steps {
                sh './tools/automation/scripts/build-images.sh'
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './tools/automation/scripts/deploy-all.sh production'
            }
        }
        
        stage('Monitor') {
            steps {
                sh './tools/automation/scripts/health-check.sh'
            }
        }
    }
    
    post {
        failure {
            sh './tools/automation/scripts/rollback.sh all latest'
        }
    }
}
```

## 📊 Monitoring Configuration

### Prometheus Configuration

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'rasa'
    static_configs:
      - targets: ['rasa-server:5005']
    metrics_path: '/api/health'
    
  - job_name: 'botpress'
    static_configs:
      - targets: ['botpress:3000']
    metrics_path: '/api/health'
    
  - job_name: 'chatterbot'
    static_configs:
      - targets: ['chatterbot:5000']
    metrics_path: '/health'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "Chatbot Metrics",
    "panels": [
      {
        "title": "Response Times",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph", 
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security Automation

### Security Scanning

```bash
#!/bin/bash
# scripts/security-scan.sh

echo "🔍 Running security scans..."

# Container image scanning
echo "Scanning container images..."
trivy image --severity HIGH,CRITICAL rasa-server:latest
trivy image --severity HIGH,CRITICAL botpress:latest
trivy image --severity HIGH,CRITICAL chatterbot:latest

# Dependency scanning
echo "Scanning dependencies..."
cd frameworks/rasa && safety check
cd ../botpress && npm audit --audit-level high
cd ../chatterbot && safety check

# Infrastructure scanning
echo "Scanning infrastructure..."
checkov -d deployment/kubernetes/ --framework kubernetes

# SSL/TLS configuration
echo "Checking SSL configuration..."
testssl.sh --quiet https://your-chatbot-domain.com

echo "✅ Security scan completed"
```

### Secrets Management

```bash
#!/bin/bash
# scripts/manage-secrets.sh

case "$1" in
  "create")
    kubectl create secret generic chatbot-secrets \
      --from-literal=database-password="$DB_PASSWORD" \
      --from-literal=api-key="$API_KEY" \
      --from-literal=jwt-secret="$JWT_SECRET"
    ;;
  "rotate")
    # Rotate secrets safely
    kubectl patch secret chatbot-secrets -p='{"data":{"database-password":"'$(echo -n "$NEW_DB_PASSWORD" | base64)'"}}'
    ;;
  "backup")
    kubectl get secrets -o yaml > secrets-backup-$(date +%Y%m%d).yml
    ;;
esac
```

## 🏗️ Infrastructure as Code

### Terraform AWS

```hcl
# terraform/aws/main.tf
provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "../modules/vpc"
  
  vpc_cidr = "10.0.0.0/16"
  availability_zones = ["us-west-2a", "us-west-2b"]
}

module "eks" {
  source = "../modules/eks"
  
  cluster_name = "chatbot-cluster"
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
}

module "rds" {
  source = "../modules/rds"
  
  identifier = "chatbot-db"
  engine = "postgres"
  engine_version = "13.7"
  instance_class = "db.t3.medium"
  allocated_storage = 100
  
  vpc_security_group_ids = [module.vpc.database_security_group_id]
  subnet_group_name = module.vpc.database_subnet_group_name
}
```

### Kubernetes Deployments

```yaml
# scripts/k8s-deploy.yml
apiVersion: v1
kind: Namespace
metadata:
  name: chatbots

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rasa-deployment
  namespace: chatbots
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rasa
  template:
    metadata:
      labels:
        app: rasa
    spec:
      containers:
      - name: rasa
        image: rasa/rasa:latest
        ports:
        - containerPort: 5005
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: chatbot-secrets
              key: database-url
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1"
```

## 📈 Performance Optimization

### Auto-Scaling

```bash
#!/bin/bash
# scripts/auto-scale.sh

# Get current CPU usage
CPU_USAGE=$(kubectl top pods -n chatbots | grep rasa | awk '{print $3}' | sed 's/%//')

# Scale up if CPU > 80%
if [ "$CPU_USAGE" -gt 80 ]; then
    kubectl scale deployment rasa-deployment --replicas=5 -n chatbots
    echo "Scaled up Rasa deployment to 5 replicas"
fi

# Scale down if CPU < 30%
if [ "$CPU_USAGE" -lt 30 ]; then
    kubectl scale deployment rasa-deployment --replicas=2 -n chatbots
    echo "Scaled down Rasa deployment to 2 replicas"
fi
```

### Database Optimization

```sql
-- scripts/optimize-db.sql
-- PostgreSQL optimization queries

-- Analyze query performance
ANALYZE;

-- Update statistics
UPDATE pg_stat_user_tables SET n_tup_ins = 0, n_tup_upd = 0, n_tup_del = 0;

-- Index recommendations
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;

-- Vacuum and reindex
VACUUM ANALYZE;
REINDEX DATABASE chatbot;
```

## 🚨 Troubleshooting Automation

### Log Aggregation

```bash
#!/bin/bash
# scripts/collect-logs.sh

mkdir -p logs/$(date +%Y%m%d)

# Collect container logs
docker-compose logs --no-color > logs/$(date +%Y%m%d)/docker-compose.log

# Collect Kubernetes logs
kubectl logs -n chatbots -l app=rasa > logs/$(date +%Y%m%d)/rasa.log
kubectl logs -n chatbots -l app=botpress > logs/$(date +%Y%m%d)/botpress.log

# Collect system logs
journalctl --since "1 hour ago" > logs/$(date +%Y%m%d)/system.log

# Create archive
tar -czf logs-$(date +%Y%m%d-%H%M).tar.gz logs/$(date +%Y%m%d)/
```

### Automated Debugging

```bash
#!/bin/bash
# scripts/debug-issues.sh

echo "🔍 Running automated diagnostics..."

# Check service health
for service in rasa botpress chatterbot; do
    if ! curl -f "http://localhost:$($service_port)/health" > /dev/null 2>&1; then
        echo "❌ $service is unhealthy"
        docker-compose logs $service | tail -50
    else
        echo "✅ $service is healthy"
    fi
done

# Check resource usage
echo "📊 Resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Check database connections
echo "🗄️ Database connections:"
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

echo "✅ Diagnostics completed"
```

## 📚 Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

1. Add new automation scripts with proper error handling
2. Include comprehensive logging and monitoring
3. Test scripts in staging before production
4. Document script parameters and usage
5. Follow security best practices

## 📄 License

This automation toolkit is part of the Chatbot Solutions repository and follows the same license terms.

## 🏷️ Version

**Automation Version**: 1.0.0  
**Last Updated**: 2024