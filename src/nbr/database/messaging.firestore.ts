import { ExtraEditMessage } from 'telegraf/typings/telegram-types';
import { inject, injectable } from 'inversify';
import { firestore } from 'firebase-admin';

import { AppContext, Database } from '../../shared/interfaces';

import { CONFIG } from '../../config';
import { TYPES } from '../types';

import { MessageKey, MessageMetadata } from '../core/interfaces/messages';
import { MessageStore } from '../core/interfaces/store';

const MARKDOWN_EXTRA: ExtraEditMessage = { parse_mode: 'Markdown', disable_notification: CONFIG.isDevMode };

@injectable()
export class MessagingFirestore implements MessageStore {
  private get nbrRef(): firestore.CollectionReference {
    return this.db.collection('nbr');
  }

  constructor(
    @inject(TYPES.DATABASE) private db: Database,
  ) { }


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

  deleteMessages = async (ctx: AppContext, keys: MessageKey[]): Promise<number> => {
    const result: boolean[] = await Promise.all(
      keys.map(({ chatId, messageId }: MessageKey) => {
        return ctx.telegram.deleteMessage(chatId, messageId);
      }),
    );

    return result.filter((isSucceeded: boolean) => isSucceeded).length;
  };

  saveMessageMetadata = async (data: MessageMetadata): Promise<void> => {
    await this.getMessagesRef().add(data);
  };

  deleteMessageMetadata = async (id: string): Promise<void> => {
    await this.getMessagesRef()
      .doc(id)
      .delete();
  };

  getLastMessages = async (): Promise<MessageMetadata[]> => {
    const query = await this.getMessagesRef()
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    return query.docs.map(
      (doc: firestore.QueryDocumentSnapshot): MessageMetadata => ({
        ...(doc.data() as MessageMetadata),
        id: doc.id,
      }),
    );
  };

  private getMessagesRef = (): firestore.CollectionReference => {
    return this.nbrRef.doc('group').collection('messages');
  };
}
