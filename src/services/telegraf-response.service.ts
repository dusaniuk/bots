import { ContextMessageUpdate } from 'telegraf';
import { Message, MessageSticker } from 'telegraf/typings/telegram-types';

import { Hunter, User } from '../models';
import { getGreetingNameForUser } from '../utils/helpers';

const enum MoreFacesStickers {
  whatDoYouWant = 'CAADAgADdwEAAl56qRYDru4cgqib-BYE', // хулі ти доїбався
  ohMyGod = 'CAADAgADSAADXnqpFmUyRFH3_oQCFgQ', // о госпаді
}

export class TelegrafResponseService {
  userAlreadyInGame = async (ctx: ContextMessageUpdate): Promise<MessageSticker> => {
    await ctx.reply('Ти вже і так в грі!!');

    return ctx.replyWithSticker(MoreFacesStickers.whatDoYouWant);
  };

  greetNewUser = (ctx: ContextMessageUpdate, user: User): Promise<Message> => {
    const greetName = getGreetingNameForUser(user);
    return ctx.reply(`В нас тут новий покємон: ${greetName}.`);
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
    return ctx.reply('В capture команді немає зареєстрованих ігроків з цього чату. Перевір і попробуй ше раз');
  };

  rejectSelfCapture = (ctx: ContextMessageUpdate): Promise<Message> => {
    return ctx.reply('Нєє, ну ти канєшно знатно ахєрєл - сам себе ловити... Пшов вон!');
  };

  makeCaptureVictimsMsg = (hunter: User, victims: User[]): string => {
    const hunterName = getGreetingNameForUser(hunter);

    // TODO: make private function for ending
    let message = `${hunterName} зловив(ла): `;

    victims.forEach((user) => {
      message += ` ${getGreetingNameForUser(user)},`;
    });

    return message.substring(0, message.length - 1);
  };

  rejectPrivateChat = (ctx: ContextMessageUpdate) => {
    return ctx.reply('Е нєнєнє, я на роботу в приватних чатах не підписувався');
  };

  explainRulesToUser = async (ctx: ContextMessageUpdate) => {
    await ctx.replyWithSticker(MoreFacesStickers.ohMyGod);

    const msg = 'Ой блять, шо ж я вмію: я простенький бот, який тупо счітає бали в нашій грі.\n'
      + 'В нас є адмен Вадем, який то всьо контролює.\n\n'
      + 'Шоб приєднатись до гри, просто напиши "/reg" і всьо.\n\n'
      + 'Шоб подивитись весь счьот - юзається команда "/score".\n\n'
      + 'Ну і для того щоб зловити покемона, просто напиши "/capture @user1 @user2"'
      + '(замість capture можна просто написати англіську c)\n\n'
      + 'Ше в мене є така мінорна хня, як пінгування мене - просто напиши "/ping"';

    return ctx.reply(msg);
  };

  aveMaks = (ctx: ContextMessageUpdate): Promise<Message> => {
    return ctx.reply('Аве Макс!!!');
  };
}
