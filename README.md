# 🤖 Chatbot Solution Analyzer

A comprehensive chatbot solution analysis tool with MCP (Model Context Protocol) server integration and Playwright browser automation.

## 🚀 Features

- **📡 MCP Server Integration**: Implements multiple MCP servers for enhanced development capabilities
- **🌐 Browser Automation**: Playwright integration for chatbot interface testing
- **📊 GitHub Analysis**: Automated discovery and analysis of trending chatbot projects
- **🎯 Smart Rating System**: Evaluates projects on deployment ease, features, and cost
- **🏠 Self-Hosting Focus**: Prioritizes solutions with easy self-deployment options
- **🤖 Custom AI Support**: Identifies projects with custom AI model integration capabilities

## 📡 MCP Servers Implemented

This project integrates the following Model Context Protocol servers:

```
├── @modelcontextprotocol/server-filesystem - File system operations
├── @modelcontextprotocol/server-memory - Knowledge graph for enhanced analysis  
├── @modelcontextprotocol/inspector - Real-time debugging and monitoring
└── puppeteer-mcp-server - Browser automation capabilities
```

## 🛠️ Installation

### Prerequisites

- **Node.js 20+** 
- **Python 3.11+** (for some MCP servers)
- **Git**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/dzp5103/Chatbot-solution.git
cd Chatbot-solution

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Build the project
npm run build

# Create workspace directories
mkdir -p workspace/{screenshots,reports,memory}

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Configuration

Create a `.env` file with the following settings:

```bash
# MCP Server Configuration
MCP_WORKSPACE=./workspace
MCP_PORT=3001

# GitHub API Configuration (optional, for live analysis)
GITHUB_TOKEN=your_github_token_here

# Application Configuration
PORT=3000
NODE_ENV=development
```

## 🚀 Usage

### 1. Start the MCP Servers

```bash
npm run setup:mcp
```

### 2. Run Analysis

#### Live Trending Analysis (Newly Updated Multi-Model Projects)
```bash
# Analyzes recently updated projects with multi-model AI capabilities
npm run analyze:trending
```

#### Demo Analysis (Sample Data)
```bash
npx ts-node src/tools/demo-analyzer.ts
```

#### Full Analysis (Requires GitHub Token)
```bash
npm run analyze:chatbots
```

#### Start the Web Server
```bash
npm run dev
# Or for production
npm start
```

### 3. API Endpoints

- `GET /` - API information
- `GET /api/status` - System status
- `POST /api/analyze` - Start chatbot analysis
- `GET /api/mcp/status` - MCP server status
- `GET /api/mcp/list` - List available MCP servers

## 📊 Analysis Features

### Rating System (1-10 Scale)

#### 🚀 Deployment Ease
- **10**: One-click deployment (Docker, Heroku button)
- **7-9**: Simple deployment (Docker Compose, npm install)
- **4-6**: Moderate setup (requires configuration)
- **1-3**: Complex setup (extensive configuration required)

#### 🎯 Features
- **10**: Enterprise-grade with AI integration, analytics, multi-channel
- **7-9**: Advanced features, good customization
- **4-6**: Standard chatbot features
- **1-3**: Basic chatbot functionality

#### 💰 Cost (10 = free/cheap, 1 = expensive)
- **10**: Completely free and open source
- **7-9**: Free with optional paid services
- **4-6**: Some paid components required
- **1-3**: Requires expensive paid services

### Analysis Types

#### 🔥 Trending Analysis (NEW)
Focuses specifically on newly updated projects with multi-model capabilities:

- **Time Filter**: Projects updated within the last 6 months
- **Multi-Model Detection**: Identifies projects supporting multiple AI providers
- **Active Development**: Prioritizes projects with recent commits and contributions
- **Modern Frameworks**: Focuses on LangChain, LlamaIndex, and other modern AI frameworks

**Key Benefits:**
- Discovers emerging chatbot technologies
- Avoids outdated or abandoned projects
- Highlights cutting-edge multi-model implementations
- Identifies trending AI integration patterns

#### Traditional Analysis
Comprehensive analysis of established chatbot frameworks:

### Analysis Includes

- ⭐ GitHub stars and forks
- 📅 Last update timestamps and recent activity
- 🏠 Self-hosting capabilities
- 🤖 Multi-model AI provider support
- 💰 Required paid services
- 🌐 Browser automation testing (when applicable)
- 📱 Mobile responsiveness checks
- 🔥 Trending score based on recent activity

