/* eslint-disable no-console */
import express from 'express';
import { request } from 'https';

import { CONFIG } from '../config';

const packageInfo = require('../../package.json');

export class Server {
  private app;

  constructor() {
    this.app = express();
    this.setRoutes();
  }

  public run = (): void => {
    if (CONFIG.environment === 'dev') {
      console.log('suppress web server startup locally');
      return;
    }

    this.listenForPort();
    this.startCallingInterval();
  };

  private setRoutes = (): void => {
    this.app.get('/', (req, res) => {
      res.send({
        description: packageInfo.description,
        version: packageInfo.version,
      });
    });
  };

  private listenForPort = (): void => {
    const server = this.app.listen(process.env.PORT || '8080', () => {
      const { address: host, port } = server.address();

      console.log('web server started at http://%s:%s', host, port);
    });
  };

  private startCallingInterval = (): void => {
    setInterval(() => {
      request('https://moreover-real-experience.herokuapp.com/', () => {
        console.log('wake up dyno');
      });
    }, 1200000);
  };
}
