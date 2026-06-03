import {Genre, Movie, TMDBPaginatedResponse} from "./TMDBTypes";

/**
 * Objet client représente l'api TMDB
 */
export class TMDBClient {
    private readonly apiKey: string;
    private baseUrl: string = "https://api.themoviedb.org/3/";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Exécute la requête à partir d'un endpoint en gérant le corps de la requête
     * @param endpoint
     * @private
     */
    private async request<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`,
            {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    accept: "application/json",
                }
            }
        );

        if (!response.ok) {
            throw new Error(`TMDB Error ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Récupère une liste de film correspondant à la recherche
     * @param query Recherche utilisateur
     */
    public async searchMovie(query: string): Promise<TMDBPaginatedResponse<Movie>> {
        return this.request(`/search/movie?query=${encodeURIComponent(query)}&language=fr-FR`);
    }

    /**
     * Récupère un film à partir d'un id
     * @param movieId id du film recherché
     */
    public async getMovie(movieId: number): Promise<Movie> {
        return this.request<Movie>(`/movie/${movieId}?language=fr-FR`);
    }

    /**
     * Récupère une page précise des films populaire
     * @param page numéro de page à récupérer
     */
    public async getPopularPage(
        page = 1
    ): Promise<TMDBPaginatedResponse<Movie>> {
        return this.request(
            `/movie/popular?page=${page}&language=fr-FR`
        );
    }

    /**
     * Récupère une liste de `count` films populaire
     * @param count nombre de films populaire à récupérer
     */
    public async getPopularMovies(count: number): Promise<Movie[]> {
        const movies: Movie[] = [];

        let page: number = 1;

        while (movies.length < count) {
            const pageResponse: TMDBPaginatedResponse<Movie> = await this.getPopularPage(page);

            movies.push(...pageResponse.results);

            if (page >= pageResponse.total_pages) {
                break;
            }

            page ++;
        }

        return movies.slice(0, count);
    }

    /**
     * Récupère la liste des genres
     */
    async getGenres(): Promise<Genre[]> {

        const data = await this.request<{
            genres: Genre[];
        }>(
            `/genre/movie/list?language=fr-FR`
        );

        return data.genres;
    }

    /**
     * Récupère une page par rapport à une liste de genre
     * @param genreIds liste d'ids de genre
     * @param page index de page
     */
    async discoverMoviesByGenres(
        genreIds: number[],
        page = 1
    ): Promise<TMDBPaginatedResponse<Movie>> {

        const genreIdsParam =
            genreIds.join(",");

        return this.request(
            `/discover/movie?with_genres=${genreIdsParam}&page=${page}&sort_by=popularity.desc&language=fr-FR`
        );
    }

    /**
     * Récupère une liste de films à partir d'une liste de genres
     * @param genreIds liste de genre à rechercher
     * @param count Nombre de films à récupérer
     */
    async getMoviesByGenres(
        genreIds: number[],
        count: number = 10
    ): Promise<Movie[]> {

        const movies: Movie[] = [];

        let page: number = 1;

        while (movies.length < count) {

            const pageResponse =
                await this.discoverMoviesByGenres(
                    genreIds,
                    page
                );

            movies.push(...pageResponse.results);

            if (page >= pageResponse.total_pages) {
                break;
            }

            page++;
        }

        return movies.slice(0, count);
    }
}
