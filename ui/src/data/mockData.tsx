// src/data/mockData.ts
export interface Task {
    id: number;
    title: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
  }
  
  export interface Content {
    id: number;
    title: string;
    type: 'video' | 'text' | 'image';
    status: 'draft' | 'in_review' | 'published';
  }
  
  export interface Financial {
    id: number;
    type: 'invoice' | 'budget';
    amount: number;
    status: 'pending' | 'paid';
  }
  
  export interface AnalyticsData {
    month: string;
    revenue: number;
    expenses: number;
  }
  
  export const mockTasks: Task[] = [
    { id: 1, title: 'Review sponsor pitch', priority: 'high', dueDate: '2025-03-05' },
    { id: 2, title: 'Plan next video', priority: 'medium', dueDate: '2025-03-07' },
  ];
  
  export const mockContent: Content[] = [
    { id: 1, title: 'Tutorial Video', type: 'video', status: 'draft' },
    { id: 2, title: 'Blog Post', type: 'text', status: 'published' },
  ];
  
  export const mockFinancials: Financial[] = [
    { id: 1, type: 'invoice', amount: 500, status: 'pending' },
    { id: 2, type: 'budget', amount: 2000, status: 'paid' },
  ];
  
  export const mockAnalytics: AnalyticsData[] = [
    { month: 'Jan', revenue: 1200, expenses: 800 },
    { month: 'Feb', revenue: 1500, expenses: 900 },
    { month: 'Mar', revenue: 1800, expenses: 1000 },
  ];