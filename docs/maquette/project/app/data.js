/* MatchTonFilm — données de démonstration (films type TMDB) */
(function () {
  // Poster palettes — deux teintes par film (gradient stylisé)
  const M = [
    { id: 'dune2', title: 'Dune : Deuxième Partie', year: 2024, rating: 8.3, runtime: 166,
      genres: ['Science-fiction', 'Aventure'], p1: '#b5651d', p2: '#2b1606',
      cast: ['Timothée Chalamet', 'Zendaya', 'Austin Butler'],
      synopsis: "Paul Atreides s'unit aux Fremen pour mener la révolte contre ceux qui ont anéanti sa famille." },
    { id: 'parasite', title: 'Parasite', year: 2019, rating: 8.5, runtime: 132,
      genres: ['Thriller', 'Drame'], p1: '#3a4a3f', p2: '#0c1410',
      cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
      synopsis: "Une famille pauvre s'infiltre une à une au service d'un foyer fortuné. L'engrenage devient incontrôlable." },
    { id: 'br2049', title: 'Blade Runner 2049', year: 2017, rating: 8.0, runtime: 164,
      genres: ['Science-fiction', 'Thriller'], p1: '#c2541c', p2: '#1a0f1f',
      cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas'],
      synopsis: "Un blade runner exhume un secret enfoui capable de plonger ce qu'il reste de la société dans le chaos." },
    { id: 'whiplash', title: 'Whiplash', year: 2014, rating: 8.5, runtime: 107,
      genres: ['Drame', 'Musique'], p1: '#a8421a', p2: '#12100c',
      cast: ['Miles Teller', 'J.K. Simmons', 'Melissa Benoist'],
      synopsis: "Un jeune batteur ambitieux affronte un professeur tyrannique prêt à tout pour révéler le génie." },
    { id: 'madmax', title: 'Mad Max : Fury Road', year: 2015, rating: 8.1, runtime: 120,
      genres: ['Action', 'Aventure'], p1: '#d2691e', p2: '#3d1505',
      cast: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult'],
      synopsis: "Dans un désert post-apocalyptique, Max et Furiosa fuient un tyran à travers une course-poursuite démente." },
    { id: 'lalaland', title: 'La La Land', year: 2016, rating: 8.0, runtime: 128,
      genres: ['Romance', 'Musique'], p1: '#2a3a8c', p2: '#0d1230',
      cast: ['Ryan Gosling', 'Emma Stone', 'John Legend'],
      synopsis: "À Los Angeles, une actrice et un pianiste de jazz tombent amoureux entre rêves de gloire et sacrifices." },
    { id: 'interstellar', title: 'Interstellar', year: 2014, rating: 8.4, runtime: 169,
      genres: ['Science-fiction', 'Drame'], p1: '#3b4a55', p2: '#070a0e',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
      synopsis: "Un groupe d'explorateurs franchit un trou de ver pour sauver l'humanité d'une Terre mourante." },
    { id: 'wolf', title: 'Le Loup de Wall Street', year: 2013, rating: 8.2, runtime: 180,
      genres: ['Comédie', 'Biopic'], p1: '#9a7b1f', p2: '#15110a',
      cast: ['Leonardo DiCaprio', 'Jonah Hill', 'Margot Robbie'],
      synopsis: "L'ascension et la chute fracassantes d'un courtier new-yorkais ivre d'argent et d'excès." },
    { id: 'getout', title: 'Get Out', year: 2017, rating: 7.8, runtime: 104,
      genres: ['Horreur', 'Thriller'], p1: '#6a2f1a', p2: '#0a0606',
      cast: ['Daniel Kaluuya', 'Allison Williams', 'Bradley Whitford'],
      synopsis: "Un week-end chez les parents de sa petite amie vire au cauchemar pour un jeune homme méfiant." },
    { id: 'eeaao', title: 'Everything Everywhere All at Once', year: 2022, rating: 8.0, runtime: 139,
      genres: ['Science-fiction', 'Comédie'], p1: '#7d2b8c', p2: '#160a1f',
      cast: ['Michelle Yeoh', 'Ke Huy Quan', 'Jamie Lee Curtis'],
      synopsis: "Une gérante de laverie découvre qu'elle doit sauver le multivers en explorant ses vies parallèles." },
    { id: 'drive', title: 'Drive', year: 2011, rating: 7.8, runtime: 100,
      genres: ['Thriller', 'Action'], p1: '#b51e6a', p2: '#10071a',
      cast: ['Ryan Gosling', 'Carey Mulligan', 'Bryan Cranston'],
      synopsis: "Un chauffeur de cascade silencieux bascule dans la violence pour protéger sa voisine et son fils." },
    { id: 'portrait', title: 'Portrait de la jeune fille en feu', year: 2019, rating: 8.1, runtime: 122,
      genres: ['Romance', 'Drame'], p1: '#1f5a52', p2: '#08110f',
      cast: ['Noémie Merlant', 'Adèle Haenel', 'Luàna Bajrami'],
      synopsis: "En Bretagne au XVIIIᵉ siècle, une peintre et son modèle vivent une passion aussi brève qu'intense." },
    { id: 'arrival', title: 'Premier Contact', year: 2016, rating: 7.9, runtime: 116,
      genres: ['Science-fiction', 'Drame'], p1: '#33484a', p2: '#070d0e',
      cast: ['Amy Adams', 'Jeremy Renner', 'Forest Whitaker'],
      synopsis: "Une linguiste tente de communiquer avec des extraterrestres et de déjouer une guerre mondiale." },
    { id: 'budapest', title: 'The Grand Budapest Hotel', year: 2014, rating: 8.1, runtime: 99,
      genres: ['Comédie', 'Aventure'], p1: '#c46a8e', p2: '#2a1320',
      cast: ['Ralph Fiennes', 'Tony Revolori', 'Saoirse Ronan'],
      synopsis: "Les aventures rocambolesques d'un concierge légendaire et de son jeune protégé entre deux guerres." },
    { id: 'joker', title: 'Joker', year: 2019, rating: 8.4, runtime: 122,
      genres: ['Drame', 'Crime'], p1: '#5a2c6e', p2: '#0a0710',
      cast: ['Joaquin Phoenix', 'Robert De Niro', 'Zazie Beetz'],
      synopsis: "Méprisé par une ville en décrépitude, un comédien raté sombre lentement dans la folie meurtrière." },
    { id: 'spiderverse', title: 'Spider-Man : Across the Spider-Verse', year: 2023, rating: 8.6, runtime: 140,
      genres: ['Animation', 'Action'], p1: '#d11e63', p2: '#15103f',
      cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
      synopsis: "Miles Morales traverse le multivers et défie une société de Spider-héros qui menace son destin." },
  ];

  const GENRES = [
    'Action', 'Aventure', 'Comédie', 'Drame', 'Science-fiction', 'Thriller',
    'Horreur', 'Romance', 'Animation', 'Crime', 'Musique', 'Documentaire',
    'Fantastique', 'Biopic', 'Policier', 'Guerre',
  ];

  // Groupes de l'utilisateur (écran Accueil)
  const GROUPS = [
    { id: 'coloc', name: 'Soirée Coloc', emoji: '🍿', members: 4, activity: 'Il y a 2 h',
      matches: 7, status: 'En cours', accent: '#ff3b47',
      people: [{ n: 'L', c: '#ff3b47' }, { n: 'M', c: '#7d2b8c' }, { n: 'T', c: '#2a3a8c' }, { n: 'J', c: '#1f5a52' }] },
    { id: 'couple', name: 'Ciné Couple', emoji: '❤️', members: 2, activity: 'Hier',
      matches: 12, status: 'Match trouvé', accent: '#d11e63',
      people: [{ n: 'A', c: '#d11e63' }, { n: 'S', c: '#b5651d' }] },
    { id: 'boulot', name: 'Team Boulot', emoji: '💼', members: 6, activity: 'Il y a 3 j',
      matches: 0, status: 'À lancer', accent: '#2a3a8c',
      people: [{ n: 'K', c: '#2a3a8c' }, { n: 'R', c: '#a8421a' }, { n: 'N', c: '#1f5a52' }, { n: 'P', c: '#7d2b8c' }] },
  ];

  function fmtRuntime(min) {
    const h = Math.floor(min / 60), m = min % 60;
    return h + 'h' + String(m).padStart(2, '0');
  }

  // Films similaires : score par genres partagés, puis proximité de note / d'année.
  // excludeIds évite les cycles dans l'arbre de recommandation récursif.
  function similar(movie, excludeIds = [], n = 3) {
    const ex = new Set([movie.id, ...excludeIds]);
    return M
      .filter((m) => !ex.has(m.id))
      .map((m) => ({
        m,
        overlap: m.genres.filter((g) => movie.genres.includes(g)).length,
        rd: Math.abs(m.rating - movie.rating),
        yd: Math.abs(m.year - movie.year),
      }))
      .sort((a, b) => b.overlap - a.overlap || a.rd - b.rd || a.yd - b.yd)
      .slice(0, n)
      .map((x) => x.m);
  }

  window.MTF = { MOVIES: M, GENRES, GROUPS, fmtRuntime, similar };
})();
