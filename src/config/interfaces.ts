interface BotConfig {
  botToken: string;
}

interface DatabaseConfig {
  clientEmail: string;
  privateKey: string;
  databaseURL: string;
  projectId: string;
}

interface MoreBotConfig extends BotConfig {
  database: DatabaseConfig;
}

export interface AppConfig {
  environment: string;
  isDevMode: boolean;
  port: number;
  more: MoreBotConfig;
}
