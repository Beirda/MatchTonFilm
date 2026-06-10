import { getTrailer } from '@/components/swipe/trailer';
import type { Movie, MovieVideo } from '@/wrappers/TMDBTypes';

function buildMovie(videos: MovieVideo[]): Movie {
  return {
    id: 1,
    title: 'Dune',
    original_title: 'Dune',
    overview: '',
    tagline: '',
    release_date: '2024-01-01',
    runtime: 155,
    adult: false,
    video: false,
    original_language: 'en',
    status: 'Released',
    popularity: 0,
    vote_average: 8,
    vote_count: 0,
    budget: 0,
    revenue: 0,
    homepage: null,
    imdb_id: null,
    poster_path: null,
    backdrop_path: null,
    genres: [],
    production_companies: [],
    production_countries: [],
    spoken_languages: [],
    credits: { cast: [], crew: [] },
    videos: { results: videos },
  };
}

function buildVideo(overrides: Partial<MovieVideo>): MovieVideo {
  return {
    id: 'v1',
    key: 'abc123',
    name: 'Trailer',
    site: 'YouTube',
    size: 1080,
    type: 'Trailer',
    official: false,
    published_at: '2024-01-01',
    ...overrides,
  };
}

describe('getTrailer', () => {
  it('renvoie null si aucune vidéo', () => {
    expect(getTrailer(buildMovie([]))).toBeNull();
  });

  it('préfère la bande-annonce officielle YouTube', () => {
    const official = buildVideo({ key: 'official', official: true });
    const unofficial = buildVideo({ key: 'unofficial', official: false });
    expect(getTrailer(buildMovie([unofficial, official]))).toEqual(official);
  });

  it('retombe sur une bande-annonce YouTube non officielle', () => {
    const trailer = buildVideo({ key: 'fan-trailer', official: false });
    expect(getTrailer(buildMovie([trailer]))).toEqual(trailer);
  });

  it('retombe sur une vidéo YouTube quelconque si pas de bande-annonce', () => {
    const teaser = buildVideo({ key: 'teaser', type: 'Teaser', official: false });
    expect(getTrailer(buildMovie([teaser]))).toEqual(teaser);
  });

  it('ignore les vidéos hébergées ailleurs que YouTube', () => {
    const vimeo = buildVideo({ key: 'vimeo-trailer', site: 'Vimeo' });
    expect(getTrailer(buildMovie([vimeo]))).toBeNull();
  });
});
