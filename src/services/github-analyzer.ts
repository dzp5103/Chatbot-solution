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
    
    console.log('🔍 Searching for recently updated multi-model chatbot projects on GitHub...');
    console.log(`📅 Focusing on projects updated in the last ${GitHubConfig.recentMonths} months`);
    
    for (const query of GitHubConfig.searchQueries) {
      try {
        console.log(`   Searching: "${query}"`);
        
        // Search with multiple sort orders to get comprehensive results
        const searches = [
          { sort: 'updated' as const, order: 'desc' as const }, // Recently updated first
          { sort: 'stars' as const, order: 'desc' as const }    // Popular projects second
        ];

        for (const searchParams of searches) {
          const response = await this.octokit.rest.search.repos({
            q: query,
            sort: searchParams.sort,
            order: searchParams.order,
            per_page: 10
          });

          for (const repo of response.data.items) {
            if (!projects.find(p => p.url === repo.html_url)) {
              // Filter for recent activity
              const lastUpdated = new Date(repo.updated_at);
              const monthsAgo = new Date();
              monthsAgo.setMonth(monthsAgo.getMonth() - GitHubConfig.recentMonths);
              
              if (lastUpdated >= monthsAgo) {
                const project = await this.analyzeRepository(repo);
                if (project && await this.hasMultiModelCapabilities(project)) {
                  console.log(`   ✅ Found multi-model project: ${repo.name} (updated: ${lastUpdated.toDateString()})`);
                  projects.push(project);
                } else if (project) {
                  console.log(`   ⚠️  Project ${repo.name} lacks multi-model capabilities`);
                }
              } else {
                console.log(`   ⏰ Skipping outdated project: ${repo.name} (last updated: ${lastUpdated.toDateString()})`);
              }
            }
          }
          
          // Respect rate limits between searches
          await this.delay(1000);
        }
        
        // Longer delay between different queries
        await this.delay(2000);
        
      } catch (error) {
        console.error(`❌ Error searching with query "${query}":`, error);
      }
    }
    
    // Sort by combination of recent activity and multi-model score
    return projects.sort((a, b) => {
      const aScore = this.calculateTrendingScore(a);
      const bScore = this.calculateTrendingScore(b);
      return bScore - aScore;
    });
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
        return this.hasAIIntegrationKeywords(content);
      }
    } catch {
      // README not found or error reading
    }

    return false;
  }

  private async hasMultiModelCapabilities(project: ChatbotProject): Promise<boolean> {
    try {
      // Enhanced multi-model detection
      const owner = project.url.split('/')[3];
      const repoName = project.url.split('/')[4];
      
      // Check README for multi-model keywords
      const readme = await this.octokit.rest.repos.getContent({
        owner,
        repo: repoName,
        path: 'README.md'
      });

      if ('content' in readme.data) {
        const content = Buffer.from(readme.data.content, 'base64').toString().toLowerCase();
        
        // Count multi-model indicators
        let multiModelScore = 0;
        
        // Check for multiple AI provider mentions
        const providers = ['openai', 'anthropic', 'claude', 'hugging face', 'ollama', 'local model'];
        const foundProviders = providers.filter(provider => content.includes(provider));
        multiModelScore += foundProviders.length;
        
        // Check for multi-model specific terms
        const multiModelTerms = GitHubConfig.multiModelKeywords;
        const foundTerms = multiModelTerms.filter(term => content.includes(term.toLowerCase()));
        multiModelScore += foundTerms.length;
        
        // Check configuration files for multiple model endpoints
        try {
          const configFiles = ['config.json', '.env.example', 'docker-compose.yml'];
          for (const configFile of configFiles) {
            try {
              const config = await this.octokit.rest.repos.getContent({
                owner,
                repo: repoName,
                path: configFile
              });
              
              if ('content' in config.data) {
                const configContent = Buffer.from(config.data.content, 'base64').toString().toLowerCase();
                if (configContent.includes('api_key') || configContent.includes('model_') || configContent.includes('provider')) {
                  multiModelScore += 2;
                }
              }
            } catch {
              // Config file doesn't exist
            }
          }
        } catch {
          // Error checking config files
        }
        
        // Consider it multi-model if score >= 2 (at least 2 indicators)
        const isMultiModel = multiModelScore >= 2;
        console.log(`   🔍 Multi-model analysis for ${project.name}: score=${multiModelScore}, isMultiModel=${isMultiModel}`);
        return isMultiModel;
      }
    } catch (error) {
      console.error(`❌ Error checking multi-model capabilities for ${project.name}:`, error);
    }

    return false;
  }

  private hasAIIntegrationKeywords(content: string): boolean {
    const aiKeywords = [
      'api integration',
      'custom model',
      'openai',
      'anthropic',
      'claude',
      'hugging face',
      'custom ai',
      'llm integration',
      'model api',
      'webhook',
      'rest api',
      'ollama',
      'local model',
      'gpt',
      'llama',
      'transformers'
    ];

    return aiKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private calculateTrendingScore(project: ChatbotProject): number {
    // Calculate trending score based on recent activity and multi-model capabilities
    const now = new Date();
    const lastUpdated = new Date(project.lastUpdated);
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    
    // Recent activity score (higher = more recent)
    const activityScore = Math.max(0, 100 - daysSinceUpdate / 3); // Decay over 300 days
    
    // Popularity score (normalized)
    const popularityScore = Math.min(50, Math.log10(project.stars + 1) * 10);
    
    // Multi-model bonus
    const multiModelBonus = project.customAISupport ? 25 : 0;
    
    // Self-hosting bonus (important for the repository focus)
    const selfHostingBonus = project.selfHosting.supported ? 15 : 0;
    
    // Feature richness
    const featureScore = project.ratings.features * 2;
    
    const totalScore = activityScore + popularityScore + multiModelBonus + selfHostingBonus + featureScore;
    
    console.log(`   📊 Trending score for ${project.name}: ${totalScore.toFixed(1)} (activity: ${activityScore.toFixed(1)}, popularity: ${popularityScore.toFixed(1)}, multi-model: ${multiModelBonus}, features: ${featureScore})`);
    
    return totalScore;
  }

  private detectFramework(name: string, description: string): string {
    const text = `${name} ${description}`.toLowerCase();
    
    // Multi-model and modern AI frameworks
    if (text.includes('langchain') || text.includes('lang-chain')) return 'LangChain';
    if (text.includes('llamaindex') || text.includes('llama-index')) return 'LlamaIndex';
    if (text.includes('semantic kernel')) return 'Semantic Kernel';
    if (text.includes('haystack')) return 'Haystack';
    if (text.includes('autogen')) return 'AutoGen';
    
    // Traditional chatbot frameworks
    if (text.includes('rasa')) return 'Rasa';
    if (text.includes('botpress')) return 'Botpress';
    if (text.includes('microsoft bot') || text.includes('bot framework')) return 'Microsoft Bot Framework';
    if (text.includes('dialogflow')) return 'Dialogflow';
    if (text.includes('wit.ai')) return 'Wit.ai';
    if (text.includes('chatterbot')) return 'ChatterBot';
    if (text.includes('botman')) return 'BotMan';
    if (text.includes('botkit')) return 'Botkit';
    
    // AI/LLM platforms
    if (text.includes('ollama')) return 'Ollama Integration';
    if (text.includes('hugging face') || text.includes('transformers')) return 'Hugging Face';
    if (text.includes('openai') && (text.includes('api') || text.includes('integration'))) return 'OpenAI Integration';
    if (text.includes('anthropic') || text.includes('claude')) return 'Anthropic Integration';
    
    // Web frameworks with chat
    if (text.includes('react') || text.includes('vue') || text.includes('angular')) return 'Web Framework';
    if (text.includes('streamlit') || text.includes('gradio')) return 'Python Web App';
    if (text.includes('fastapi') || text.includes('flask')) return 'Python API';
    if (text.includes('express') || text.includes('nest')) return 'Node.js API';
    
    // Language-based detection
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

    // Features (1-10, enhanced for multi-model and recent activity)
    let features = Math.min(6, Math.floor(repo.stargazers_count / 100) + 1);
    
    // Bonus for custom AI (multi-model capabilities)
    if (customAI) features += 3; // Increased bonus for AI integration
    
    // Bonus for modern tech stack
    if (repo.language === 'TypeScript' || repo.language === 'Python') features += 1;
    
    // Bonus for recent activity
    const lastUpdated = new Date(repo.updated_at);
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - 3); // Last 3 months
    if (lastUpdated >= monthsAgo) features += 2; // Recent activity bonus
    
    // Bonus for active community (more forks = more contributors)
    if (repo.forks_count > 100) features += 1;
    
    features = Math.min(10, features);

    // Cost (1-10, 10 = cheapest/free, 1 = most expensive)
    let cost = 8; // Assume open source is mostly free
    const description = repo.description?.toLowerCase() || '';
    
    // Penalty for cloud/SaaS dependencies
    if (description.includes('cloud') || description.includes('saas')) cost -= 3;
    if (description.includes('enterprise')) cost -= 2;
    
    // Bonus for self-hostable solutions
    if (deployment.methods.includes('Docker')) cost += 1;
    if (deployment.methods.includes('Local')) cost += 1;
    
    // Multi-model might require API costs, slight penalty
    if (customAI && (description.includes('openai') || description.includes('api'))) cost -= 1;
    
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
        
        // Enhanced detection for multi-model services
        const servicePatterns = [
          { pattern: ['openai', 'gpt', 'chatgpt'], service: 'OpenAI API' },
          { pattern: ['anthropic', 'claude'], service: 'Anthropic API' },
          { pattern: ['hugging face', 'huggingface', 'hf'], service: 'Hugging Face API' },
          { pattern: ['cohere'], service: 'Cohere API' },
          { pattern: ['azure', 'azure openai'], service: 'Azure OpenAI' },
          { pattern: ['aws', 'amazon', 'bedrock'], service: 'AWS Bedrock' },
          { pattern: ['google cloud', 'gcp', 'vertex ai'], service: 'Google Cloud AI' },
          { pattern: ['replicate'], service: 'Replicate API' },
          { pattern: ['together ai', 'together.ai'], service: 'Together AI' },
          { pattern: ['fireworks ai'], service: 'Fireworks AI' },
          { pattern: ['twilio'], service: 'Twilio' },
          { pattern: ['stripe'], service: 'Stripe' },
          { pattern: ['pinecone'], service: 'Pinecone Vector DB' },
          { pattern: ['weaviate'], service: 'Weaviate' },
          { pattern: ['qdrant'], service: 'Qdrant' }
        ];

        for (const { pattern, service } of servicePatterns) {
          if (pattern.some(p => content.includes(p))) {
            paidServices.push(service);
          }
        }

        // Check for configuration files for additional service detection
        try {
          const configFiles = ['.env.example', 'docker-compose.yml', 'config.json'];
          for (const configFile of configFiles) {
            try {
              const config = await this.octokit.rest.repos.getContent({
                owner,
                repo,
                path: configFile
              });
              
              if ('content' in config.data) {
                const configContent = Buffer.from(config.data.content, 'base64').toString().toLowerCase();
                
                // Look for API key patterns
                if (configContent.includes('openai_api_key')) paidServices.push('OpenAI API');
                if (configContent.includes('anthropic_api_key')) paidServices.push('Anthropic API');
                if (configContent.includes('huggingface_api_key')) paidServices.push('Hugging Face API');
                if (configContent.includes('cohere_api_key')) paidServices.push('Cohere API');
              }
            } catch {
              // Config file doesn't exist
            }
          }
        } catch {
          // Error checking config files
        }
      }
    } catch {
      // README not found or error reading
    }

    // Remove duplicates
    return [...new Set(paidServices)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}