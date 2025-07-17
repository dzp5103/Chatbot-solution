#!/usr/bin/env ts-node

import { GitHubAnalyzer } from '../services/github-analyzer';
import { ChatbotProject } from '../types';
import * as fs from 'fs';

class TrendingChatbotAnalyzer {
  private githubAnalyzer: GitHubAnalyzer;

  constructor() {
    this.githubAnalyzer = new GitHubAnalyzer();
  }

  async analyzeNewlyUpdatedProjects(): Promise<ChatbotProject[]> {
    console.log('🚀 Starting analysis of newly updated multi-model chatbot projects...\n');
    
    if (!process.env.GITHUB_TOKEN) {
      console.error('❌ GITHUB_TOKEN environment variable is required for live analysis');
      console.log('💡 Please set your GitHub token to access the GitHub API');
      console.log('   export GITHUB_TOKEN="your_github_token_here"');
      return [];
    }

    try {
      // Search for recently updated multi-model chatbot projects
      const projects = await this.githubAnalyzer.searchChatbotProjects();
      
      console.log(`\n✅ Found ${projects.length} recently updated multi-model chatbot projects`);
      
      if (projects.length === 0) {
        console.log('💡 No projects found matching the multi-model criteria');
        console.log('   This could be due to:');
        console.log('   - Strict filtering for recent updates (last 6 months)');
        console.log('   - Multi-model capability requirements');
        console.log('   - GitHub API rate limits');
        return [];
      }

      // Create analysis report
      await this.generateTrendingReport(projects);
      
      return projects;
      
    } catch (error) {
      console.error('❌ Error during analysis:', error);
      return [];
    }
  }

  private async generateTrendingReport(projects: ChatbotProject[]): Promise<void> {
    console.log('\n📊 Generating trending analysis report...');
    
    // Create workspace if it doesn't exist
    if (!fs.existsSync('./workspace/reports')) {
      fs.mkdirSync('./workspace/reports', { recursive: true });
    }

    // Categorize by framework
    const frameworkMap = new Map<string, ChatbotProject[]>();
    for (const project of projects) {
      const framework = project.framework;
      if (!frameworkMap.has(framework)) {
        frameworkMap.set(framework, []);
      }
      frameworkMap.get(framework)!.push(project);
    }

    // Sort categories by total projects
    const categories = Array.from(frameworkMap.entries())
      .map(([framework, projects]) => ({
        framework,
        projects: projects.sort((a, b) => {
          // Sort by trending score (recent activity + features)
          const aScore = this.calculateProjectScore(a);
          const bScore = this.calculateProjectScore(b);
          return bScore - aScore;
        })
      }))
      .sort((a, b) => b.projects.length - a.projects.length);

    // Generate recommendations based on different criteria
    const recommendations = {
      mostRecent: [...projects].sort((a, b) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      ).slice(0, 3),
      
      bestMultiModel: [...projects]
        .filter(p => p.customAISupport)
        .sort((a, b) => b.ratings.features - a.ratings.features)
        .slice(0, 3),
      
      easiestDeploy: [...projects]
        .sort((a, b) => b.ratings.deploymentEase - a.ratings.deploymentEase)
        .slice(0, 3),
      
      trending: [...projects]
        .sort((a, b) => this.calculateProjectScore(b) - this.calculateProjectScore(a))
        .slice(0, 5)
    };

    const report = {
      generatedAt: new Date().toISOString(),
      analysisType: 'trending-multi-model-chatbots',
      totalProjects: projects.length,
      focusPeriod: 'Last 6 months',
      categories,
      recommendations,
      metadata: {
        searchFocus: 'Recently updated projects with multi-model AI capabilities',
        filters: [
          'Updated within last 6 months',
          'Multi-model AI support detected',
          'Self-hosting capabilities',
          'Active development and contributions'
        ]
      }
    };

    // Generate Markdown report
    const markdown = this.generateMarkdownReport(report);
    
    // Save reports
    const timestamp = new Date().toISOString().split('T')[0];
    const jsonPath = `./workspace/reports/trending-analysis-${timestamp}.json`;
    const markdownPath = `./workspace/reports/trending-analysis-${timestamp}.md`;
    
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    fs.writeFileSync(markdownPath, markdown);
    
    console.log('✅ Trending analysis report generated successfully!');
    console.log(`📊 JSON Report: ${jsonPath}`);
    console.log(`📄 Markdown Report: ${markdownPath}`);
    
    // Display key findings
    console.log('\n🎯 Key Findings:');
    if (recommendations.trending.length > 0) {
      console.log(`🔥 Top Trending: ${recommendations.trending[0].name} (${recommendations.trending[0].framework})`);
    }
    if (recommendations.mostRecent.length > 0) {
      console.log(`⏰ Most Recent: ${recommendations.mostRecent[0].name} (updated: ${recommendations.mostRecent[0].lastUpdated})`);
    }
    if (recommendations.bestMultiModel.length > 0) {
      console.log(`🤖 Best Multi-Model: ${recommendations.bestMultiModel[0].name} (features: ${recommendations.bestMultiModel[0].ratings.features}/10)`);
    }
  }

