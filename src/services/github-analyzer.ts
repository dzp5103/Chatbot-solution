import { Octokit } from 'octokit';
import { ChatbotProject } from '../types';
import { GitHubConfig } from '../config';

export class GitHubAnalyzer {
  private octokit: Octokit;
  
  constructor() {
    this.octokit = new Octokit({
      auth: GitHubConfig.token,
      baseUrl: GitHubConfig.baseURL
    });
  }

  async searchChatbotProjects(): Promise<ChatbotProject[]> {
    const projects: ChatbotProject[] = [];
    
    console.log('🔍 Searching for chatbot projects on GitHub...');
    
    for (const query of GitHubConfig.searchQueries) {
      try {
        console.log(`   Searching: "${query}"`);
        
        const response = await this.octokit.rest.search.repos({
          q: query,
          sort: 'stars',
          order: 'desc',
          per_page: 10
        });

        for (const repo of response.data.items) {
          if (!projects.find(p => p.url === repo.html_url)) {
            const project = await this.analyzeRepository(repo);
            if (project) {
              projects.push(project);
            }
          }
        }
        
        // Respect rate limits
        await this.delay(1000);
        
      } catch (error) {
        console.error(`❌ Error searching with query "${query}":`, error);
      }
    }
    
    return projects.sort((a, b) => b.stars - a.stars);
  }

  private async analyzeRepository(repo: any): Promise<ChatbotProject | null> {
    try {
      // Get additional repository details
      const repoDetails = await this.octokit.rest.repos.get({
        owner: repo.owner.login,
        repo: repo.name
      });

      // Check for README and deployment documentation
      const deploymentInfo = await this.analyzeDeploymentOptions(repo.owner.login, repo.name);
      const customAISupport = await this.checkCustomAISupport(repo.owner.login, repo.name);
      
      const project: ChatbotProject = {
        name: repo.name,
        url: repo.html_url,
        description: repo.description || 'No description available',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || 'Unknown',
        lastUpdated: repo.updated_at,
        framework: this.detectFramework(repo.name, repo.description),
        customAISupport,
        selfHosting: deploymentInfo,
        ratings: this.calculateRatings(repo, deploymentInfo, customAISupport),
        requiredServices: await this.analyzeRequiredServices(repo.owner.login, repo.name),
        paidServices: await this.analyzePaidServices(repo.owner.login, repo.name)
      };

      return project;
      
    } catch (error) {
      console.error(`❌ Error analyzing repository ${repo.full_name}:`, error);
      return null;
    }
  }

  private async analyzeDeploymentOptions(owner: string, repo: string): Promise<{
    supported: boolean;
    methods: string[];
    complexity: 'easy' | 'medium' | 'hard';
  }> {
    const methods: string[] = [];
    let complexity: 'easy' | 'medium' | 'hard' = 'hard';

    try {
      // Check for common deployment files
      const deploymentFiles = [
        'Dockerfile',
        'docker-compose.yml',
        'docker-compose.yaml',
        'package.json',
        'requirements.txt',
        'README.md',
        'DEPLOYMENT.md',
        'INSTALL.md'
      ];

      for (const file of deploymentFiles) {
        try {
          await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path: file
          });

          if (file === 'Dockerfile' || file.includes('docker-compose')) {
            methods.push('Docker');
            complexity = 'easy';
          } else if (file === 'package.json') {
            methods.push('npm/Node.js');
            if (complexity === 'hard') complexity = 'medium';
          } else if (file === 'requirements.txt') {
            methods.push('pip/Python');
            if (complexity === 'hard') complexity = 'medium';
          }
        } catch {
          // File doesn't exist, continue
        }
      }

