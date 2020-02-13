/* eslint-disable no-console */
import express from 'express';

import { CONFIG } from '../config';
import { Logger } from './logger';

const packageInfo = require('../../package.json');

export class Server {
  private app;

  constructor() {
    this.app = express();
    this.setRoutes();
  }

  run = (): void => {
    const port = CONFIG.port;

    this.app.listen(port, () => {
      Logger.info(`[serve] launch at port ${port}`);
    });
  };

  private setRoutes = (): void => {
    this.app.get('/', (req, res) => {
      res.send({
        description: packageInfo.description,
        version: packageInfo.version,
      });
    });
  };
}
