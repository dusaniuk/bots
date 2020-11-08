import { credential, initializeApp } from 'firebase-admin';

import { createDbConnection } from './firestore.connection';
import { CONFIG } from '../../config';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn().mockReturnValue({ firestore: jest.fn() }),
  credential: {
    cert: jest.fn().mockImplementation((props) => props),
  },
}));

describe('firestore.connection', () => {
  describe('createDatabase', () => {
    it('should initialize app with props from env', () => {
      createDbConnection();

      expect(initializeApp).toHaveBeenCalledWith({
        credential: credential.cert({
          privateKey: CONFIG.more.database.privateKey,
          clientEmail: CONFIG.more.database.clientEmail,
          projectId: CONFIG.more.database.projectId,
        }),
        databaseURL: CONFIG.more.database.databaseURL,
      }, expect.any(String));
    });
  });
});
