import { AppLogger } from './appLogger';
import winstonLogger from './winston';

export const Logger: AppLogger = {
  error: (message: string, ...meta: any[]): void => {
    winstonLogger.error(message, ...meta);
  },

  warn: (message: string, ...meta: any[]): void => {
    winstonLogger.warn(message, ...meta);
  },

  info: (message: string, ...meta: any[]): void => {
    winstonLogger.info(message, ...meta);
  },

  debug: (message: string, ...meta: any[]): void => {
    winstonLogger.debug(message, ...meta);
  },
};
