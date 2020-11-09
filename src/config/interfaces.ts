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

export interface PackageInfo {
  name?: string;
  version?: string;
  description?: string;
}

export interface AppConfig {
  environment: string;
  isDevMode: boolean;
  info?: PackageInfo;
  port: number;
  more: MoreBotConfig;
}
