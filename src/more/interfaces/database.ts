import { CaptureRecord, Hunter } from '../models';

export interface UsersDatabase {
  addUserInChat(chatId: number, hunter: Hunter): Promise<void>;

  isUserInChat(chatId: number, userId: number): Promise<boolean>;

  getAllUsersFromChat(chatId: number): Promise<Hunter[]>;

  getUserFromChat(userId: number, chatId: number): Promise<Hunter>;

  updateUserPoints(chatId: number, id: number, score: number): Promise<void>;

  getAllActiveChatsIDs(): Promise<number[]>;
}

export interface CaptureDatabase {
  addCaptureRecord(chatId: number, record: CaptureRecord): Promise<string>;

  getCaptureRecord(chatId: number, recordId: string): Promise<CaptureRecord>;

  approveCaptureRecord(chatId: number, recordId: string): Promise<void>;
}

export interface Database extends UsersDatabase, CaptureDatabase {}
