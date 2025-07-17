# Monitoring and Analytics Solutions for Chatbot Platforms

Comprehensive monitoring, analytics, and observability solutions for chatbot deployments across multiple frameworks and environments.

## 📊 Monitoring Overview

### Monitoring Stack
- **Metrics Collection**: Prometheus, InfluxDB, CloudWatch
- **Visualization**: Grafana, Kibana, DataDog dashboards
- **Alerting**: AlertManager, PagerDuty, Slack notifications
- **Logging**: ELK Stack, Fluentd, CloudWatch Logs
- **Tracing**: Jaeger, Zipkin, AWS X-Ray
- **APM**: New Relic, Datadog, AppDynamics

## 🎯 Key Metrics and KPIs

### Conversation Metrics
- **Response Time**: Average, P95, P99 response latencies
- **Intent Recognition Accuracy**: Confidence scores and accuracy rates
- **Conversation Completion Rate**: Successful task completion percentage
- **User Satisfaction**: Ratings and feedback scores
- **Session Duration**: Average conversation length
- **Bounce Rate**: Users leaving after first message

### Technical Metrics
- **API Performance**: Request/response times, throughput
- **Error Rates**: 4xx/5xx errors, failed requests
- **Resource Utilization**: CPU, memory, disk usage
- **Database Performance**: Query times, connection pools
- **Cache Hit Rates**: Redis/Memcached performance
- **Network Latency**: Inter-service communication

### Business Metrics
- **User Engagement**: Daily/monthly active users
- **Goal Conversion**: Booking completions, purchases
- **Cost Per Conversation**: Infrastructure costs per interaction
- **Automation Rate**: Percentage of queries handled without escalation
- **Customer Effort Score**: Ease of task completion

## 📁 Directory Structure

```
tools/monitoring/
├── dashboards/                # Grafana dashboards
│   ├── chatbot-overview.json  # High-level metrics dashboard
│   ├── performance.json       # Performance monitoring
│   ├── business-metrics.json  # Business KPI dashboard
│   └── infrastructure.json    # Infrastructure monitoring
├── alerting/                  # Alert configurations
│   ├── prometheus-rules.yml   # Prometheus alerting rules
│   ├── alertmanager.yml      # AlertManager configuration
│   └── notifications/         # Notification templates
├── logging/                   # Log management
│   ├── logstash.conf         # Logstash configuration
│   ├── fluentd.conf          # Fluentd configuration
│   └── log-analysis/         # Log analysis scripts
├── metrics/                   # Custom metrics
│   ├── collectors/           # Custom metric collectors
│   ├── exporters/            # Prometheus exporters
│   └── processors/           # Metric processing scripts
├── tracing/                   # Distributed tracing
│   ├── jaeger-config.yml     # Jaeger configuration
│   └── instrumentation/      # Tracing instrumentation
└── scripts/                   # Monitoring automation
    ├── health-checks.sh      # Health check scripts
    ├── backup-metrics.sh     # Metrics backup automation
    └── report-generation.py  # Automated reporting
```

## 🎨 Grafana Dashboards

