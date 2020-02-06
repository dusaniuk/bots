import { ActivitiesData } from './activities';

export interface ActivitiesStore {
  getAll(): Promise<ActivitiesData>;

  save(userId: number, newActivities: string[]): Promise<void>;
}
