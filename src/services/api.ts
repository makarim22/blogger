import { getToken } from './auth';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  publishedAt: string;
  authorId: string;
}

export interface MovieReview {
  id: string;
  title: string;
  director: string;
  releaseYear: number;
  rating: number;
  watchDate: string;
  posterUrl?: string;
  review: string;
  authorId: string;
}

export interface BookReview {
  id: string;
  title: string;
  author: string;
  publishYear: number;
  rating: number;
  readDate: string;
  coverUrl?: string;
  review: string;
  authorId: string;
}

const API_URL = 'http://localhost:3000';

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchPost = async (id: string): Promise<Post | null> => {
  try {
    const response = await fetch(`${API_URL}/posts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchMovies = async (): Promise<MovieReview[]> => {
  try {
    const response = await fetch(`${API_URL}/movies`);
    if (!response.ok) throw new Error('Failed to fetch movies');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchBooks = async (): Promise<BookReview[]> => {
  try {
    const response = await fetch(`${API_URL}/books`);
    if (!response.ok) throw new Error('Failed to fetch books');
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createMovie = async (data: Omit<MovieReview, 'id' | 'authorId'>): Promise<MovieReview> => {
  const res = await fetch(`${API_URL}/movies`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create movie');
  return res.json();
};

export const deleteMovie = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/movies/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete movie');
};

export const createBook = async (data: Omit<BookReview, 'id' | 'authorId'>): Promise<BookReview> => {
  const res = await fetch(`${API_URL}/books`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create book');
  return res.json();
};

export const deleteBook = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/books/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete book');
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload image');
  const data = await res.json();
  return `${API_URL}${data.url}`;
};
