export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  articleCount: number;
}

// Course System Types
export interface CourseChapter {
  id: string;
  articleId: string;
  title: string;
  order: number;
  completed?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  chapters: CourseChapter[];
  author: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  estimatedTime: string;
}