## 🌐 Browser Automation

The system uses Playwright to test chatbot interfaces:

```typescript
// Test chatbot interface
const result = await browserService.testChatbotInterface(url);
// Returns: { hasChatInterface, interactionTest, responsiveness }
```

### Browser Tests Include

- **Interface Detection**: Automatically finds chat widgets and interfaces
- **Interaction Testing**: Tests input fields and message sending
- **Responsiveness**: Checks mobile-friendly design
- **Performance**: Measures load times and resource usage
- **Accessibility**: Basic accessibility compliance checks

## 📁 Project Structure

```
chatbot-solutions/
├── src/
│   ├── config/           # Configuration files
│   ├── services/         # Core services (MCP, GitHub, Browser)
│   ├── tools/            # Analysis and setup tools
│   ├── types/            # TypeScript type definitions
│   └── tests/            # Test files
├── workspace/            # Generated analysis data
│   ├── screenshots/      # Browser automation screenshots
│   ├── reports/          # Analysis reports (JSON & Markdown)
│   └── memory/           # MCP server knowledge graph
├── tools/                # External automation tools
└── dist/                 # Compiled TypeScript output
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run browser automation tests
npm run test:browser

# Run linting
npm run lint

# Format code
npm run prettier
```

## 📊 Sample Analysis Results

Based on our analysis, here are the top recommendations:

### 🚀 Easiest to Deploy
1. **Botpress** - Docker, npm/Node.js, Kubernetes support
2. **ChatterBot** - Simple pip/Python installation
3. **Botkit** - npm/Node.js, Docker, Heroku deployment

### 🎯 Most Features
1. **Rasa** - Full ML framework with NLU/dialogue management
2. **Open-Assistant** - Advanced AI capabilities with task understanding
3. **Botpress** - Enterprise features with visual flow builder

### 💰 Best Value
1. **Botpress** - Great features with easy deployment
2. **Rasa** - Powerful ML capabilities, open source
3. **ChatterBot** - Completely free with good basic features

## 🔧 Development

### Adding New MCP Servers

1. Install the MCP server package:
```bash
npm install @modelcontextprotocol/server-newserver
```

2. Add to configuration in `src/config/index.ts`:
```typescript
{
  name: 'newserver',
  command: 'npx',
  args: ['@modelcontextprotocol/server-newserver'],
  env: { /* environment variables */ },
  enabled: true
}
```

### Adding New Analysis Metrics

1. Update the `ChatbotProject` interface in `src/types/index.ts`
2. Modify the analysis logic in `src/services/github-analyzer.ts`
3. Update the rating calculation in `calculateRatings()`

### Browser Automation

Add new browser tests in `src/services/browser-automation.ts`:

```typescript
async testNewFeature(url: string): Promise<TestResult> {
  const page = await this.createPage();
  // Your test logic here
  return result;
}
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t chatbot-analyzer .

# Run container
docker run -p 3000:3000 -v $(pwd)/workspace:/app/workspace chatbot-analyzer
```

### Self-Hosted Deployment

1. **Server Requirements**:
   - Node.js 20+
   - 2GB+ RAM
   - 10GB+ disk space

2. **Setup**:
```bash
# Production build
npm run build

# Start with PM2
npm install -g pm2
pm2 start dist/index.js --name chatbot-analyzer

# Or with systemd
sudo cp chatbot-analyzer.service /etc/systemd/system/
sudo systemctl enable chatbot-analyzer
sudo systemctl start chatbot-analyzer
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-analysis`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Submit a pull request

### Pull Request Requirements

- [ ] Follows repository structure guidelines
- [ ] Includes comprehensive documentation
- [ ] Has working deployment example
- [ ] Passes all automated tests
- [ ] Includes browser automation tests (if applicable)
- [ ] Updates main README with new features

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Model Context Protocol (MCP) by Anthropic
- Playwright by Microsoft
- GitHub API for project discovery
- Open source chatbot community

## 📞 Support

- 📧 Issues: [GitHub Issues](https://github.com/dzp5103/Chatbot-solution/issues)
- 📖 Documentation: [Wiki](https://github.com/dzp5103/Chatbot-solution/wiki)
- 💬 Discussions: [GitHub Discussions](https://github.com/dzp5103/Chatbot-solution/discussions)

---

**Built with ❤️ for the chatbot development community**
