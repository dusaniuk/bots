export interface TelegramUser {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  allowedToAnnounce?: boolean;
}
