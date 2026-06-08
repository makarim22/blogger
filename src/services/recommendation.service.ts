import { API_URL, resolveImage } from './api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface RecommendationItem {
  id: string;
  type: 'post' | 'movie' | 'book';
  title: string;
  score: number;
  tags: { name: string }[];
  createdAt: string;
  
  // Post specific
  slug?: string;
  content?: string;
  author?: { name: string; avatarUrl: string | null };

  // Movie specific
  director?: string;
  rating?: number;
  posterUrl?: string;
  review?: string;

  // Book specific
  bookAuthor?: string; // in backend it's `author` which is string, we'll map it
  coverUrl?: string;
}

export const fetchRecommendations = async (): Promise<RecommendationItem[]> => {
  try {
    const res = await fetch(`${API_URL}/recommendations`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    const data = await res.json();
    return data.map((item: any) => ({
      ...item,
      posterUrl: item.posterUrl ? resolveImage(item.posterUrl) : undefined,
      coverUrl: item.coverUrl ? resolveImage(item.coverUrl) : undefined,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
};
