# CI/CD Automation Tools for Chatbot Solutions

Comprehensive automation tools for continuous integration, deployment, testing, and monitoring of chatbot solutions across multiple frameworks and platforms.

## 🚀 Automation Overview

### Supported Automation
- **Continuous Integration**: Automated testing, linting, and building
- **Continuous Deployment**: Multi-environment deployment pipelines
- **Infrastructure as Code**: Automated infrastructure provisioning
- **Testing Automation**: Unit, integration, and conversation testing
- **Monitoring & Alerting**: Performance and health monitoring
- **Model Management**: ML model versioning and deployment

## 📁 Directory Structure

```
tools/automation/
├── ci-cd/                    # CI/CD pipeline configurations
│   ├── github-actions/       # GitHub Actions workflows
│   ├── gitlab-ci/           # GitLab CI configurations
│   ├── jenkins/             # Jenkins pipeline scripts
│   └── azure-devops/        # Azure DevOps pipelines
├── infrastructure/           # Infrastructure as Code
│   ├── terraform/           # Terraform configurations
│   ├── ansible/             # Ansible playbooks
│   ├── helm/                # Helm charts
│   └── cloudformation/      # AWS CloudFormation
├── testing/                 # Automated testing tools
│   ├── conversation-tests/   # Conversation flow testing
│   ├── load-testing/        # Performance testing scripts
│   ├── security-tests/      # Security testing automation
│   └── integration-tests/   # API integration testing
├── deployment/              # Deployment automation
│   ├── scripts/             # Deployment scripts
│   ├── containers/          # Container management
│   └── serverless/          # Serverless deployment
├── monitoring/              # Monitoring automation
│   ├── alerting/            # Alert configurations
│   ├── dashboards/          # Dashboard as code
│   └── logging/             # Log aggregation setup
└── model-management/        # ML model lifecycle
    ├── training/            # Automated model training
    ├── validation/          # Model validation scripts
    └── deployment/          # Model deployment automation
```

## 🔄 GitHub Actions Workflows

