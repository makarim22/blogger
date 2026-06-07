const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getMoviePoster = async (title: string, year?: number): Promise<string | null> => {
  if (!title || !TMDB_API_KEY) return null;

  try {
    const yearParam = year ? `&primary_release_year=${year}` : '';
    const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(title)}${yearParam}&language=en-US&page=1&include_adult=false`;

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('TMDB API Error:', await response.text());
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const posterPath = data.results[0].poster_path;
      if (posterPath) {
        return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch from TMDB:', error);
    return null;
  }
};
