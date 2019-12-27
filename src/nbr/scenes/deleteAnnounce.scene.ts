import { BaseScene, Stage } from 'telegraf';
import { firestore } from 'firebase-admin';

import { MessagingService } from '../services/messaging.service';
import { AppContext } from '../models/appContext';
import { MessageMetadata } from '../models/messages';
import { getDeleteMessagesKeyboard } from '../keyboards/deleteMessages.keyboard';
import { getApproveKeyboard } from '../keyboards';
import { Actions } from '../constants/enums';
import { UsersService } from '../services/users.service';

interface DeleteAnnounceState {
  messages: MessageMetadata[];
  selectedMessage: MessageMetadata;
}

export class DeleteAnnounceScene {
  private readonly messagingService: MessagingService;
  private readonly usersService: UsersService;

  public static ID: string = 'delete-announce';

  public scene: BaseScene<AppContext>;

  constructor(private db: firestore.Firestore) {
    this.messagingService = new MessagingService(db);
    this.usersService = new UsersService(db);

    this.scene = new BaseScene(DeleteAnnounceScene.ID);
    this.scene.hears('abort', Stage.leave());

    this.attachHookListeners();
  }

  private attachHookListeners = () => {
    this.scene.enter(this.onEnterScene);
    this.scene.action(/^delete */, this.onDeleteMessage);
    this.scene.action(Actions.Approve, this.onApprove);
    this.scene.action(Actions.Restart, this.onRestart);
  };

  private onEnterScene = async (ctx: AppContext): Promise<void> => {
    this.dropState(ctx);

    if (!this.isAllowedToDeleteMessages(ctx.from.id)) {
      await ctx.reply(ctx.i18n.t('deleteAnnounce.prohibited'));
      await ctx.scene.leave();
      return;
    }

    const messages: MessageMetadata[] = await this.messagingService.getLastMessages();
    this.getState(ctx).messages = messages;

    if (messages.length === 0) {
      await ctx.reply(ctx.i18n.t('deleteAnnounce.noMessages'));
      await ctx.scene.leave();
      return;
    }

    const keyboard = getDeleteMessagesKeyboard(messages);
    await ctx.reply(ctx.i18n.t('deleteAnnounce.intro2'), keyboard);
  };

  private onDeleteMessage = async (ctx: AppContext): Promise<void> => {
    await ctx.deleteMessage();

    const state: DeleteAnnounceState = this.getState(ctx);

    const messageId: string = ctx.callbackQuery.data.split(' ')[1];
    const metadata: MessageMetadata = state.messages.find(({ id }: MessageMetadata) => id === messageId);
    state.selectedMessage = metadata;

    const message = ctx.i18n.t('deleteAnnounce.onDelete', {
      usersCount: metadata.messageKeys.length,
      messageText: metadata.messageText,
    });

    await ctx.replyWithMarkdown(message, getApproveKeyboard(ctx));
  };

  private onRestart = async (ctx: AppContext): Promise<void> => {
    await ctx.deleteMessage();
    await ctx.scene.reenter();
  };

  private onApprove = async (ctx: AppContext): Promise<void> => {
    const {
      selectedMessage: { id, messageKeys },
    }: DeleteAnnounceState = this.getState(ctx);

    const deletedCount: number = await this.messagingService.deleteMessages(ctx, messageKeys);

    await ctx.replyWithMarkdown(
      ctx.i18n.t('deleteAnnounce.onSuccess', {
        recordsCount: deletedCount,
      }),
    );

    await this.messagingService.deleteMessageMetadata(id);
  };

  // helpers
  private isAllowedToDeleteMessages = async (userId: number): Promise<boolean> => {
    const user = await this.usersService.getUser(userId.toString());

    return !!user.allowedToAnnounce;
  };

  private getState = (ctx: AppContext): DeleteAnnounceState => {
    return ctx.scene.state as DeleteAnnounceState;
  };

  private dropState = (ctx: AppContext): void => {
    ctx.scene.state = {
      messages: [],
      selectedMessage: {},
    };
  };
}
