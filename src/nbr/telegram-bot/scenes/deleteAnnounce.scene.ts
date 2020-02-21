import { Stage } from 'telegraf';
import { inject, injectable } from 'inversify';

import { TYPES } from '../../types';
import { AppContext } from '../../../shared/interfaces';

import { MessageStore, UsersStore } from '../../core/interfaces/store';
import { MessageMetadata } from '../../core/interfaces/messages';

import { TelegramScene } from '../interfaces/telegramScene';
import { getApproveKeyboard, getDeleteMessagesKeyboard } from '../keyboards';
import { Actions, Scene } from '../constants/enums';


export interface DeleteAnnounceState {
  messages: MessageMetadata[];
  selectedMessage: MessageMetadata;
}

@injectable()
export class DeleteAnnounceScene extends TelegramScene {
  constructor(
    @inject(TYPES.MESSAGE_STORE) private messageStore: MessageStore,
    @inject(TYPES.USERS_STORE) private usersStore: UsersStore,
  ) {
    super(Scene.DeleteAnnounce);
  }

  protected attachHookListeners = (): void => {
    this.scene.enter(this.onEnterScene);
    this.scene.action(/^delete */, this.onDeleteMessage);
    this.scene.action(Actions.Approve, this.onApprove);
    this.scene.action(Actions.Restart, this.onRestart);

    this.scene.hears('abort', Stage.leave());
  };

  private onEnterScene = async (ctx: AppContext): Promise<void> => {
    this.dropState(ctx);

    const canDelete: boolean = await this.isAllowedToDeleteMessages(ctx.from.id);
    if (!canDelete) {
      await ctx.reply(ctx.i18n.t('deleteAnnounce.prohibited'));
      await ctx.scene.leave();
      return;
    }

    const messages: MessageMetadata[] = await this.messageStore.getLastMessages();
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
    if (!metadata) {
      await ctx.reply(ctx.i18n.t('deleteAnnounce.noMetadata'));
      return;
    }

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

    const deletedCount: number = await this.messageStore.deleteMessages(ctx, messageKeys);

    await ctx.replyWithMarkdown(
      ctx.i18n.t('deleteAnnounce.onSuccess', {
        recordsCount: deletedCount,
      }),
    );

    await this.messageStore.deleteMessageMetadata(id);
  };

  // helpers
  private isAllowedToDeleteMessages = async (userId: number): Promise<boolean> => {
    const user = await this.usersStore.getUser(userId.toString());

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
