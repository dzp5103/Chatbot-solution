export interface ChatbotProject {
  name: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  lastUpdated: string;
  framework: string;
  customAISupport: boolean;
  selfHosting: {
    supported: boolean;
    methods: string[];
    complexity: 'easy' | 'medium' | 'hard';
  };
  ratings: {
    deploymentEase: number; // 1-10
    features: number; // 1-10
    cost: number; // 1-10 (10 = free/low cost, 1 = expensive)
  };
  requiredServices: string[];
  paidServices: string[];
}

export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

export interface AnalysisReport {
  generatedAt: string;
  totalProjects: number;
  categories: {
    framework: string;
    projects: ChatbotProject[];
  }[];
  recommendations: {
    easiestToDeploy: ChatbotProject[];
    mostFeatures: ChatbotProject[];
    bestValue: ChatbotProject[];
  };
}