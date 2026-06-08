

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

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

export const resolveImage = (url?: string | null) => {
  if (!url) return url;
  if (url.startsWith('http://localhost')) {
    const path = url.replace(/http:\/\/localhost:\d+/, '');
    return `${API_URL}${path}`;
  }
  if (url.startsWith('/uploads')) {
    return `${API_URL}${url}`;
  }
  return url;
};

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_URL}${path}`, { headers: getHeaders() });
    checkResponse(res, `GET ${path} failed`);
    return { data: await res.json() };
  },
  post: async (path: string, body: any) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    checkResponse(res, `POST ${path} failed`);
    return { data: await res.json() };
  },
  patch: async (path: string, body: any) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    checkResponse(res, `PATCH ${path} failed`);
    return { data: await res.json() };
  },
  delete: async (path: string) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    checkResponse(res, `DELETE ${path} failed`);
    return { data: await res.json() };
  }
};

export const login = async (credentials: any): Promise<any> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
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
    const data = await response.json();
    return data.map((m: any) => ({ ...m, posterUrl: resolveImage(m.posterUrl) }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchMovie = async (id: string): Promise<MovieReview | null> => {
  try {
    const response = await fetch(`${API_URL}/movies/${id}`);
    if (!response.ok) throw new Error('Failed to fetch movie');
    const data = await response.json();
    return { ...data, posterUrl: resolveImage(data.posterUrl) };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchBooks = async (): Promise<BookReview[]> => {
  try {
    const response = await fetch(`${API_URL}/books`);
    if (!response.ok) throw new Error('Failed to fetch books');
    const data = await response.json();
    return data.map((b: any) => ({ ...b, coverUrl: resolveImage(b.coverUrl) }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchBook = async (id: string): Promise<BookReview | null> => {
  try {
    const response = await fetch(`${API_URL}/books/${id}`);
    if (!response.ok) throw new Error('Failed to fetch book');
    const data = await response.json();
    return { ...data, coverUrl: resolveImage(data.coverUrl) };
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
  return data.url;
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
    const data = await res.json();
    return data.map((item: any) => ({
      ...item,
      posterUrl: item.posterUrl ? resolveImage(item.posterUrl) : undefined,
      coverUrl: item.coverUrl ? resolveImage(item.coverUrl) : undefined
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const fetchProfile = async (): Promise<any> => {
  const res = await fetch(`${API_URL}/users/profile`, {
    headers: getHeaders(),
  });
  checkResponse(res, 'Failed to fetch profile');
  const data = await res.json();
  
  if (data.movieReviews) {
    data.movieReviews = data.movieReviews.map((m: any) => ({ ...m, posterUrl: resolveImage(m.posterUrl) }));
  }
  if (data.bookReviews) {
    data.bookReviews = data.bookReviews.map((b: any) => ({ ...b, coverUrl: resolveImage(b.coverUrl) }));
  }
  if (data.savedMovies) {
    data.savedMovies = data.savedMovies.map((sm: any) => ({ 
      ...sm, 
      movieReview: sm.movieReview ? { ...sm.movieReview, posterUrl: resolveImage(sm.movieReview.posterUrl) } : undefined 
    }));
  }
  if (data.savedBooks) {
    data.savedBooks = data.savedBooks.map((sb: any) => ({ 
      ...sb, 
      bookReview: sb.bookReview ? { ...sb.bookReview, coverUrl: resolveImage(sb.bookReview.coverUrl) } : undefined 
    }));
  }
  
  return data;
};

export const toggleSaveMovie = async (id: string): Promise<any> => {
  const res = await fetch(`${API_URL}/users/save/movie/${id}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  checkResponse(res, 'Failed to save movie');
  return res.json();
};

export const toggleSaveBook = async (id: string): Promise<any> => {
  const res = await fetch(`${API_URL}/users/save/book/${id}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  checkResponse(res, 'Failed to save book');
  return res.json();
};

export const fetchNotifications = async (): Promise<any[]> => {
  const res = await fetch(`${API_URL}/notifications`, {
    headers: getHeaders(),
  });
  checkResponse(res, 'Failed to fetch notifications');
  return res.json();
};

export const markNotificationAsRead = async (id: string): Promise<any> => {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  checkResponse(res, 'Failed to mark notification as read');
  return res.json();
};

export const markAllNotificationsAsRead = async (): Promise<any> => {
  const res = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  checkResponse(res, 'Failed to mark all notifications as read');
  return res.json();
};
