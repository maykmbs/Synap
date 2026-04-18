export type ItemType = 'finance' | 'task' | 'library' | 'note';
export type Priority = 'high' | 'medium' | 'low';
export type ItemStatus = 'pending' | 'done' | 'archived';

export interface InboxItem {
  id: string;
  user_id: string;
  type: ItemType;
  raw_text: string;
  data: FinanceData | TaskData | LibraryData | NoteData;
  status: ItemStatus;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface FinanceData {
  amount: number;
  currency: string;
  category: string;
  description: string;
}

export interface TaskData {
  title: string;
  priority: Priority;
  due_date: string | null;
}

export interface LibraryData {
  url: string;
  title: string;
  summary: string;
  content_type: 'link' | 'reel' | 'article';
}

export interface NoteData {
  content: string;
}
