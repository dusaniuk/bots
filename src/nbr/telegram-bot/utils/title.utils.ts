import { AppContext } from '../../../shared/interfaces/app-context';
import { Actions, Activity } from '../constants/enums';

export const getTitleWithEmoji = (ctx: AppContext, key: Actions | Activity | string): string => {
  return ctx.i18n.t(`title.${key}`);
};

export const getTitle = (ctx: AppContext, key: Actions | Activity | string): string => {
  const title = getTitleWithEmoji(ctx, key);
  return title
    .split(' ')
    .slice(0, -1)
    .join(' ');
};
