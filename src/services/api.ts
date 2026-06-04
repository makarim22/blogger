

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
  theGood?: string;
  theBad?: string;
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
  theGood?: string;
  theBad?: string;
  readDate: string;
  coverUrl?: string;
  review: string;
  authorId: string;
}

const API_URL = 'http://localhost:3000';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const checkResponse = (res: Response, fallbackMsg: string) => {
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    // Force redirect to login page or reload to update Pinia store if user is on page
    window.location.href = '/login';
    throw new Error('Your session has expired. Please log in again.');
  }
  if (!res.ok) throw new Error(fallbackMsg);
  return res;
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

export const fetchMovie = async (id: string): Promise<MovieReview | null> => {
  try {
    const response = await fetch(`${API_URL}/movies/${id}`);
    if (!response.ok) throw new Error('Failed to fetch movie');
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
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

export const fetchBook = async (id: string): Promise<BookReview | null> => {
  try {
    const response = await fetch(`${API_URL}/books/${id}`);
    if (!response.ok) throw new Error('Failed to fetch book');
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createMovie = async (data: Omit<MovieReview, 'id' | 'authorId'>): Promise<MovieReview> => {
  const res = await fetch(`${API_URL}/movies`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  checkResponse(res, 'Failed to create movie');
  return res.json();
};

export const deleteMovie = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/movies/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  checkResponse(res, 'Failed to delete movie');
};

export const createBook = async (data: Omit<BookReview, 'id' | 'authorId'>): Promise<BookReview> => {
  const res = await fetch(`${API_URL}/books`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  checkResponse(res, 'Failed to create book');
  return res.json();
};

export const deleteBook = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/books/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  checkResponse(res, 'Failed to delete book');
};

export const updateMovie = async (id: string, data: Partial<Omit<MovieReview, 'id' | 'authorId'>>): Promise<MovieReview> => {
  const res = await fetch(`${API_URL}/movies/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  checkResponse(res, 'Failed to update movie');
  return res.json();
};

export const updateBook = async (id: string, data: Partial<Omit<BookReview, 'id' | 'authorId'>>): Promise<BookReview> => {
  const res = await fetch(`${API_URL}/books/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  checkResponse(res, 'Failed to update book');
  return res.json();
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers,
    body: formData,
  });
  checkResponse(res, 'Failed to upload image');
  const data = await res.json();
  return `${API_URL}${data.url}`;
};

export const fetchMovieComments = async (movieId: string): Promise<any[]> => {
  try {
    const res = await fetch(`${API_URL}/comments/movie/${movieId}`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const fetchBookComments = async (bookId: string): Promise<any[]> => {
  try {
    const res = await fetch(`${API_URL}/comments/book/${bookId}`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const postComment = async (data: { content: string; authorName?: string; movieReviewId?: string; bookReviewId?: string }): Promise<any> => {
  const res = await fetch(`${API_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
};

export const globalSearch = async (query: string): Promise<any[]> => {
  if (!query) return [];
  try {
    const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};
