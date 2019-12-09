export interface CaptureRecord {
  approved?: boolean;
  hunterId: number;
  timestamp: number;
  victims: number[];
  points?: number;
}
