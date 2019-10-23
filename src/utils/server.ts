/* eslint-disable no-console */
import express from 'express';

import { CONFIG } from '../config';

const packageInfo = require('../../package.json');

export class Server {
  private app;

  constructor() {
    this.app = express();
    this.setRoutes();
  }

  run = (): void => {
    const port = this.getPort();

    this.app.listen(port, () => {
      console.log(`web server started at port ${port}`);
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

  private getPort = (): string => CONFIG.port || '8080';
}