  private generateMarkdownReport(report: any): string {
    let markdown = `# 🔥 Trending Multi-Model Chatbot Projects\n\n`;
    markdown += `**Analysis Date:** ${new Date(report.generatedAt).toLocaleString()}\n`;
    markdown += `**Focus Period:** ${report.focusPeriod}\n`;
    markdown += `**Projects Analyzed:** ${report.totalProjects}\n`;
    markdown += `**Analysis Type:** ${report.analysisType}\n\n`;
    
    markdown += `## 🎯 Analysis Focus\n\n`;
    markdown += `This analysis specifically targets:\n`;
    report.metadata.filters.forEach((filter: string) => {
      markdown += `- ${filter}\n`;
    });
    markdown += `\n`;
    
    if (report.totalProjects === 0) {
      markdown += `## ⚠️ No Projects Found\n\n`;
      markdown += `No projects matched the strict criteria for recently updated multi-model chatbots.\n`;
      markdown += `This could indicate:\n`;
      markdown += `- The multi-model chatbot space is still emerging\n`;
      markdown += `- Strict filtering for recent activity (6 months)\n`;
      markdown += `- GitHub API rate limiting\n\n`;
      markdown += `Consider:\n`;
      markdown += `- Expanding the time window for "recent" updates\n`;
      markdown += `- Reducing multi-model detection strictness\n`;
      markdown += `- Running analysis with a GitHub token for higher API limits\n\n`;
      return markdown;
    }

    markdown += `## 🏆 Top Recommendations\n\n`;
    
    if (report.recommendations.trending.length > 0) {
      markdown += `### 🔥 Top Trending Projects\n\n`;
      report.recommendations.trending.forEach((project: any, index: number) => {
        const lastUpdated = new Date(project.lastUpdated);
        const daysAgo = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
        
        markdown += `**${index + 1}. [${project.name}](${project.url})** ⭐ ${project.stars}\n`;
        markdown += `- **Framework**: ${project.framework}\n`;
        markdown += `- **Last Updated**: ${daysAgo} days ago\n`;
        markdown += `- **Multi-Model Support**: ${project.customAISupport ? '✅' : '❌'}\n`;
        markdown += `- **Deployment**: ${project.ratings.deploymentEase}/10 (${project.selfHosting.complexity})\n`;
        markdown += `- **Features**: ${project.ratings.features}/10\n`;
        markdown += `- **Description**: ${project.description}\n\n`;
      });
    }

    if (report.recommendations.mostRecent.length > 0) {
      markdown += `### ⏰ Most Recently Updated\n\n`;
      report.recommendations.mostRecent.forEach((project: any, index: number) => {
        const lastUpdated = new Date(project.lastUpdated);
        markdown += `**${index + 1}. [${project.name}](${project.url})**\n`;
        markdown += `- **Updated**: ${lastUpdated.toDateString()}\n`;
        markdown += `- **Framework**: ${project.framework}\n`;
        markdown += `- **Stars**: ${project.stars}\n`;
        markdown += `- **Multi-Model**: ${project.customAISupport ? '✅' : '❌'}\n\n`;
      });
    }

    if (report.recommendations.bestMultiModel.length > 0) {
      markdown += `### 🤖 Best Multi-Model Capabilities\n\n`;
      report.recommendations.bestMultiModel.forEach((project: any, index: number) => {
        markdown += `**${index + 1}. [${project.name}](${project.url})**\n`;
        markdown += `- **Features Score**: ${project.ratings.features}/10\n`;
        markdown += `- **AI Services**: ${project.paidServices.join(', ') || 'Open source models'}\n`;
        markdown += `- **Framework**: ${project.framework}\n`;
        markdown += `- **Self-Hosting**: ${project.selfHosting.supported ? '✅' : '❌'}\n\n`;
      });
    }

    markdown += `## 📊 Analysis by Framework\n\n`;
    
    if (report.categories.length === 0) {
      markdown += `No frameworks found in the analysis.\n\n`;
    } else {
      markdown += `| Framework | Projects | Avg Features | Avg Deploy Ease | Multi-Model % |\n`;
      markdown += `|-----------|----------|--------------|-----------------|---------------|\n`;
      
      report.categories.forEach((category: any) => {
        const avgFeatures = (category.projects.reduce((sum: number, p: any) => sum + p.ratings.features, 0) / category.projects.length).toFixed(1);
        const avgDeploy = (category.projects.reduce((sum: number, p: any) => sum + p.ratings.deploymentEase, 0) / category.projects.length).toFixed(1);
        const multiModelPercent = Math.round((category.projects.filter((p: any) => p.customAISupport).length / category.projects.length) * 100);
        
        markdown += `| ${category.framework} | ${category.projects.length} | ${avgFeatures}/10 | ${avgDeploy}/10 | ${multiModelPercent}% |\n`;
      });
      
      markdown += `\n`;
    }

    markdown += `## 🚀 Deployment Guide\n\n`;
    markdown += `### Quick Start for Multi-Model Projects\n\n`;
    markdown += `Most trending projects support Docker deployment:\n\n`;
    markdown += `\`\`\`bash\n`;
    markdown += `# 1. Clone the project\n`;
    markdown += `git clone [project-url]\n`;
    markdown += `cd [project-directory]\n\n`;
    markdown += `# 2. Set up environment variables\n`;
    markdown += `cp .env.example .env\n`;
    markdown += `# Edit .env with your API keys (OpenAI, Anthropic, etc.)\n\n`;
    markdown += `# 3. Deploy with Docker\n`;
    markdown += `docker-compose up -d\n`;
    markdown += `\`\`\`\n\n`;
    
    markdown += `### Multi-Model Configuration\n\n`;
    markdown += `For projects with multi-model support:\n\n`;
    markdown += `1. **API Keys**: Configure multiple AI provider keys\n`;
    markdown += `2. **Model Selection**: Set default and fallback models\n`;
    markdown += `3. **Rate Limiting**: Configure per-provider limits\n`;
    markdown += `4. **Cost Management**: Monitor usage across providers\n\n`;

    markdown += `## 📈 Methodology\n\n`;
    markdown += `### Search Strategy\n\n`;
    markdown += `This analysis uses targeted GitHub searches focusing on:\n`;
    markdown += `- Projects updated within the last 6 months\n`;
    markdown += `- Multi-model AI integration keywords\n`;
    markdown += `- Self-hosting and deployment capabilities\n`;
    markdown += `- Active development indicators\n\n`;

    markdown += `### Multi-Model Detection\n\n`;
    markdown += `Projects are considered "multi-model" if they mention:\n`;
    markdown += `- Multiple AI providers (OpenAI, Anthropic, Hugging Face, etc.)\n`;
    markdown += `- Model switching or selection capabilities\n`;
    markdown += `- Custom model integration APIs\n`;
    markdown += `- Local model support (Ollama, GPT4All)\n\n`;

    markdown += `### Trending Score Calculation\n\n`;
    markdown += `Projects are ranked by a composite score including:\n`;
    markdown += `- **Recent Activity** (50%): Days since last update\n`;
    markdown += `- **Multi-Model Capabilities** (25%): AI integration features\n`;
    markdown += `- **Popularity** (15%): Stars and community engagement\n`;
    markdown += `- **Self-Hosting Support** (10%): Deployment ease\n\n`;

    markdown += `---\n\n`;
    markdown += `*This report focuses on newly updated projects with multi-model capabilities.*\n`;
    markdown += `*Generated by the Chatbot Solution Analyzer - [GitHub Repository](https://github.com/dzp5103/Chatbot-solution)*\n`;

    return markdown;
  }

