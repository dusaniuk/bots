import { firestore } from 'firebase-admin';
import { ActivitiesData } from '../models/activitiesData';
import { getActivitiesKeys } from '../utils/activities.utils';

export class ActivitiesService {
  private readonly nbrRef: firestore.CollectionReference;

  constructor(private db: firestore.Firestore) {
    this.nbrRef = this.db.collection('nbr');
  }

  getAll = async (): Promise<ActivitiesData> => {
    const query = await this.getActivitiesDoc().get();

    return query.data() as ActivitiesData;
  };

  save = async (userId: number, newActivities: string[]) => {
    const batch = this.db.batch();

    const activitiesData: ActivitiesData = await this.getAll();
    const activitiesList: string[] = getActivitiesKeys();

    activitiesList.forEach((activity: string) => {
      const userIDs = new Set([...(activitiesData[activity] || []), userId]);

      if (!newActivities.includes(activity)) {
        userIDs.delete(userId);
      }

      batch.update(this.getActivitiesDoc(), {
        [activity]: Array.from(userIDs),
      });
    });

    await batch.commit();
  };

  private getActivitiesDoc = (): firestore.DocumentReference => {
    return this.nbrRef.doc('activities');
  };
}