### Main CI/CD Pipeline
```yaml
# .github/workflows/chatbot-ci-cd.yml
name: Chatbot Solutions CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Code Quality and Testing
  quality-checks:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        framework: [rasa, microsoft-bot, botpress, dialogflow]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
        cache: 'pip'
    
    - name: Install dependencies
      run: |
        if [ -f "frameworks/${{ matrix.framework }}/package.json" ]; then
          cd frameworks/${{ matrix.framework }}
          npm ci
        fi
        if [ -f "frameworks/${{ matrix.framework }}/requirements.txt" ]; then
          cd frameworks/${{ matrix.framework }}
          pip install -r requirements.txt
        fi
    
    - name: Run linting
      run: |
        cd frameworks/${{ matrix.framework }}
        if [ -f "package.json" ]; then
          npm run lint || true
        fi
        if [ -f "requirements.txt" ]; then
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics || true
        fi
    
    - name: Run unit tests
      run: |
        cd frameworks/${{ matrix.framework }}
        if [ -f "package.json" ]; then
          npm test || true
        fi
        if [ -f "requirements.txt" ]; then
          pytest -v || true
        fi
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results-${{ matrix.framework }}
        path: |
          frameworks/${{ matrix.framework }}/test-results/
          frameworks/${{ matrix.framework }}/coverage/

  # Security Scanning
  security-scan:
    runs-on: ubuntu-latest
    needs: quality-checks
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
    
    - name: Dependency vulnerability scan
      run: |
        # Scan Node.js dependencies
        find . -name "package.json" -not -path "./node_modules/*" | while read package; do
          dir=$(dirname "$package")
          echo "Scanning $dir"
          cd "$dir"
          npm audit --audit-level moderate || true
          cd - > /dev/null
        done
        
        # Scan Python dependencies
        find . -name "requirements.txt" -not -path "./venv/*" | while read requirements; do
          dir=$(dirname "$requirements")
          echo "Scanning $dir"
          cd "$dir"
          pip-audit -r requirements.txt || true
          cd - > /dev/null
        done

  # Build Container Images
  build-images:
    runs-on: ubuntu-latest
    needs: [quality-checks, security-scan]
    if: github.event_name == 'push'
    
    strategy:
      matrix:
        framework: [rasa, microsoft-bot, botpress, simple-nodejs-bot]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.framework }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: frameworks/${{ matrix.framework }}
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # Integration Testing
  integration-tests:
    runs-on: ubuntu-latest
    needs: build-images
    if: github.event_name == 'push'
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: chatbot_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run integration tests
      run: |
        docker-compose -f deployment/docker/compose/test.yml up -d
        sleep 30  # Wait for services to start
        
        # Run API tests
        npm run test:integration
        
        # Run conversation flow tests
        npm run test:conversations
        
        # Cleanup
        docker-compose -f deployment/docker/compose/test.yml down

  # Deploy to Staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to staging
      run: |
        # Install kubectl
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        chmod +x kubectl
        sudo mv kubectl /usr/local/bin/
        
        # Configure kubectl
        echo "${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > ~/.kube/config
        
        # Deploy using Helm
        helm upgrade --install chatbot-staging ./deployment/kubernetes/helm \
          --namespace chatbot-staging \
          --set image.tag=${{ github.sha }} \
          --set environment=staging
    
    - name: Run smoke tests
      run: |
        # Wait for deployment
        kubectl rollout status deployment/chatbot-staging -n chatbot-staging
        
        # Run smoke tests
        npm run test:smoke -- --environment=staging

  # Deploy to Production
  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      run: |
        # Configure kubectl for production
        echo "${{ secrets.KUBE_CONFIG_PRODUCTION }}" | base64 -d > ~/.kube/config
        
        # Blue-green deployment
        helm upgrade --install chatbot-production ./deployment/kubernetes/helm \
          --namespace chatbot-production \
          --set image.tag=${{ github.sha }} \
          --set environment=production \
          --set strategy=blue-green
    
    - name: Health check
      run: |
        # Wait for deployment
        kubectl rollout status deployment/chatbot-production -n chatbot-production
        
        # Health check
        for i in {1..10}; do
          if curl -f https://chatbot.yourdomain.com/health; then
            echo "Health check passed"
            break
          fi
          sleep 30
        done
    
    - name: Notification
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### Model Training Automation
```yaml
# .github/workflows/model-training.yml
name: Automated Model Training

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM
  workflow_dispatch:
    inputs:
      framework:
        description: 'Framework to train'
        required: true
        default: 'rasa'
        type: choice
        options:
        - rasa
        - dialogflow
        - all

jobs:
  train-rasa-models:
    runs-on: ubuntu-latest
    if: ${{ github.event.inputs.framework == 'rasa' || github.event.inputs.framework == 'all' || github.event_name == 'schedule' }}
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install Rasa
      run: |
        pip install rasa[full]
    
    - name: Download training data
      run: |
        # Download latest training data from data source
        aws s3 sync s3://your-training-data-bucket/rasa/ frameworks/rasa/data/
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    
    - name: Train model
      run: |
        cd frameworks/rasa
        rasa train --out models/
    
    - name: Validate model
      run: |
        cd frameworks/rasa
        rasa test --model models/ --stories data/test_stories.yml
    
    - name: Upload model
      run: |
        # Upload trained model
        aws s3 cp frameworks/rasa/models/ s3://your-model-bucket/rasa/ --recursive
        
        # Update model registry
        python tools/model-management/register_model.py \
          --framework rasa \
          --version ${{ github.sha }} \
          --metrics-file frameworks/rasa/results/
    
    - name: Deploy model
      if: success()
      run: |
        # Deploy to staging first
        kubectl set image deployment/rasa-chatbot \
          rasa-container=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/rasa:${{ github.sha }} \
          -n chatbot-staging

  performance-benchmarking:
    runs-on: ubuntu-latest
    needs: train-rasa-models
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run performance benchmarks
      run: |
        # Install Artillery
        npm install -g artillery
        
        # Run load tests
        artillery run tools/automation/testing/load-testing/chatbot-load-test.yml
        
        # Generate report
        artillery report artillery_report.json
    
    - name: Upload benchmark results
      uses: actions/upload-artifact@v3
      with:
        name: performance-results
        path: artillery_report.html
