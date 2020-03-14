import { AppContext, ReplyData } from '../interfaces';


export abstract class BaseReplyService {
  protected constructor(protected ctx: AppContext) { }

  protected reply = async (resourceKey: string, replyData?: ReplyData): Promise<void> => {
    const message: string = this.getMessageByKey(resourceKey, replyData?.templateData);

    if (replyData?.extra) {
      await this.ctx.replyWithMarkdown(message, replyData.extra);
    } else {
      await this.ctx.replyWithMarkdown(message);
    }
  };

  protected sendMessage = async (chatId: number, resourceKey: string, replyData?: ReplyData): Promise<void> => {
    const message: string = this.getMessageByKey(resourceKey, replyData?.templateData);

    if (replyData?.extra) {
      await this.ctx.telegram.sendMessage(chatId, message, replyData.extra);
    } else {
      await this.ctx.telegram.sendMessage(chatId, message);
    }
  };

  protected answerCbQuery = async (resourceKey: string): Promise<void> => {
    const message: string = this.getMessageByKey(resourceKey);

    await this.ctx.answerCbQuery(message);
  };

  protected deleteLastMessage = async (): Promise<void> => {
    await this.ctx.deleteMessage();
  };


  private getMessageByKey = (resourceKey: string, templateData?: object): string => {
    if (templateData) {
      return this.ctx.i18n.t(resourceKey, templateData);
    }

    return this.ctx.i18n.t(resourceKey);
  };
}