### Chatbot Overview Dashboard
```json
{
  "dashboard": {
    "id": null,
    "title": "Chatbot Solutions - Overview",
    "tags": ["chatbot", "overview"],
    "timezone": "browser",
    "refresh": "30s",
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "panels": [
      {
        "id": 1,
        "title": "Total Conversations",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(increase(chatbot_conversations_total[1h]))",
            "legendFormat": "Conversations/hour"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {"mode": "thresholds"},
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 100},
                {"color": "red", "value": 500}
              ]
            }
          }
        },
        "gridPos": {"h": 4, "w": 6, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "Average Response Time",
        "type": "stat",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(chatbot_response_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "s",
            "color": {"mode": "thresholds"},
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 1},
                {"color": "red", "value": 3}
              ]
            }
          }
        },
        "gridPos": {"h": 4, "w": 6, "x": 6, "y": 0}
      },
      {
        "id": 3,
        "title": "Intent Recognition Accuracy",
        "type": "stat",
        "targets": [
          {
            "expr": "avg(chatbot_intent_confidence_score)",
            "legendFormat": "Average Confidence"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "min": 0,
            "max": 100,
            "color": {"mode": "thresholds"},
            "thresholds": {
              "steps": [
                {"color": "red", "value": null},
                {"color": "yellow", "value": 60},
                {"color": "green", "value": 80}
              ]
            }
          }
        },
        "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0}
      },
      {
        "id": 4,
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(chatbot_errors_total[5m]) * 100",
            "legendFormat": "Errors/minute"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "color": {"mode": "thresholds"},
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 1},
                {"color": "red", "value": 5}
              ]
            }
          }
        },
        "gridPos": {"h": 4, "w": 6, "x": 18, "y": 0}
      },
      {
        "id": 5,
        "title": "Conversations Over Time",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(chatbot_conversations_total[1m])",
            "legendFormat": "{{framework}} - {{instance}}"
          }
        ],
        "yAxes": [
          {
            "label": "Conversations per minute",
            "min": 0
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 4}
      },
      {
        "id": 6,
        "title": "Response Time Distribution",
        "type": "heatmap",
        "targets": [
          {
            "expr": "rate(chatbot_response_duration_seconds_bucket[5m])",
            "legendFormat": "{{le}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 4}
      },
      {
        "id": 7,
        "title": "Top Intents",
        "type": "piechart",
        "targets": [
          {
            "expr": "topk(10, sum by (intent_name) (increase(chatbot_intent_detections_total[1h])))",
            "legendFormat": "{{intent_name}}"
          }
        ],
        "gridPos": {"h": 8, "w": 8, "x": 0, "y": 12}
      },
      {
        "id": 8,
        "title": "Framework Performance Comparison",
        "type": "table",
        "targets": [
          {
            "expr": "avg by (framework) (chatbot_response_duration_seconds)",
            "legendFormat": "Response Time"
          },
          {
            "expr": "rate(chatbot_conversations_total[1h]) by (framework)",
            "legendFormat": "Conversations/hour"
          },
          {
            "expr": "avg by (framework) (chatbot_intent_confidence_score)",
            "legendFormat": "Avg Confidence"
          }
        ],
        "gridPos": {"h": 8, "w": 16, "x": 8, "y": 12}
      }
    ]
  }
}
```

### Business Metrics Dashboard
```json
{
  "dashboard": {
    "title": "Chatbot Business Metrics",
    "panels": [
      {
        "title": "Daily Active Users",
        "type": "graph",
        "targets": [
          {
            "expr": "count(increase(chatbot_unique_users_total[24h]))",
            "legendFormat": "DAU"
          }
        ]
      },
      {
        "title": "Conversion Funnel",
        "type": "table",
        "targets": [
          {
            "expr": "sum(chatbot_conversation_started_total)",
            "legendFormat": "Started"
          },
          {
            "expr": "sum(chatbot_booking_attempted_total)",
            "legendFormat": "Booking Attempted"
          },
          {
            "expr": "sum(chatbot_booking_completed_total)",
            "legendFormat": "Booking Completed"
          }
        ]
      },
      {
        "title": "Customer Satisfaction Score",
        "type": "gauge",
        "targets": [
          {
            "expr": "avg(chatbot_satisfaction_rating)",
            "legendFormat": "Average Rating"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "min": 1,
            "max": 5,
            "thresholds": {
              "steps": [
                {"color": "red", "value": 1},
                {"color": "yellow", "value": 3},
                {"color": "green", "value": 4}
              ]
            }
          }
        }
      }
    ]
  }
}
```

## 🚨 Alerting Configuration

