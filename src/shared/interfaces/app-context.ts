import { SceneContextMessageUpdate } from 'telegraf/typings/stage';
import I18n from 'telegraf-i18n';

export interface AppContext extends SceneContextMessageUpdate {
  i18n: I18n;
}
