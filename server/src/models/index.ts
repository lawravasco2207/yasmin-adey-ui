// src/models/index.ts
export interface User {
    id: number;
    username: string;
    password: string; // In production, hash this!
  }
  
  export interface Content {
    id: number;
    title: string;
    type: 'video' | 'text' | 'image';
    status: 'draft' | 'in_review' | 'published';
    filePath?: string; // Path to stored file
  }
  
  export interface Message {
    id: number;
    sender: string;
    text: string;
    timestamp: string;
  }
  
  export interface SharedFile {
    id: number;
    name: string;
    url: string;
  }