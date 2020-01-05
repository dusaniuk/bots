import { AppContext } from '../../shared/models/appContext';

export const stringifyUserGreeting = ({ from }: AppContext): string => {
  const user = `${from.first_name} ${from.last_name || ''}`.trimRight();

  return from.username ? `*${user}* (@${from.username})` : `*${user}*`;
};
