# GitHub Copilot Instructions for Chatbot Solution Repository

This repository is a curated collection of chatbot solutions, deployment guides, and self-hosting options. It serves as a comprehensive resource for developers looking to implement chatbot technologies across various platforms and frameworks.

## Repository Purpose

This repository focuses on:
- **Ready-to-deploy chatbot solutions** across multiple frameworks
- **Self-hosting deployment guides** for various infrastructure setups
- **Chatbot framework comparisons** and implementation examples
- **Automation tools** for chatbot testing and deployment
- **Browser automation** for chatbot UI testing and validation

## Project Structure Guidelines

When working with this repository, follow this structure:

```
chatbot-solutions/
├── frameworks/                    # Framework-specific implementations
│   ├── botpress/                 # Botpress chatbot solutions
│   ├── rasa/                     # Rasa Open Source implementations
│   ├── microsoft-bot/            # Microsoft Bot Framework examples
│   ├── dialogflow/               # Google Dialogflow integrations
│   ├── wit.ai/                   # Meta Wit.ai implementations
│   ├── chatterbot/               # Python ChatterBot examples
│   ├── botman/                   # PHP BotMan framework
│   └── botkit/                   # Botkit framework solutions
├── deployment/                   # Deployment configurations
│   ├── docker/                   # Docker containerization
│   ├── kubernetes/               # K8s deployment manifests
│   ├── cloud-functions/          # Serverless deployments
│   ├── self-hosted/              # Self-hosting guides
│   └── local/                    # Local development setups
├── examples/                     # Complete example implementations
│   ├── basic/                    # Simple chatbot examples
│   ├── advanced/                 # Complex conversational AI
│   └── industry-specific/        # Domain-specific solutions
├── testing/                      # Testing frameworks and tools
│   ├── unit/                     # Unit testing examples
│   ├── integration/              # Integration test suites
│   └── conversation-flow/        # Conversation testing
├── documentation/                # Comprehensive guides
│   ├── setup/                    # Setup and installation guides
│   ├── deployment/               # Deployment documentation
│   └── troubleshooting/          # Common issues and solutions
└── tools/                        # Automation and utility tools
    ├── automation/               # CI/CD and automation scripts
    ├── monitoring/               # Monitoring and analytics
    └── browser-automation/       # Browser testing tools
```

## Development Guidelines

### Environment Setup

The repository uses a comprehensive development environment with:

- **Node.js 20+** for JavaScript/TypeScript chatbot frameworks
- **Python 3.11+** for AI/ML chatbot components (Rasa, spaCy, etc.)
- **Browser Automation** tools (Chrome, Puppeteer, Playwright)
- **MCP Servers** for enhanced development capabilities
- **Disabled Firewall** configuration for unrestricted development

### Coding Standards

#### JavaScript/TypeScript Projects
```bash
# Validation commands
npm run test          # Run all tests
npm run lint          # ESLint validation
npm run prettier      # Code formatting
npm run build         # Build projects
npm run dev           # Development server
```

#### Python Projects
```bash
# Validation commands
python -m pytest                    # Run tests
python -m flake8 .                 # Linting
python -m black .                  # Code formatting
python -m mypy .                   # Type checking
```

#### Docker Deployments
```bash
# Container validation
docker build -t chatbot-solution .
docker run --rm chatbot-solution
docker-compose up --build
```

### Framework-Specific Guidelines

#### Botpress
- Use TypeScript for custom actions and hooks
- Store conversation flows in `flows/` directory
- Include environment-specific configurations
- Document API integrations and webhooks

#### Rasa
- Structure training data in YAML format
- Use domain.yml for responses and actions
- Include custom actions in `actions/` directory
- Provide training data examples and validation

#### Microsoft Bot Framework
- Use Bot Framework SDK patterns
- Include adaptive cards examples
- Document Azure deployment steps
- Provide multi-channel configuration

#### Dialogflow
- Structure intents and entities clearly
- Include fulfillment webhook examples
- Document Google Cloud integration
- Provide training phrase examples

### Testing Requirements

#### Conversation Flow Testing
```javascript
// Example conversation test structure
describe('Chatbot Conversation Flow', () => {
  test('should handle greeting intent', async () => {
    const response = await chatbot.processMessage('Hello');
    expect(response.intent).toBe('greeting');
    expect(response.confidence).toBeGreaterThan(0.8);
  });
});
```

#### Browser Automation Testing
```javascript
// Example browser automation test
const { setupBrowser } = require('./testing/browser-setup');

describe('Chatbot UI Testing', () => {
  let browser, page;
  
  beforeAll(async () => {
    browser = await setupBrowser();
    page = await browser.newPage();
  });
  
  test('should display chatbot interface', async () => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('.chat-interface')).toBeVisible();
  });
});
```

### MCP Server Configuration

The repository uses multiple MCP servers for enhanced development:

#### Available MCP Servers
- `@modelcontextprotocol/server-everything` - General purpose server
- `@modelcontextprotocol/server-brave-search` - Web search capabilities
- `@modelcontextprotocol/server-filesystem` - File system operations
- `@modelcontextprotocol/server-git` - Git operations

#### Configuration Example
```json
{
  "mcp_server_config": {
    "enabled": true,
    "servers": [
      {
        "name": "chatbot-mcp",
        "command": "npx",
        "args": ["@modelcontextprotocol/server-everything"],
        "env": {
          "CHATBOT_WORKSPACE": "./chatbot-workspace"
        }
      }
    ]
  }
}
```

