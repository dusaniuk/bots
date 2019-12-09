import { credential, firestore, initializeApp } from 'firebase-admin';
import { CONFIG } from '../../config';
import { Database } from '../interfaces/database';
import { UsersService } from './users.service';
import { CapturesService } from './captures.service';
import { CaptureRecord, Hunter } from '../models';

export class FirestoreDatabase implements Database {
  private readonly db: firestore.Firestore;

  private readonly chatRef: firestore.CollectionReference;

  private usersService: UsersService;
  private capturesService: CapturesService;

  constructor() {
    const app = initializeApp({
      credential: credential.cert({
        privateKey: CONFIG.firebase.privateKey,
        clientEmail: CONFIG.firebase.clientEmail,
        projectId: CONFIG.firebase.projectId,
      }),
      databaseURL: CONFIG.firebase.databaseURL,
    });

    this.db = app.firestore();
    this.chatRef = this.db.collection('chat');

    this.usersService = new UsersService(this.db);
    this.capturesService = new CapturesService(this.db);
  }

  addCaptureRecord(chatId: number, record: CaptureRecord): Promise<string> {
    return this.capturesService.addCaptureRecord(chatId, record);
  }

  addUserInChat(chatId: number, hunter: Hunter): Promise<void> {
    return this.usersService.addUserInChat(chatId, hunter);
  }

  approveCaptureRecord(chatId: number, recordId: string): Promise<void> {
    return this.capturesService.approveCaptureRecord(chatId, recordId);
  }

  getAllActiveChatsIDs(): Promise<number[]> {
    return this.usersService.getAllActiveChatsIDs();
  }

  getAllUsersFromChat(chatId: number): Promise<Hunter[]> {
    return this.usersService.getAllUsersFromChat(chatId);
  }

  getCaptureRecord(chatId: number, recordId: string): Promise<CaptureRecord> {
    return this.capturesService.getCaptureRecord(chatId, recordId);
  }

  getUserFromChat(userId: number, chatId: number): Promise<Hunter> {
    return this.usersService.getUserFromChat(userId, chatId);
  }

  isUserInChat(chatId: number, userId: number): Promise<boolean> {
    return this.usersService.isUserInChat(chatId, userId);
  }

  updateUserPoints(chatId: number, id: number, score: number): Promise<void> {
    return this.usersService.updateUserPoints(chatId, id, score);
  }
}
