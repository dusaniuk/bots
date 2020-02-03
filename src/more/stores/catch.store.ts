import { firestore } from 'firebase-admin';

import { CaptureRecord } from '../models';

export class CatchStore {
  private readonly chatRef: firestore.CollectionReference;

  constructor(private db: firestore.Firestore) {
    this.chatRef = this.db.collection('chat');
  }

  addCatchRecord = async (chatId: number, record: CaptureRecord): Promise<string> => {
    const capturesRef = this.getCapturesListRef(chatId);
    const result = await capturesRef.add(record);

    return result.id;
  };

  getCatchRecord = async (chatId: number, recordId: string): Promise<CaptureRecord> => {
    const query = await this.getCaptureRef(chatId, recordId).get();

    return query.data() as CaptureRecord;
  };

  approveCatch = async (chatId: number, recordId: string): Promise<void> => {
    const batch = this.db.batch();

    const captureRef = this.getCaptureRef(chatId, recordId);
    batch.update(captureRef, { approved: true });

    await batch.commit();
  };

  private getCapturesListRef = (chatId: number): firestore.CollectionReference => {
    return this.chatRef.doc(chatId.toString()).collection('captures');
  };

  private getCaptureRef = (chatId: number, captureId: string): FirebaseFirestore.DocumentReference => {
    return this.getCapturesListRef(chatId).doc(captureId.toString());
  };
}
