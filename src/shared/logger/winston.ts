import * as winston from 'winston';

const logger: winston.Logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.cli(),
    }),
  ],
});

export default logger;
