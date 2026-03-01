import type { Article, Topic } from '../types';

export const featuredArticle: Article = {
  id: '1',
  title: 'On-Device ML: The Future of Mobile AI',
  description: 'Why running models on-device changes everything — privacy, latency, and user experience.',
  category: 'AI ENGINEERING',
  author: 'Sriteja',
  date: 'Feb 2026',
  readTime: '6 min read',
  featured: true,
};

export const latestArticles: Article[] = [
  {
    id: '2',
    title: 'MVVM Architecture Patterns',
    description: 'A deep dive into building scalable Android apps with clean architecture and Kotlin coroutines.',
    category: 'ANDROID',
    author: 'Sriteja',
    date: 'Feb 20, 2026',
    readTime: '8 min',
  },
  {
    id: '3',
    title: 'SwiftUI vs UIKit: When to Use',
    description: "After 8 years in mobile dev, here's my honest take on when to reach for each framework.",
    category: 'IOS',
    author: 'Sriteja',
    date: 'Feb 14, 2026',
    readTime: '5 min',
  },
  {
    id: '4',
    title: 'Firebase SDK Upgrades',
    description: 'Lessons learned upgrading from Firebase 29 to 34 — dependency conflicts, KTX removals and more.',
    category: 'FIREBASE',
    author: 'Sriteja',
    date: 'Feb 8, 2026',
    readTime: '7 min',
  },
];

export const topics: Topic[] = [
  { id: '1', name: 'Android', icon: '📱', articleCount: 12 },
  { id: '2', name: 'iOS', icon: '🍎', articleCount: 8 },
  { id: '3', name: 'AI Engineering', icon: '🤖', articleCount: 6 },
  { id: '4', name: 'Firebase', icon: '🔥', articleCount: 5 },
  { id: '5', name: 'Machine Learning', icon: '🧠', articleCount: 4 },
  { id: '6', name: 'Performance', icon: '⚡', articleCount: 7 },
  { id: '7', name: 'Architecture', icon: '🏗️', articleCount: 9 },
  { id: '8', name: 'Career', icon: '🎓', articleCount: 3 },
];
