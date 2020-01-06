import { credential, initializeApp } from 'firebase-admin';

import { createDatabase } from './firestore.database';
import { CONFIG } from '../config';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn().mockReturnValue({ firestore: () => {} }),
  credential: {
    cert: jest.fn().mockImplementation(props => props),
  },
}));

describe('firestore.database', () => {
  describe('createDatabase', () => {
    it('should initialize app with props from env', () => {
      createDatabase();

      expect(initializeApp).toHaveBeenCalledWith({
        credential: credential.cert({
          privateKey: CONFIG.firebase.privateKey,
          clientEmail: CONFIG.firebase.clientEmail,
          projectId: CONFIG.firebase.projectId,
        }),
        databaseURL: CONFIG.firebase.databaseURL,
      });
    });
  });
});
