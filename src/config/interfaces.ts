interface BotConfig {
  botToken: string;
}

interface FeedSchedulerConfig {
  pattern: string;
  targetChat: number;
}

interface NbrBotConfig extends BotConfig {
  whitelistedChats: number[];
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
  feedSchedule: FeedSchedulerConfig;
  more: BotConfig;
  nbr: NbrBotConfig;
  firebase: DatabaseConfig;
}
