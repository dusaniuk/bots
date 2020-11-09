interface BotConfig {
  botToken: string;
}

interface MoreBotConfig extends BotConfig {
  database: DatabaseConfig;
}

interface DatabaseConfig {
  clientEmail: string;
  privateKey: string;
  databaseURL: string;
  projectId: string;
}

export interface AppConfig {
  environment: string;
  isDevMode: boolean;
  port: number;
  more: MoreBotConfig;
}
