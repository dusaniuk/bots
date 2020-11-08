export const TYPES = {
  CONTEXT_PARSER: Symbol.for('more.mentions-parser'),
  MENTION_SERVICE: Symbol.for('more.mention.service'),
  CATCH_SERVICE: Symbol.for('more.catch.service'),
  SCORE_SERVICE: Symbol.for('more.score.service'),

  USERS_CONTROLLER: Symbol.for('more.users.controller'),
  SCORE_CONTROLLER: Symbol.for('more.score.controller'),
  CATCH_CONTROLLER: Symbol.for('more.catch.controller'),

  DATABASE: Symbol.for('more.db.connection'),
  CATCH_STORE: Symbol.for('more.catch.store'),
  USERS_STORE: Symbol.for('more.users.store'),

  REGISTER_HANDLER: Symbol.for('more.action.register-handler'),
  UPDATE_HANDLER: Symbol.for('more.action.update-handler'),
  SCORE_HANDLER: Symbol.for('more.action.score-handler'),
  NEW_MEMBER_HANDLER: Symbol.for('more.action.new-member-handler'),
  LEFT_MEMBER_HANDLER: Symbol.for('more.action.left-member-handler'),
  HELP_HANDLER: Symbol.for('more.action.help'),
  PING_HANDLER: Symbol.for('more.action.ping'),
  CATCH_HANDLER: Symbol.for('more.action.catch'),
  APPROVE_CATCH_HANDLER: Symbol.for('more.action.approve-catch'),
  REJECT_CATCH_HANDLER: Symbol.for('more.action.reject-catch'),

  MORE_BOT: Symbol.for('more.bot'),
};
