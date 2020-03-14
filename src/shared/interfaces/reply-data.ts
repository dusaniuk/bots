import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export interface ReplyData {
  templateData?: object;
  extra?: ExtraReplyMessage;
}