```

## 🏗️ Infrastructure as Code

### Terraform Configuration
```hcl
# infrastructure/terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "chatbot-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-west-2a", "us-west-2b", "us-west-2c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = true
  
  tags = {
    Environment = var.environment
    Project     = "chatbot-solutions"
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "chatbot-cluster-${var.environment}"
  cluster_version = "1.28"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  eks_managed_node_groups = {
    chatbot_nodes = {
      min_size     = 2
      max_size     = 10
      desired_size = 3
      
      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
      
      labels = {
        Environment = var.environment
        NodeGroup   = "chatbot-nodes"
      }
      
      taints = []
    }
  }
  
  tags = {
    Environment = var.environment
    Project     = "chatbot-solutions"
  }
}

# RDS Database
resource "aws_db_instance" "chatbot_db" {
  identifier     = "chatbot-db-${var.environment}"
  engine         = "postgres"
  engine_version = "14.9"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "chatbot"
  username = "chatbot_admin"
  password = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.chatbot.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  
  tags = {
    Environment = var.environment
    Project     = "chatbot-solutions"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "chatbot" {
  name       = "chatbot-cache-subnet-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_replication_group" "chatbot" {
  replication_group_id       = "chatbot-redis-${var.environment}"
  description                = "Redis cluster for chatbot sessions"
  
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled           = true
  
  subnet_group_name = aws_elasticache_subnet_group.chatbot.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Environment = var.environment
    Project     = "chatbot-solutions"
  }
}

# S3 Buckets
resource "aws_s3_bucket" "chatbot_models" {
  bucket = "chatbot-models-${var.environment}-${random_id.bucket_suffix.hex}"
  
  tags = {
    Environment = var.environment
    Project     = "chatbot-solutions"
    Purpose     = "model-storage"
  }
}

resource "aws_s3_bucket_versioning" "chatbot_models" {
  bucket = aws_s3_bucket.chatbot_models.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "chatbot_models" {
  bucket = aws_s3_bucket.chatbot_models.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Application Load Balancer
resource "aws_lb" "chatbot_alb" {
  name               = "chatbot-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
  
  enable_deletion_protection = var.environment == "production"
  
  tags = {
    Environment = var.environment
    Project     = "chatbot-solutions"
  }
}

# Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.chatbot_db.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.chatbot.primary_endpoint_address
  sensitive   = true
}
```

### Ansible Deployment Playbook
```yaml
# infrastructure/ansible/deploy-chatbot.yml
---
- name: Deploy Chatbot Solutions
  hosts: chatbot_servers
  become: yes
  vars:
    docker_compose_version: "2.23.0"
    node_version: "18"
    python_version: "3.11"
    
  tasks:
    - name: Update system packages
      apt:
        update_cache: yes
        upgrade: dist
        autoremove: yes
      when: ansible_os_family == "Debian"
    
    - name: Install required packages
      apt:
        name:
          - curl
          - wget
          - git
          - unzip
          - software-properties-common
          - apt-transport-https
          - ca-certificates
          - gnupg
          - lsb-release
        state: present
      when: ansible_os_family == "Debian"
    
    - name: Install Docker
      shell: |
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $USER
      args:
        creates: /usr/bin/docker
    
    - name: Install Docker Compose
      get_url:
        url: "https://github.com/docker/compose/releases/download/v{{ docker_compose_version }}/docker-compose-linux-x86_64"
        dest: /usr/local/bin/docker-compose
        mode: '0755'
    
    - name: Install Node.js
      shell: |
        curl -fsSL https://deb.nodesource.com/setup_{{ node_version }}.x | bash -
        apt-get install -y nodejs
      args:
        creates: /usr/bin/node
      when: ansible_os_family == "Debian"
    
    - name: Install Python
      apt:
        name:
          - python{{ python_version }}
          - python{{ python_version }}-pip
          - python{{ python_version }}-venv
        state: present
      when: ansible_os_family == "Debian"
    
    - name: Create application directory
      file:
        path: /opt/chatbot-solutions
        state: directory
        owner: "{{ ansible_user }}"
        group: "{{ ansible_user }}"
        mode: '0755'
    
    - name: Clone repository
      git:
        repo: https://github.com/dzp5103/Chatbot-solution.git
        dest: /opt/chatbot-solutions
        version: "{{ git_branch | default('main') }}"
        force: yes
      become_user: "{{ ansible_user }}"
    
    - name: Copy environment files
      template:
        src: "{{ item.src }}"
        dest: "/opt/chatbot-solutions/{{ item.dest }}"
        owner: "{{ ansible_user }}"
        group: "{{ ansible_user }}"
        mode: '0600'
      loop:
        - { src: '.env.j2', dest: '.env' }
        - { src: 'docker-compose.override.yml.j2', dest: 'docker-compose.override.yml' }
    
    - name: Install application dependencies
      shell: |
        cd /opt/chatbot-solutions
        find . -name "package.json" -not -path "./node_modules/*" | while read package; do
          dir=$(dirname "$package")
          echo "Installing dependencies in $dir"
          cd "$dir"
          npm ci --production
          cd - > /dev/null
        done
      become_user: "{{ ansible_user }}"
    
    - name: Create systemd service
      template:
        src: chatbot-solutions.service.j2
        dest: /etc/systemd/system/chatbot-solutions.service
        mode: '0644'
      notify: reload systemd
    
    - name: Start and enable service
      systemd:
        name: chatbot-solutions
        state: started
        enabled: yes
        daemon_reload: yes
    
    - name: Configure firewall
      ufw:
        rule: allow
        port: "{{ item }}"
        proto: tcp
      loop:
        - "80"
        - "443"
        - "3978"
      when: configure_firewall | default(true)
    
    - name: Setup log rotation
      template:
        src: chatbot-logrotate.j2
        dest: /etc/logrotate.d/chatbot-solutions
        mode: '0644'
    
    - name: Setup backup cron job
      cron:
        name: "Backup chatbot data"
        minute: "0"
        hour: "2"
        job: "/opt/chatbot-solutions/tools/automation/scripts/backup.sh"
        user: "{{ ansible_user }}"
      when: setup_backups | default(true)

  handlers:
    - name: reload systemd
      systemd:
        daemon_reload: yes
```

## 🧪 Automated Testing

### Conversation Flow Testing
```javascript
// testing/conversation-tests/conversation-flow-test.js
const { ConversationTester } = require('./utils/conversation-tester');
const { expect } = require('chai');

describe('Multi-Framework Conversation Testing', () => {
    const frameworks = ['rasa', 'microsoft-bot', 'dialogflow'];
    
    frameworks.forEach(framework => {
        describe(`${framework} Conversation Tests`, () => {
            let tester;
            
            before(async () => {
                tester = new ConversationTester(framework);
                await tester.initialize();
            });
            
            it('should handle greeting flow', async () => {
                const conversation = await tester.startConversation();
                
                const response1 = await conversation.send('Hello');
                expect(response1.intent).to.equal('greeting');
                expect(response1.confidence).to.be.above(0.8);
                
                const response2 = await conversation.send('How are you?');
                expect(response2.text).to.include('fine');
            });
            
            it('should complete appointment booking flow', async () => {
                const conversation = await tester.startConversation();
                
                await conversation.send('I want to book an appointment');
                expect(conversation.currentIntent).to.equal('booking');
                
                await conversation.send('consultation');
                expect(conversation.hasSlot('appointment_type')).to.be.true;
                
                await conversation.send('tomorrow');
                expect(conversation.hasSlot('date')).to.be.true;
                
                await conversation.send('2 PM');
                expect(conversation.hasSlot('time')).to.be.true;
                
                const finalResponse = await conversation.send('yes');
                expect(finalResponse.text).to.include('confirmed');
                expect(conversation.isComplete).to.be.true;
            });
            
            it('should handle context switching', async () => {
                const conversation = await tester.startConversation();
                
                await conversation.send('Book appointment');
                await conversation.send('What\'s the weather?');
                
                // Should switch context to weather
                expect(conversation.currentIntent).to.equal('weather');
                
                await conversation.send('Never mind, back to booking');
                // Should return to booking context
                expect(conversation.currentIntent).to.equal('booking');
            });
            
            after(async () => {
                await tester.cleanup();
            });
        });
    });
});
```

### Load Testing Configuration
```yaml
# testing/load-testing/chatbot-load-test.yml
config:
  target: 'https://chatbot.yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 5
    - duration: 120
      arrivalRate: 10
    - duration: 60
      arrivalRate: 20
  defaults:
    headers:
      Content-Type: 'application/json'
      Authorization: 'Bearer {{ $randomString() }}'

scenarios:
  - name: 'Greeting Flow'
    weight: 30
    flow:
      - post:
          url: '/rasa/webhooks/rest/webhook'
          json:
            sender: 'user{{ $randomInt(1, 1000) }}'
            message: 'Hello'
          capture:
            - json: '$[0].text'
              as: 'response'
      - think: 2
      - post:
          url: '/rasa/webhooks/rest/webhook'
          json:
            sender: 'user{{ $randomInt(1, 1000) }}'
            message: 'How can you help me?'

  - name: 'Booking Flow'
    weight: 50
    flow:
      - post:
          url: '/rasa/webhooks/rest/webhook'
          json:
            sender: 'user{{ $randomInt(1, 1000) }}'
            message: 'I want to book an appointment'
      - think: 3
      - post:
          url: '/rasa/webhooks/rest/webhook'
          json:
            sender: 'user{{ $randomInt(1, 1000) }}'
            message: 'consultation'
      - think: 2
      - post:
          url: '/rasa/webhooks/rest/webhook'
          json:
            sender: 'user{{ $randomInt(1, 1000) }}'
            message: 'tomorrow'
      - think: 2
      - post:
          url: '/rasa/webhooks/rest/webhook'
          json:
            sender: 'user{{ $randomInt(1, 1000) }}'
            message: '2 PM'

  - name: 'Weather Inquiry'
    weight: 20
    flow:
      - post:
          url: '/rasa/webhooks/rest/webhook'
          json:
            sender: 'user{{ $randomInt(1, 1000) }}'
            message: 'What\'s the weather like?'
      - think: 1
      - post:
          url: '/rasa/webhooks/rest/webhook'
          json:
            sender: 'user{{ $randomInt(1, 1000) }}'
            message: 'in New York'
```

## 📊 Monitoring Automation

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "chatbot_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'chatbot-rasa'
    static_configs:
      - targets: ['rasa-chatbot:5005']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'chatbot-microsoft-bot'
    static_configs:
      - targets: ['microsoft-bot:3978']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'chatbot-nginx'
    static_configs:
      - targets: ['nginx:9113']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Alert Rules
```yaml
# monitoring/alerting/chatbot_rules.yml
groups:
  - name: chatbot.rules
    rules:
      - alert: ChatbotHighErrorRate
        expr: rate(chatbot_errors_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected in chatbot"
          description: "Error rate is {{ $value }} errors per second"

      - alert: ChatbotHighLatency
        expr: histogram_quantile(0.95, rate(chatbot_response_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response latency detected"
          description: "95th percentile latency is {{ $value }}s"

      - alert: ChatbotDown
        expr: up{job=~"chatbot-.*"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Chatbot service is down"
          description: "{{ $labels.instance }} has been down for more than 1 minute"

      - alert: DatabaseConnectionFailure
        expr: postgres_up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failure"
          description: "PostgreSQL database is unreachable"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"
```

This comprehensive automation suite provides everything needed to implement robust CI/CD pipelines, infrastructure management, and monitoring for chatbot solutions across multiple frameworks and deployment environments.