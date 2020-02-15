import { DATABASE_TYPES } from '../database/types';

export const TYPES = {
  ...DATABASE_TYPES,

  MENTION_PARSER: Symbol.for('more.mentions-parser'),
  MENTION_SERVICE: Symbol.for('more.mention.service'),
  TELEGRAM_RESPONSE: Symbol.for('more.telegram-response'),
  CATCH_SERVICE: Symbol.for('more.catch.service'),
  SCORE_SERVICE: Symbol.for('more.score.service'),

  MORE_BOT: Symbol.for('more.bot'),
};
