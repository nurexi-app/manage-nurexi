export interface Activity {
  id: number;
  created_at: string;
  type: string;
  action: string;
  title: string;
  description: string;
  read: boolean;
}

export interface PendingSession {
  id: number | string;
  title?: string;
  name?: string;
  created_at: string;
  is_active?: boolean;
}
