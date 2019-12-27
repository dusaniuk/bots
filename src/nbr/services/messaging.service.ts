import { ExtraEditMessage } from 'telegraf/typings/telegram-types';

import { firestore } from 'firebase-admin';
import { AppContext } from '../models/appContext';
import { MessageKey, MessageMetadata } from '../models/messages';
import { CONFIG } from '../../config';

const MARKDOWN_EXTRA: ExtraEditMessage = { parse_mode: 'Markdown', disable_notification: CONFIG.isDevMode };

export class MessagingService {
  private readonly nbrRef: firestore.CollectionReference;

  constructor(private db: firestore.Firestore) {
    this.nbrRef = this.db.collection('nbr');
  }

  sendMessages = (ctx: AppContext, userIds: number[], text: string): Promise<MessageKey[]> => {
    return Promise.all(
      userIds.map(
        async (userId: number): Promise<MessageKey> => {
          const message = await ctx.telegram.sendMessage(userId, text, MARKDOWN_EXTRA);

          return { chatId: userId, messageId: message.message_id };
        },
      ),
    );
  };

  saveMessageMetadata = async (data: MessageMetadata): Promise<void> => {
    await this.getMessagesRef().add(data);
  };

  private getMessagesRef = (): firestore.CollectionReference => {
    return this.nbrRef.doc('group').collection('messages');
  };
}
