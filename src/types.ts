export enum AnnouncementType {
  Promotion = "宣傳",
  Announcement = "宣佈",
  Speech = "短講",
  Award = "頒獎",
  Other = "其他"
}

export interface Reservation {
  id: string;
  date: string; // YYYY-MM-DD
  type: AnnouncementType;
  customType?: string;
  teacher: string;
  content: string;
  duration?: number;
  teacherEmail: string;
  createdAt: any;
  updatedAt: any;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_LIMITS: Record<number, number | null> = {
  1: null, // Mon
  2: 15,   // Tue
  3: 20,   // Wed
  4: null, // Thu
  5: 20,   // Fri
  0: 0,    // Sun (No booking)
  6: 0     // Sat (No booking)
};

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}