      // Check for Kubernetes manifests
      try {
        await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: 'k8s'
        });
        methods.push('Kubernetes');
      } catch {
        // Directory doesn't exist
      }

      return {
        supported: methods.length > 0,
        methods,
        complexity
      };

    } catch (error) {
      return {
        supported: false,
        methods: [],
        complexity: 'hard'
      };
    }
  }

  private async checkCustomAISupport(owner: string, repo: string): Promise<boolean> {
    try {
      // Check README for API integration mentions
      const readme = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'README.md'
      });

      if ('content' in readme.data) {
        const content = Buffer.from(readme.data.content, 'base64').toString();
        const aiKeywords = [
          'api integration',
          'custom model',
          'openai',
          'anthropic',
          'hugging face',
          'custom ai',
          'llm integration',
          'model api',
          'webhook',
          'rest api'
        ];

        return aiKeywords.some(keyword => 
          content.toLowerCase().includes(keyword.toLowerCase())
        );
      }
    } catch {
      // README not found or error reading
    }

    return false;
  }

  private detectFramework(name: string, description: string): string {
    const text = `${name} ${description}`.toLowerCase();
    
    if (text.includes('rasa')) return 'Rasa';
    if (text.includes('botpress')) return 'Botpress';
    if (text.includes('microsoft bot') || text.includes('bot framework')) return 'Microsoft Bot Framework';
    if (text.includes('dialogflow')) return 'Dialogflow';
    if (text.includes('wit.ai')) return 'Wit.ai';
    if (text.includes('chatterbot')) return 'ChatterBot';
    if (text.includes('botman')) return 'BotMan';
    if (text.includes('botkit')) return 'Botkit';
    if (text.includes('react') || text.includes('vue') || text.includes('angular')) return 'Web Framework';
    if (text.includes('python')) return 'Python';
    if (text.includes('node') || text.includes('javascript') || text.includes('typescript')) return 'Node.js';
    
    return 'Custom/Other';
  }

  private calculateRatings(repo: any, deployment: any, customAI: boolean): {
    deploymentEase: number;
    features: number;
    cost: number;
  } {
    // Deployment ease (1-10, 10 = easiest)
    let deploymentEase = 3; // Base score
    if (deployment.methods.includes('Docker')) deploymentEase += 4;
    if (deployment.methods.includes('npm/Node.js')) deploymentEase += 2;
    if (deployment.complexity === 'easy') deploymentEase += 2;
    else if (deployment.complexity === 'medium') deploymentEase += 1;
    deploymentEase = Math.min(10, deploymentEase);

    // Features (1-10, based on stars, activity, and custom AI)
    let features = Math.min(8, Math.floor(repo.stargazers_count / 100) + 1);
    if (customAI) features += 2;
    if (repo.language === 'TypeScript' || repo.language === 'Python') features += 1;
    features = Math.min(10, features);

    // Cost (1-10, 10 = cheapest/free, 1 = most expensive)
    let cost = 8; // Assume open source is mostly free
    const description = repo.description?.toLowerCase() || '';
    if (description.includes('cloud') || description.includes('saas')) cost -= 3;
    if (description.includes('enterprise')) cost -= 2;
    if (deployment.methods.includes('Docker')) cost += 1; // Self-hostable
    cost = Math.max(1, Math.min(10, cost));

    return { deploymentEase, features, cost };
  }

  private async analyzeRequiredServices(owner: string, repo: string): Promise<string[]> {
    const services: string[] = [];
    
    try {
      // Check for common service dependencies
      const packageJson = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'package.json'
      });

      if ('content' in packageJson.data) {
        const content = JSON.parse(Buffer.from(packageJson.data.content, 'base64').toString());
        const deps = { ...content.dependencies, ...content.devDependencies };
        
        if (deps.redis) services.push('Redis');
        if (deps.mongodb || deps.mongoose) services.push('MongoDB');
        if (deps.postgres || deps.pg) services.push('PostgreSQL');
        if (deps.mysql) services.push('MySQL');
      }
    } catch {
      // No package.json or error reading
    }

    return services;
  }

  private async analyzePaidServices(owner: string, repo: string): Promise<string[]> {
    const paidServices: string[] = [];
    
    try {
      const readme = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'README.md'
      });

      if ('content' in readme.data) {
        const content = Buffer.from(readme.data.content, 'base64').toString().toLowerCase();
        
        if (content.includes('openai') || content.includes('gpt')) paidServices.push('OpenAI API');
        if (content.includes('anthropic') || content.includes('claude')) paidServices.push('Anthropic API');
        if (content.includes('azure')) paidServices.push('Azure Services');
        if (content.includes('aws') || content.includes('amazon')) paidServices.push('AWS Services');
        if (content.includes('google cloud') || content.includes('gcp')) paidServices.push('Google Cloud');
        if (content.includes('twilio')) paidServices.push('Twilio');
        if (content.includes('stripe')) paidServices.push('Stripe');
      }
    } catch {
      // README not found or error reading
    }

    return paidServices;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}