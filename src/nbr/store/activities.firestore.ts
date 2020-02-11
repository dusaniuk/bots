import { inject, injectable } from 'inversify';
import { firestore } from 'firebase-admin';

import { TYPES } from '../ioc/types';
import { Database } from '../../shared/interfaces';
import { getActivitiesKeys } from '../utils/activities.utils';
import { ActivitiesData, ActivitiesStore } from '../interfaces';

@injectable()
export class ActivitiesFirestore implements ActivitiesStore {
  private get nbrRef(): firestore.CollectionReference {
    return this.db.collection('nbr');
  }

  constructor(
    @inject(TYPES.DATABASE) private db: Database,
  ) { }

  getAll = async (): Promise<ActivitiesData> => {
    const query = await this.getActivitiesDoc().get();

    return query.data() as ActivitiesData;
  };

  save = async (userId: number, newActivities: string[]): Promise<void> => {
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