### Deployment Guidelines

#### Docker Deployment
```dockerfile
# Example Dockerfile structure
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Kubernetes Deployment
```yaml
# Example K8s deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chatbot-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chatbot
  template:
    metadata:
      labels:
        app: chatbot
    spec:
      containers:
      - name: chatbot
        image: chatbot-solution:latest
        ports:
        - containerPort: 3000
```

#### Self-Hosted Setup
- Include systemd service files
- Provide nginx configuration examples
- Document SSL/TLS setup
- Include monitoring configuration

### Documentation Standards

#### README Requirements
Each chatbot solution must include:
- **Quick Start Guide** - 5-minute setup instructions
- **Prerequisites** - Required dependencies and versions
- **Installation Steps** - Detailed setup process
- **Configuration** - Environment variables and settings
- **Deployment Options** - Available deployment methods
- **Testing Instructions** - How to validate the implementation
- **Troubleshooting** - Common issues and solutions

#### Code Documentation
- Use JSDoc for JavaScript/TypeScript functions
- Include docstrings for Python functions
- Document API endpoints and responses
- Provide configuration option explanations

### Security Guidelines

#### Environment Variables
```bash
# Example .env structure
CHATBOT_API_KEY=your_api_key_here
DATABASE_URL=postgresql://user:pass@localhost/chatbot
WEBHOOK_SECRET=your_webhook_secret
ENCRYPTION_KEY=your_32_character_encryption_key
```

#### Security Checklist
- [ ] API keys stored in environment variables
- [ ] Input validation on all user inputs
- [ ] Rate limiting on API endpoints
- [ ] HTTPS enabled for production deployments
- [ ] Regular dependency updates
- [ ] Security headers configured

### Browser Automation Setup

The repository includes comprehensive browser automation capabilities:

#### Chrome Configuration
```javascript
const chromeOptions = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run'
  ]
};
```

#### Puppeteer Integration
```javascript
const puppeteer = require('puppeteer');

async function testChatbotUI() {
  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();
  // Chatbot UI testing logic
  await browser.close();
}
```

### Contributing Guidelines

#### Adding New Chatbot Solutions
1. Create framework-specific directory
2. Include complete implementation example
3. Add deployment configurations
4. Provide comprehensive documentation
5. Include test cases and validation
6. Add to main repository index

#### Pull Request Requirements
- [ ] Follows repository structure guidelines
- [ ] Includes comprehensive documentation
- [ ] Has working deployment example
- [ ] Passes all automated tests
- [ ] Includes browser automation tests (if applicable)
- [ ] Updates main README with new solution

### Automation Preferences

The Copilot agent is configured with the following automation preferences:

```json
{
  "automation_preferences": {
    "auto_fix_lint": true,
    "auto_generate_tests": true,
    "auto_update_docs": true,
    "auto_security_patches": true,
    "auto_chatbot_deployment": true,
    "auto_conversation_testing": true
  }
}
```

### Firewall Configuration

The development environment has firewall restrictions disabled to allow:
- Unrestricted package installation
- Browser automation downloads
- API access for chatbot frameworks
- Cloud service integrations
- Real-time testing and validation

### Supported Technologies

#### Programming Languages
- **JavaScript/TypeScript** - Web-based chatbot frameworks
- **Python** - AI/ML chatbot implementations
- **Go** - High-performance chatbot services
- **Rust** - Systems-level chatbot components
- **PHP** - Traditional web-based chatbots

#### Frameworks and Libraries
- **Frontend**: React, Vue.js, Angular, Svelte
- **Backend**: Node.js, Express, FastAPI, Flask, Gin
- **AI/ML**: TensorFlow, PyTorch, spaCy, NLTK, Transformers
- **Testing**: Jest, Pytest, Playwright, Puppeteer
- **Deployment**: Docker, Kubernetes, Terraform

#### Cloud Platforms
- **AWS**: Lambda, ECS, EKS, Lex
- **Google Cloud**: Cloud Functions, GKE, Dialogflow
- **Azure**: Functions, AKS, Bot Service
- **Heroku**: Container deployment
- **DigitalOcean**: Droplets and App Platform

## Creating Pull Requests

When creating pull requests for this repository:

### PR Description Template
```markdown
_This pull request was created as a result of the following prompt in Copilot Chat._

<details>
<summary>Original prompt - submitted by @username</summary>

> [Original prompt text here]

</details>

## Changes Made
- [ ] Added new chatbot framework support
- [ ] Updated deployment configurations
- [ ] Enhanced documentation
- [ ] Added test cases
- [ ] Fixed browser automation issues

## Chatbot Solution Details
- **Framework**: [Framework name]
- **Deployment Type**: [Docker/K8s/Self-hosted/Local]
- **Testing**: [Test coverage and validation]
- **Documentation**: [Setup and usage guides]

## Validation Checklist
- [ ] All tests pass
- [ ] Documentation is complete
- [ ] Deployment example works
- [ ] Browser automation tests included
- [ ] Security guidelines followed
```

### Testing Before PR
```bash
# Comprehensive testing workflow
npm run test                          # Unit tests
npm run lint                          # Code quality
npm run build                         # Build validation
npm run test:integration              # Integration tests
npm run test:browser                  # Browser automation tests
docker-compose up --build             # Deployment test
```

This repository serves as a comprehensive resource for chatbot development, deployment, and automation. Follow these guidelines to maintain consistency and quality across all chatbot solutions and documentation.
