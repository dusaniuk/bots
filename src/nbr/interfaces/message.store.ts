import { AppContext } from '../../shared/interfaces';
import { MessageKey, MessageMetadata } from './messages';

export interface MessageStore {
  sendMessages(ctx: AppContext, userIds: number[], text: string): Promise<MessageKey[]>;

  deleteMessages(ctx: AppContext, keys: MessageKey[]): Promise<number>;

  saveMessageMetadata(data: MessageMetadata): Promise<void>;

  deleteMessageMetadata(id: string): Promise<void>;

  getLastMessages(): Promise<MessageMetadata[]>;
}
