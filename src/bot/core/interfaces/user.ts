export interface UserWithScore {
  user: User;
  points: number;
}

export type Score = UserWithScore[];

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  isAdmin?: boolean;
}

export interface ScoreItem {
  hunterId: number;
  points: number;
}
