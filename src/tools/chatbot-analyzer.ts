#!/usr/bin/env ts-node

import { GitHubAnalyzer } from '../services/github-analyzer';
import { BrowserAutomationService } from '../services/browser-automation';
import { MCPServerManager } from '../services/mcp-manager';
import { ChatbotProject, AnalysisReport } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class ChatbotAnalyzer {
  private githubAnalyzer: GitHubAnalyzer;
  private browserService: BrowserAutomationService;
  private mcpManager: MCPServerManager;

  constructor() {
    this.githubAnalyzer = new GitHubAnalyzer();
    this.browserService = new BrowserAutomationService();
    this.mcpManager = new MCPServerManager();
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Chatbot Solution Analyzer...\n');
    
    // Create workspace directories
    await this.createWorkspace();
    
    // Start MCP servers
    console.log('📡 Starting MCP Servers...');
    await this.mcpManager.listAvailableServers();
    // Note: MCP servers may require additional setup in production
    
    // Initialize browser automation
    await this.browserService.initializeBrowsers();
    
    console.log('\n✅ Initialization complete!\n');
  }

  async analyzeChatbotSolutions(): Promise<AnalysisReport> {
    console.log('🔍 Starting comprehensive chatbot solution analysis...\n');
    
    // Step 1: Search GitHub for chatbot projects
    console.log('1️⃣  Searching GitHub for trending chatbot projects...');
    const projects = await this.githubAnalyzer.searchChatbotProjects();
    console.log(`   Found ${projects.length} projects\n`);
    
    // Step 2: Enhanced analysis with browser automation
    console.log('2️⃣  Performing enhanced analysis with browser automation...');
    const enhancedProjects = await this.enhanceProjectsWithBrowserData(projects);
    console.log(`   Enhanced ${enhancedProjects.length} projects\n`);
    
    // Step 3: Categorize and analyze
    console.log('3️⃣  Categorizing and analyzing solutions...');
    const categorizedProjects = this.categorizeProjects(enhancedProjects);
    
    // Step 4: Generate recommendations
    console.log('4️⃣  Generating recommendations...');
    const recommendations = this.generateRecommendations(enhancedProjects);
    
    // Step 5: Create analysis report
    const report: AnalysisReport = {
      generatedAt: new Date().toISOString(),
      totalProjects: enhancedProjects.length,
      categories: categorizedProjects,
      recommendations
    };
    
    // Save report
    await this.saveReport(report);
    
    console.log('✅ Analysis complete! Report saved to workspace/analysis-report.json\n');
    
    return report;
  }

  private async createWorkspace(): Promise<void> {
    const dirs = [
      './workspace',
      './workspace/screenshots',
      './workspace/reports',
      './workspace/memory'
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private async enhanceProjectsWithBrowserData(projects: ChatbotProject[]): Promise<ChatbotProject[]> {
    const enhanced: ChatbotProject[] = [];
    
    // Limit to top 20 projects to avoid rate limits and long execution time
    const topProjects = projects.slice(0, 20);
    
    for (let i = 0; i < topProjects.length; i++) {
      const project = topProjects[i];
      console.log(`   📊 Analyzing ${project.name} (${i + 1}/${topProjects.length})`);
      
      try {
        // Check if project has a live demo or documentation site
        const demoUrls = await this.findDemoUrls(project);
        
        if (demoUrls.length > 0) {
          // Test the first available demo
          const browserData = await this.browserService.testChatbotInterface(demoUrls[0]);
          
          // Update project ratings based on browser testing
          if (browserData.hasChatInterface) {
            project.ratings.features += 1;
          }
          if (browserData.interactionTest) {
            project.ratings.features += 1;
          }
          if (browserData.responsiveness) {
            project.ratings.deploymentEase += 1;
          }
          
          // Ensure ratings don't exceed 10
          project.ratings.features = Math.min(10, project.ratings.features);
          project.ratings.deploymentEase = Math.min(10, project.ratings.deploymentEase);
        }
        
        enhanced.push(project);
        
      } catch (error) {
        console.warn(`   ⚠️  Could not enhance ${project.name}:`, (error as Error).message);
        enhanced.push(project); // Add project even if enhancement fails
      }
      
      // Small delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return enhanced;
  }

  private async findDemoUrls(project: ChatbotProject): Promise<string[]> {
    const urls: string[] = [];
    
    // Common demo URL patterns
    const demoPatterns = [
      `https://${project.name.toLowerCase()}.github.io`,
      `https://${project.name.toLowerCase()}.netlify.app`,
      `https://${project.name.toLowerCase()}.vercel.app`,
      `https://demo.${project.name.toLowerCase()}.com`,
      `https://${project.name.toLowerCase()}.herokuapp.com`
    ];
    
    // Extract URLs from project description and README
    const urlRegex = /https?:\/\/[^\s)]+/g;
    const matches = project.description.match(urlRegex) || [];
    urls.push(...matches);
    
    // Add pattern-based URLs
    urls.push(...demoPatterns);
    
    return urls.filter(url => 
      !url.includes('github.com') && 
      !url.includes('npmjs.com') &&
      !url.includes('badge') &&
      !url.includes('shield')
    );
  }

  private categorizeProjects(projects: ChatbotProject[]): { framework: string; projects: ChatbotProject[] }[] {
    const categories = new Map<string, ChatbotProject[]>();
    
    for (const project of projects) {
      const framework = project.framework;
      if (!categories.has(framework)) {
        categories.set(framework, []);
      }
      categories.get(framework)!.push(project);
    }
    
    // Sort categories by number of projects
    return Array.from(categories.entries())
      .map(([framework, projects]) => ({
        framework,
        projects: projects.sort((a, b) => b.stars - a.stars)
      }))
      .sort((a, b) => b.projects.length - a.projects.length);
  }

  private generateRecommendations(projects: ChatbotProject[]): {
    easiestToDeploy: ChatbotProject[];
    mostFeatures: ChatbotProject[];
    bestValue: ChatbotProject[];
  } {
    const sortedByDeployment = [...projects].sort((a, b) => b.ratings.deploymentEase - a.ratings.deploymentEase);
    const sortedByFeatures = [...projects].sort((a, b) => b.ratings.features - a.ratings.features);
    const sortedByValue = [...projects].sort((a, b) => {
      // Calculate value score: (features + deploymentEase + cost) / 3
      const aValue = (a.ratings.features + a.ratings.deploymentEase + a.ratings.cost) / 3;
      const bValue = (b.ratings.features + b.ratings.deploymentEase + b.ratings.cost) / 3;
      return bValue - aValue;
    });
    
    return {
      easiestToDeploy: sortedByDeployment.slice(0, 5),
      mostFeatures: sortedByFeatures.slice(0, 5),
      bestValue: sortedByValue.slice(0, 5)
    };
  }

  private async saveReport(report: AnalysisReport): Promise<void> {
    const reportPath = './workspace/reports/chatbot-analysis-report.json';
    const markdownPath = './workspace/reports/chatbot-analysis-report.md';
    
    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate markdown report
    const markdown = this.generateMarkdownReport(report);
    fs.writeFileSync(markdownPath, markdown);
    
    console.log(`📊 Reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   Markdown: ${markdownPath}`);
  }

  private generateMarkdownReport(report: AnalysisReport): string {
    let markdown = `# Chatbot Solutions Analysis Report\n\n`;
    markdown += `**Generated:** ${new Date(report.generatedAt).toLocaleString()}\n`;
    markdown += `**Total Projects Analyzed:** ${report.totalProjects}\n\n`;
    
    markdown += `## 🏆 Top Recommendations\n\n`;
    
    markdown += `### 🚀 Easiest to Deploy\n\n`;
    report.recommendations.easiestToDeploy.forEach((project, index) => {
      markdown += `${index + 1}. **[${project.name}](${project.url})** (⭐ ${project.stars})\n`;
      markdown += `   - Framework: ${project.framework}\n`;
      markdown += `   - Deployment Rating: ${project.ratings.deploymentEase}/10\n`;
      markdown += `   - Self-hosting: ${project.selfHosting.supported ? '✅' : '❌'} (${project.selfHosting.complexity})\n`;
      markdown += `   - Methods: ${project.selfHosting.methods.join(', ')}\n`;
      markdown += `   - ${project.description}\n\n`;
    });
    
    markdown += `### 🎯 Most Features\n\n`;
    report.recommendations.mostFeatures.forEach((project, index) => {
      markdown += `${index + 1}. **[${project.name}](${project.url})** (⭐ ${project.stars})\n`;
      markdown += `   - Framework: ${project.framework}\n`;
      markdown += `   - Features Rating: ${project.ratings.features}/10\n`;
      markdown += `   - Custom AI Support: ${project.customAISupport ? '✅' : '❌'}\n`;
      markdown += `   - Required Services: ${project.requiredServices.join(', ') || 'None'}\n`;
      markdown += `   - ${project.description}\n\n`;
    });
    
    markdown += `### 💰 Best Value\n\n`;
    report.recommendations.bestValue.forEach((project, index) => {
      const valueScore = ((project.ratings.features + project.ratings.deploymentEase + project.ratings.cost) / 3).toFixed(1);
      markdown += `${index + 1}. **[${project.name}](${project.url})** (⭐ ${project.stars})\n`;
      markdown += `   - Framework: ${project.framework}\n`;
      markdown += `   - Value Score: ${valueScore}/10\n`;
      markdown += `   - Cost Rating: ${project.ratings.cost}/10\n`;
      markdown += `   - Paid Services: ${project.paidServices.join(', ') || 'None required'}\n`;
      markdown += `   - ${project.description}\n\n`;
    });
    
    markdown += `## 📊 Analysis by Framework\n\n`;
    
    report.categories.forEach(category => {
      markdown += `### ${category.framework} (${category.projects.length} projects)\n\n`;
      markdown += `| Project | Stars | Forks | Deployment | Features | Cost | Self-hosting |\n`;
      markdown += `|---------|-------|-------|------------|----------|------|-------------|\n`;
      
      category.projects.forEach(project => {
        markdown += `| [${project.name}](${project.url}) | ${project.stars} | ${project.forks} | ${project.ratings.deploymentEase}/10 | ${project.ratings.features}/10 | ${project.ratings.cost}/10 | ${project.selfHosting.supported ? '✅' : '❌'} |\n`;
      });
      
      markdown += `\n`;
    });
    
    markdown += `## 🔍 Analysis Methodology\n\n`;
    markdown += `### Rating System (1-10 scale)\n\n`;
    markdown += `1. **Deployment Ease**: How easy it is to deploy and get started\n`;
    markdown += `   - 10: One-click deployment (Docker, Heroku button)\n`;
    markdown += `   - 7-9: Simple deployment (Docker Compose, npm install)\n`;
    markdown += `   - 4-6: Moderate setup (requires configuration)\n`;
    markdown += `   - 1-3: Complex setup (extensive configuration required)\n\n`;
    
    markdown += `2. **Features**: How advanced and feature-rich the solution is\n`;
    markdown += `   - 10: Enterprise-grade with AI integration, analytics, multi-channel\n`;
    markdown += `   - 7-9: Advanced features, good customization\n`;
    markdown += `   - 4-6: Standard chatbot features\n`;
    markdown += `   - 1-3: Basic chatbot functionality\n\n`;
    
    markdown += `3. **Cost**: Total cost of ownership (10 = free/cheap, 1 = expensive)\n`;
    markdown += `   - 10: Completely free and open source\n`;
    markdown += `   - 7-9: Free with optional paid services\n`;
    markdown += `   - 4-6: Some paid components required\n`;
    markdown += `   - 1-3: Requires expensive paid services\n\n`;
    
    markdown += `### Data Sources\n\n`;
    markdown += `- GitHub API for repository statistics\n`;
    markdown += `- Repository analysis for deployment methods\n`;
    markdown += `- README and documentation parsing\n`;
    markdown += `- Browser automation testing (where applicable)\n`;
    markdown += `- MCP server integration for enhanced analysis\n\n`;
    
    markdown += `---\n\n`;
    markdown += `*Report generated by Chatbot Solution Analyzer with MCP servers and Playwright integration*\n`;
    
    return markdown;
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up resources...');
    await this.browserService.closeBrowsers();
    await this.mcpManager.stopAllServers();
    console.log('✅ Cleanup complete');
  }
}

// CLI execution
async function main() {
  const analyzer = new ChatbotAnalyzer();
  
  try {
    await analyzer.initialize();
    const report = await analyzer.analyzeChatbotSolutions();
    
    console.log('\n🎉 Analysis Summary:');
    console.log(`📊 Total projects analyzed: ${report.totalProjects}`);
    console.log(`📁 Categories found: ${report.categories.length}`);
    console.log(`🏆 Top deployment ease: ${report.recommendations.easiestToDeploy[0]?.name}`);
    console.log(`🎯 Most features: ${report.recommendations.mostFeatures[0]?.name}`);
    console.log(`💰 Best value: ${report.recommendations.bestValue[0]?.name}`);
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  } finally {
    await analyzer.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}