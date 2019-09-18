import express from 'express';
import { request } from 'https';

const packageInfo = require('../../package.json');

export class Server {
  private app;

  constructor() {
    this.app = express();
    this.setRoutes();
  }

  public run = (): void => {
    this.listenForPort();
    this.startCallingInterval();
  };

  private setRoutes = (): void => {
    this.app.get('/', (req, res) => {
      res.json({ version: packageInfo.version });
    });
  };

  private listenForPort = (): void => {
    const server = this.app.listen(process.env.PORT || '8080', () => {
      const { address: host, port } = server.address();

      // eslint-disable-next-line no-console
      console.log('Web server started at http://%s:%s', host, port);
    });
  };

  private startCallingInterval = (): void => {
    setInterval(() => {
      request('https://moreover-real-experience.herokuapp.com/', () => {
        // eslint-disable-next-line no-console
        console.log('WAKE UP DYNO');
      });
    }, 1200000);
  };
}
