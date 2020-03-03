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
          privateKey: CONFIG.nbr.database.privateKey,
          clientEmail: CONFIG.nbr.database.clientEmail,
          projectId: CONFIG.nbr.database.projectId,
        }),
        databaseURL: CONFIG.nbr.database.databaseURL,
      }, expect.any(String));
    });
  });
});
