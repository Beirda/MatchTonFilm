export interface Genre {
    id: number;
    name: string;
}

export interface Actor {
    id: number;
    name: string;
    original_name: string;
    character: string;
    profile_path: string | null;
    popularity: number;
    cast_id?: number;
    order: number;
    known_for_department: string;
}

export interface CrewMember {
    id: number;
    name: string;
    original_name: string;
    job: string;
    department: string;
    profile_path: string | null;
    popularity: number;
}

export interface ProductionCompany {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
}

export interface ProductionCountry {
    iso_3166_1: string;
    name: string;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
}

export interface MovieImage {
    aspect_ratio: number;
    file_path: string;
    height: number;
    width: number;
    vote_average: number;
    vote_count: number;
}

export interface MovieVideo {
    id: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
}

export interface Movie {
    id: number;

    title: string;
    original_title: string;
    overview: string;
    tagline: string;

    release_date: string;
    runtime: number;

    adult: boolean;
    video: boolean;

    original_language: string;
    status: string;

    popularity: number;
    vote_average: number;
    vote_count: number;

    budget: number;
    revenue: number;

    homepage: string | null;
    imdb_id: string | null;

    poster_path: string | null;
    backdrop_path: string | null;

    genres: Genre[];

    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    spoken_languages: SpokenLanguage[];

    credits: {
        cast: Actor[];
        crew: CrewMember[];
    };

    images?: {
        backdrops: MovieImage[];
        posters: MovieImage[];
        logos: MovieImage[];
    };

    videos?: {
        results: MovieVideo[];
    };
}

export interface TMDBPaginatedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}