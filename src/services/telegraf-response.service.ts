import { ContextMessageUpdate } from 'telegraf';
import { MessageSticker } from 'telegraf/typings/telegram-types';

const enum MoreFacesStickers {
  whatDoYouWant = 'CAADAgADdwEAAl56qRYDru4cgqib-BYE', // хулі ти доїбався
}

export class TelegrafResponseService {
  userAlreadyInGame = async (ctx: ContextMessageUpdate): Promise<MessageSticker> => {
    await ctx.reply('Ти вже і так в грі!!');

    return ctx.replyWithSticker(MoreFacesStickers.whatDoYouWant);
  };
}
