import { ContextMessageUpdate } from 'telegraf';
import { MessageSticker, Message } from 'telegraf/typings/telegram-types';

import { Hunter, User } from '../models';
import { getGreetingNameForUser } from '../utils/helpers';

const enum MoreFacesStickers {
  whatDoYouWant = 'CAADAgADdwEAAl56qRYDru4cgqib-BYE', // хулі ти доїбався
}

export class TelegrafResponseService {
  userAlreadyInGame = async (ctx: ContextMessageUpdate): Promise<MessageSticker> => {
    await ctx.reply('Ти вже і так в грі!!');

    return ctx.replyWithSticker(MoreFacesStickers.whatDoYouWant);
  };

  greetNewUser = (ctx: ContextMessageUpdate, user: User): Promise<Message> => {
    const greetName = getGreetingNameForUser(user);
    return ctx.reply(`Старий Вояка ${greetName} приєднався до нас`);
  };

  getHuntersScore = (ctx: ContextMessageUpdate, hunters: Hunter[]): Promise<Message> => {
    let msg = '';

    hunters.forEach((user: Hunter, index: number) => {
      let name = getGreetingNameForUser(user);
      if (name.startsWith('@')) {
        name = name.substring(1);
      }

      msg += `${index + 1}) ${name}: ${user.score || 0} \n`;
    });

    return ctx.reply(msg);
  };

  showCaptureInstructions = (ctx: ContextMessageUpdate): Promise<Message> => {
    return ctx.reply('Для того, шоб зловити покемонів, треба руцями написати "/capture @username" або "/c @username".');
  };

  noUsersToCapture = (ctx: ContextMessageUpdate): Promise<Message> => {
    return ctx.reply('В команді немає ігроків з цього чату');
  };

  makeCaptureVictimsMsg = (hunter: User, victims: User[]): string => {
    const hunterName = getGreetingNameForUser(hunter);

    let message = `${hunterName} зловив пару покемонів: ${victims.length} `;

    victims.forEach((user) => {
      message += ` ${getGreetingNameForUser(user)},`;
    });

    return message.substring(0, message.length - 1);
  };
}