### Prometheus Alert Rules
```yaml
# alerting/prometheus-rules.yml
groups:
  - name: chatbot.performance
    rules:
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(chatbot_response_duration_seconds_bucket[5m])) > 3
        for: 5m
        labels:
          severity: warning
          service: chatbot
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s for {{ $labels.framework }}"
          runbook_url: "https://docs.company.com/runbooks/chatbot-performance"

      - alert: LowIntentConfidence
        expr: avg(chatbot_intent_confidence_score) < 0.6
        for: 10m
        labels:
          severity: warning
          service: chatbot
        annotations:
          summary: "Low intent recognition confidence"
          description: "Average intent confidence is {{ $value | humanizePercentage }}"
          action: "Review NLU training data and model performance"

      - alert: HighErrorRate
        expr: rate(chatbot_errors_total[5m]) > 0.1
        for: 3m
        labels:
          severity: critical
          service: chatbot
        annotations:
          summary: "High error rate in chatbot"
          description: "Error rate is {{ $value | humanize }} errors/second"
          action: "Check logs and service health immediately"

      - alert: ConversationDropoff
        expr: (rate(chatbot_conversation_started_total[1h]) - rate(chatbot_conversation_completed_total[1h])) / rate(chatbot_conversation_started_total[1h]) > 0.7
        for: 15m
        labels:
          severity: warning
          service: chatbot
        annotations:
          summary: "High conversation abandonment rate"
          description: "{{ $value | humanizePercentage }} of conversations are not completing"

  - name: chatbot.infrastructure
    rules:
      - alert: ServiceDown
        expr: up{job=~"chatbot-.*"} == 0
        for: 1m
        labels:
          severity: critical
          service: "{{ $labels.job }}"
        annotations:
          summary: "Chatbot service is down"
          description: "{{ $labels.instance }} has been down for more than 1 minute"
          action: "Restart service and check logs"

      - alert: DatabaseConnectionFailure
        expr: chatbot_database_connections_active == 0
        for: 2m
        labels:
          severity: critical
          service: database
        annotations:
          summary: "Database connection failure"
          description: "No active database connections detected"

      - alert: HighMemoryUsage
        expr: (chatbot_memory_usage_bytes / chatbot_memory_limit_bytes) > 0.9
        for: 5m
        labels:
          severity: warning
          service: "{{ $labels.service }}"
        annotations:
          summary: "High memory usage"
          description: "{{ $labels.service }} memory usage is {{ $value | humanizePercentage }}"

  - name: chatbot.business
    rules:
      - alert: LowUserEngagement
        expr: increase(chatbot_unique_users_total[24h]) < 100
        for: 1h
        labels:
          severity: warning
          service: chatbot
        annotations:
          summary: "Low user engagement"
          description: "Only {{ $value }} unique users in the last 24 hours"

      - alert: BookingConversionDrop
        expr: (rate(chatbot_booking_completed_total[4h]) / rate(chatbot_booking_attempted_total[4h])) < 0.5
        for: 30m
        labels:
          severity: warning
          service: chatbot
        annotations:
          summary: "Low booking conversion rate"
          description: "Booking conversion rate is {{ $value | humanizePercentage }}"
```

### AlertManager Configuration
```yaml
# alerting/alertmanager.yml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@company.com'
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
    continue: true
  - match:
      service: chatbot
    receiver: 'chatbot-team'

receivers:
- name: 'default'
  email_configs:
  - to: 'ops-team@company.com'
    subject: 'Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}

- name: 'critical-alerts'
  slack_configs:
  - channel: '#critical-alerts'
    title: 'Critical Alert: {{ .GroupLabels.alertname }}'
    text: |
      {{ range .Alerts }}
      *Service:* {{ .Labels.service }}
      *Alert:* {{ .Annotations.summary }}
      *Description:* {{ .Annotations.description }}
      *Action:* {{ .Annotations.action }}
      {{ end }}
  pagerduty_configs:
  - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
    description: '{{ .GroupLabels.alertname }}: {{ .GroupLabels.service }}'

- name: 'chatbot-team'
  slack_configs:
  - channel: '#chatbot-alerts'
    title: 'Chatbot Alert: {{ .GroupLabels.alertname }}'
    text: |
      {{ range .Alerts }}
      *Severity:* {{ .Labels.severity }}
      *Alert:* {{ .Annotations.summary }}
      *Description:* {{ .Annotations.description }}
      {{ if .Annotations.runbook_url }}*Runbook:* {{ .Annotations.runbook_url }}{{ end }}
      {{ end }}
```

## 📋 Logging Configuration

### ELK Stack Setup
```yaml
# logging/docker-compose.elk.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - elk

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf:ro
    ports:
      - "5000:5000/tcp"
      - "5000:5000/udp"
      - "9600:9600"
    environment:
      LS_JAVA_OPTS: "-Xmx512m -Xms512m"
    networks:
      - elk
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    networks:
      - elk
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:

networks:
  elk:
    driver: bridge
```

### Logstash Configuration
```ruby
# logging/logstash.conf
input {
  beats {
    port => 5044
  }
  
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [fields][service] == "chatbot" {
    # Parse chatbot logs
    if [message] =~ /^\{.*\}$/ {
      json {
        source => "message"
      }
    }
    
    # Extract conversation metrics
    if [conversation_id] {
      mutate {
        add_field => { "[@metadata][index_prefix]" => "chatbot-conversations" }
      }
    }
    
    # Parse response times
    if [response_time] {
      mutate {
        convert => { "response_time" => "float" }
      }
    }
    
    # Categorize log levels
    if [level] == "ERROR" {
      mutate {
        add_tag => [ "error" ]
      }
    }
    
    # Extract user feedback
    if [user_rating] {
      mutate {
        convert => { "user_rating" => "integer" }
        add_field => { "[@metadata][index_prefix]" => "chatbot-feedback" }
      }
    }
  }
  
  # Add timestamp
  date {
    match => [ "timestamp", "ISO8601" ]
  }
  
  # Geolocate IP addresses
  if [client_ip] {
    geoip {
      source => "client_ip"
      target => "geoip"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index_prefix]:chatbot-logs}-%{+YYYY.MM.dd}"
  }
  
  # Output metrics to separate index
  if [type] == "metrics" {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "chatbot-metrics-%{+YYYY.MM.dd}"
    }
  }
  
  stdout {
    codec => rubydebug
  }
}
```

