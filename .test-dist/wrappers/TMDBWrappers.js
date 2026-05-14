"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TMDBClient = void 0;
/**
 * Objet client représente l'api TMDB
 */
class TMDBClient {
    apiKey;
    baseUrl = "https://api.themoviedb.org/3/";
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    /**
     * Exécute la requête à partir d'un endpoint en gérant le corps de la requête
     * @param endpoint
     * @private
     */
    async request(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                accept: "application/json",
            }
        });
        if (!response.ok) {
            throw new Error(`TMDB Error ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Récupère une liste de film correspondant à la recherche
     * @param query Recherche utilisateur
     */
    async searchMovie(query) {
        return this.request(`/search/movie?query=${encodeURIComponent(query)}&language=fr-FR`);
    }
    /**
     * Récupère un film à partir d'un id
     * @param movieId id du film recherché
     */
    async getMovie(movieId) {
        return this.request(`/movie/${movieId}?language=fr-FR`);
    }
    /**
     * Récupère une page précise des films populaire
     * @param page numéro de page à récupérer
     */
    async getPopularPage(page = 1) {
        return this.request(`/movie/popular?page=${page}&language=fr-FR`);
    }
    /**
     * Récupère une liste de `count` films populaire
     * @param count nombre de films populaire à récupérer
     */
    async getPopularMovies(count) {
        const movies = [];
        let page = 1;
        while (movies.length < count) {
            const data = await this.getPopularPage(page);
            movies.push(...data.results);
            if (page >= data.total_pages) {
                break;
            }
            page++;
        }
        return movies.slice(0, count);
    }
    /**
     * Récupère la liste des genres
     */
    async getGenres() {
        const data = await this.request(`/genre/movie/list?language=fr-FR`);
        return data.genres;
    }
    /**
     * Récupère une page par rapport à une liste de genre
     * @param genreIds liste d'ids de genre
     * @param page index de page
     */
    async discoverMoviesByGenres(genreIds, page = 1) {
        const genres = genreIds.join(",");
        return this.request(`/discover/movie?with_genres=${genres}&page=${page}&sort_by=popularity.desc&language=fr-FR`);
    }
    /**
     * Récupère une liste de films à partir d'une liste de genres
     * @param genreIds liste de genre à rechercher
     * @param count Nombre de films à récupérer
     */
    async getMoviesByGenres(genreIds, count = 10) {
        const movies = [];
        let page = 1;
        while (movies.length < count) {
            const data = await this.discoverMoviesByGenres(genreIds, page);
            movies.push(...data.results);
            if (page >= data.total_pages) {
                break;
            }
            page++;
        }
        return movies.slice(0, count);
    }
}
exports.TMDBClient = TMDBClient;
