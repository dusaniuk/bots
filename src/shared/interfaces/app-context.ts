import { SceneContextMessageUpdate } from 'telegraf';
import I18n from 'telegraf-i18n';

export interface AppContext extends SceneContextMessageUpdate {
  i18n: I18n;
}