## 📊 Custom Metrics Collection

### Python Metrics Collector
```python
# metrics/collectors/chatbot_metrics.py
import time
import logging
from prometheus_client import Counter, Histogram, Gauge, start_http_server
from typing import Dict, Any
import json

class ChatbotMetricsCollector:
    def __init__(self, port: int = 8000):
        self.port = port
        
        # Define metrics
        self.conversations_total = Counter(
            'chatbot_conversations_total',
            'Total number of conversations',
            ['framework', 'intent', 'status']
        )
        
        self.response_duration = Histogram(
            'chatbot_response_duration_seconds',
            'Response time in seconds',
            ['framework', 'intent'],
            buckets=(0.1, 0.25, 0.5, 1, 2.5, 5, 10)
        )
        
        self.intent_confidence = Gauge(
            'chatbot_intent_confidence_score',
            'Intent recognition confidence score',
            ['framework', 'intent']
        )
        
        self.active_users = Gauge(
            'chatbot_active_users',
            'Number of active users',
            ['framework']
        )
        
        self.errors_total = Counter(
            'chatbot_errors_total',
            'Total number of errors',
            ['framework', 'error_type']
        )
        
        self.satisfaction_rating = Gauge(
            'chatbot_satisfaction_rating',
            'User satisfaction rating',
            ['framework']
        )
        
        # Business metrics
        self.booking_attempts = Counter(
            'chatbot_booking_attempted_total',
            'Total booking attempts',
            ['framework']
        )
        
        self.booking_completions = Counter(
            'chatbot_booking_completed_total',
            'Total completed bookings',
            ['framework']
        )
        
        self.setup_logging()
    
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
    
    def record_conversation(self, framework: str, intent: str, status: str, 
                          response_time: float, confidence: float):
        """Record conversation metrics"""
        self.conversations_total.labels(
            framework=framework, 
            intent=intent, 
            status=status
        ).inc()
        
        self.response_duration.labels(
            framework=framework, 
            intent=intent
        ).observe(response_time)
        
        self.intent_confidence.labels(
            framework=framework, 
            intent=intent
        ).set(confidence)
        
        self.logger.info(f"Recorded conversation: {framework} - {intent} - {status}")
    
    def record_error(self, framework: str, error_type: str):
        """Record error metrics"""
        self.errors_total.labels(
            framework=framework, 
            error_type=error_type
        ).inc()
        
        self.logger.warning(f"Recorded error: {framework} - {error_type}")
    
    def record_user_feedback(self, framework: str, rating: int):
        """Record user satisfaction"""
        self.satisfaction_rating.labels(framework=framework).set(rating)
        self.logger.info(f"Recorded user feedback: {framework} - {rating}")
    
    def record_booking_attempt(self, framework: str):
        """Record booking attempt"""
        self.booking_attempts.labels(framework=framework).inc()
    
    def record_booking_completion(self, framework: str):
        """Record completed booking"""
        self.booking_completions.labels(framework=framework).inc()
    
    def update_active_users(self, framework: str, count: int):
        """Update active user count"""
        self.active_users.labels(framework=framework).set(count)
    
    def start_server(self):
        """Start Prometheus metrics server"""
        start_http_server(self.port)
        self.logger.info(f"Metrics server started on port {self.port}")
    
    def process_log_entry(self, log_entry: Dict[str, Any]):
        """Process a log entry and extract metrics"""
        try:
            framework = log_entry.get('framework', 'unknown')
            
            if log_entry.get('type') == 'conversation':
                self.record_conversation(
                    framework=framework,
                    intent=log_entry.get('intent', 'unknown'),
                    status=log_entry.get('status', 'unknown'),
                    response_time=log_entry.get('response_time', 0),
                    confidence=log_entry.get('confidence', 0)
                )
            
            elif log_entry.get('type') == 'error':
                self.record_error(
                    framework=framework,
                    error_type=log_entry.get('error_type', 'unknown')
                )
            
            elif log_entry.get('type') == 'feedback':
                self.record_user_feedback(
                    framework=framework,
                    rating=log_entry.get('rating', 0)
                )
            
            elif log_entry.get('type') == 'booking':
                if log_entry.get('action') == 'attempt':
                    self.record_booking_attempt(framework)
                elif log_entry.get('action') == 'complete':
                    self.record_booking_completion(framework)
                    
        except Exception as e:
            self.logger.error(f"Error processing log entry: {e}")

if __name__ == "__main__":
    collector = ChatbotMetricsCollector()
    collector.start_server()
    
    # Keep the server running
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        print("Metrics collector stopped")
```

