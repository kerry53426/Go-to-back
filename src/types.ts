export interface Registration {
  id?: string;
  userId: string;
  userName: string; // The user's display name
  date: string; // YYYY-MM-DD
  goingDown: boolean;
  goingUp: boolean;
  stayingZhudong: boolean;
  note?: string;
  timestamp: number;
}

export interface UserRole {
  role: 'employee' | 'driver' | 'admin';
  displayName: string;
}
