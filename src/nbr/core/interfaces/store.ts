import { AppContext } from '../../../shared/interfaces';

import { TelegramUser } from './telegramUser';
import { ActivitiesData } from './activities';
import { MessageKey, MessageMetadata } from './messages';

export interface ActivitiesStore {
  getAll(): Promise<ActivitiesData>;

  save(userId: number, newActivities: string[]): Promise<void>;
}

export interface MessageStore {
  sendMessages(ctx: AppContext, userIds: number[], text: string): Promise<MessageKey[]>;

  deleteMessages(ctx: AppContext, keys: MessageKey[]): Promise<number>;

  saveMessageMetadata(data: MessageMetadata): Promise<void>;

  deleteMessageMetadata(id: string): Promise<void>;

  getLastMessages(): Promise<MessageMetadata[]>;
}

export interface UsersStore {
  getUser(userId: string): Promise<TelegramUser>;

  saveUser(user: TelegramUser): Promise<void>;
}
