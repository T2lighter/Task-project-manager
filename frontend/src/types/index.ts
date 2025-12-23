export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  urgency: boolean;
  importance: boolean;
  dueDate?: Date;
  userId: number;
  categoryId?: number;
  category?: Category;
}