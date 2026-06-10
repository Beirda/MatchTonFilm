import type { Movie, MovieVideo } from '@/wrappers/TMDBTypes';

/** Sélectionne la meilleure bande-annonce YouTube disponible pour un film. */
export function getTrailer(movie: Movie): MovieVideo | null {
  const videos = movie.videos?.results ?? [];
  const youtubeTrailers = videos.filter((v) => v.site === 'YouTube' && v.type === 'Trailer');

  return (
    youtubeTrailers.find((v) => v.official) ??
    youtubeTrailers[0] ??
    videos.find((v) => v.site === 'YouTube') ??
    null
  );
}