### Health Check Script
```bash
#!/bin/bash
# scripts/health-checks.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CHATBOT_ENDPOINTS=(
    "http://localhost:5005/health"  # Rasa
    "http://localhost:3978/health"  # Microsoft Bot
    "http://localhost:3000/health"  # Botpress
)

PROMETHEUS_URL="http://localhost:9090"
GRAFANA_URL="http://localhost:3001"
ELASTICSEARCH_URL="http://localhost:9200"

echo "🏥 Chatbot Health Check Report"
echo "=============================="
echo "Timestamp: $(date)"
echo ""

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local timeout=${3:-10}
    
    echo -n "Checking $name: "
    
    if curl -f -s --max-time $timeout "$url" > /dev/null; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

# Function to check service metrics
check_metrics() {
    local service=$1
    echo "📊 $service Metrics:"
    
    # Query Prometheus for service metrics
    local query="up{job=\"$service\"}"
    local result=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=$query" | jq -r '.data.result[0].value[1]' 2>/dev/null)
    
    if [ "$result" = "1" ]; then
        echo -e "   Status: ${GREEN}✅ Up${NC}"
    else
        echo -e "   Status: ${RED}❌ Down${NC}"
    fi
    
    # Get response time metrics
    local response_time_query="histogram_quantile(0.95, rate(chatbot_response_duration_seconds_bucket{framework=\"$service\"}[5m]))"
    local response_time=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=$response_time_query" | jq -r '.data.result[0].value[1]' 2>/dev/null)
    
    if [ "$response_time" != "null" ] && [ "$response_time" != "" ]; then
        echo "   95th percentile response time: ${response_time}s"
    fi
    
    # Get error rate
    local error_rate_query="rate(chatbot_errors_total{framework=\"$service\"}[5m])"
    local error_rate=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=$error_rate_query" | jq -r '.data.result[0].value[1]' 2>/dev/null)
    
    if [ "$error_rate" != "null" ] && [ "$error_rate" != "" ]; then
        echo "   Error rate: ${error_rate} errors/second"
    fi
    
    echo ""
}

# Check chatbot endpoints
echo "🤖 Chatbot Services:"
healthy_services=0
total_services=${#CHATBOT_ENDPOINTS[@]}

for endpoint in "${CHATBOT_ENDPOINTS[@]}"; do
    service_name=$(echo $endpoint | sed 's/.*:\/\/[^:]*:\([0-9]*\).*/\1/')
    case $service_name in
        5005) service_name="Rasa" ;;
        3978) service_name="Microsoft Bot" ;;
        3000) service_name="Botpress" ;;
        *) service_name="Unknown" ;;
    esac
    
    if check_endpoint "$endpoint" "$service_name"; then
        ((healthy_services++))
    fi
done

echo ""

# Check monitoring infrastructure
echo "📊 Monitoring Infrastructure:"
check_endpoint "$PROMETHEUS_URL/api/v1/label/__name__/values" "Prometheus"
check_endpoint "$GRAFANA_URL/api/health" "Grafana"
check_endpoint "$ELASTICSEARCH_URL/_cluster/health" "Elasticsearch"
echo ""

# Check individual service metrics
echo "📈 Service Metrics:"
check_metrics "rasa"
check_metrics "microsoft-bot"
check_metrics "botpress"

# Check system resources
echo "💻 System Resources:"
echo -n "CPU Usage: "
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
echo "${cpu_usage}%"

echo -n "Memory Usage: "
memory_usage=$(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
echo "$memory_usage"

echo -n "Disk Usage: "
disk_usage=$(df / | awk 'NR==2{print $5}')
echo "$disk_usage"

echo ""

# Overall health summary
echo "📋 Summary:"
echo "Healthy Services: $healthy_services/$total_services"

if [ $healthy_services -eq $total_services ]; then
    echo -e "Overall Status: ${GREEN}✅ All Systems Operational${NC}"
    exit 0
else
    echo -e "Overall Status: ${YELLOW}⚠️ Some Issues Detected${NC}"
    exit 1
fi
```

This comprehensive monitoring solution provides deep visibility into chatbot performance, user experience, and system health across all deployment environments.