  private calculateProjectScore(project: ChatbotProject): number {
    const now = new Date();
    const lastUpdated = new Date(project.lastUpdated);
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    
    // Weight recent activity heavily
    const activityScore = Math.max(0, 100 - daysSinceUpdate / 2);
    
    // Multi-model capabilities
    const multiModelScore = project.customAISupport ? 50 : 0;
    
    // Features and deployment ease
    const featureScore = project.ratings.features * 5;
    const deployScore = project.ratings.deploymentEase * 3;
    
    // Popularity (normalized)
    const popularityScore = Math.min(30, Math.log10(project.stars + 1) * 5);
    
    return activityScore + multiModelScore + featureScore + deployScore + popularityScore;
  }
}

// CLI execution
async function runTrendingAnalysis() {
  const analyzer = new TrendingChatbotAnalyzer();
  
  console.log('🔍 Analyzing newly updated multi-model chatbot projects...\n');
  console.log('This analysis focuses on:');
  console.log('✅ Projects updated in the last 6 months');
  console.log('✅ Multi-model AI capabilities');
  console.log('✅ Self-hosting support');
  console.log('✅ Active development and contributions\n');
  
  const projects = await analyzer.analyzeNewlyUpdatedProjects();
  
  if (projects.length > 0) {
    console.log('\n🎉 Analysis complete! Check the workspace/reports directory for detailed results.');
  } else {
    console.log('\n💡 Consider adjusting search criteria or checking your GitHub token for API access.');
  }
}

if (require.main === module) {
  runTrendingAnalysis().catch(console.error);
}

export { TrendingChatbotAnalyzer };