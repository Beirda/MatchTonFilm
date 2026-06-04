import { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import type { FilmPreference, GenrePreference } from '@/types/preferences';
import type { Movie } from '@/wrappers/TMDBTypes';
import { tmdb } from '@/lib/tmdb';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const INITIAL_COUNT = 20;
const SIMILAR_COUNT = 3;
const H_PAD = 22;
const COL_GAP = 10;
const { width: SCREEN_W } = Dimensions.get('window');
const ITEM_W = (SCREEN_W - H_PAD * 2 - COL_GAP * 2) / 3;

type Props = Readonly<{
  genres: GenrePreference[];
  selected: FilmPreference[];
  onToggle: (film: FilmPreference) => void;
}>;

export default function FilmStep({ genres, selected, onToggle }: Props) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  // Liste ordonnée affichée — les films similaires s'y injectent à la volée
  const [displayList, setDisplayList] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const genreIds = genres.map(g => g.id);
    const fetch = genreIds.length > 0
      ? tmdb.getMoviesByGenres(genreIds, INITIAL_COUNT)
      : tmdb.getPopularMovies(INITIAL_COUNT);
    fetch.then(setDisplayList).finally(() => setLoading(false));
  // genres est stable au montage de cette étape — on lit sa valeur initiale uniquement
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = query.trim();
    if (!q) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    timer.current = setTimeout(async () => {
      const res = await tmdb.searchMovie(q);
      setSearchResults(res.results);
      setSearching(false);
    }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  const isSelected = (id: number) => selected.some(f => f.tmdbId === id);

  /** Convertit un objet TMDB `Movie` en `FilmPreference` stockable. */
  function toPreference(movie: Movie): FilmPreference {
    return { tmdbId: movie.id, title: movie.title, posterPath: movie.poster_path };
  }

  /**
   * Sélectionne ou désélectionne un film.
   *
   * À la sélection, récupère `SIMILAR_COUNT` films similaires via TMDB et les
   * insère juste après le film cliqué dans `displayList`. Ce comportement est
   * récursif : chaque film similaire peut à son tour déclencher une nouvelle
   * injection lorsqu'il est sélectionné.
   *
   * À la déselection, les films similaires déjà injectés restent visibles.
   */
  async function handleToggle(movie: Movie) {
    onToggle(toPreference(movie));

    // Déselection : on garde les similaires déjà injectés, on ne fait rien de plus
    if (isSelected(movie.id)) return;

    // Sélection : injecter SIMILAR_COUNT similaires juste après ce film dans displayList
    setLoadingId(movie.id);
    try {
      const res = await tmdb.getSimilar(movie.id);
      setDisplayList(prev => {
        const toInject = res.results
          .filter(m => !prev.some(d => d.id === m.id))
          .slice(0, SIMILAR_COUNT);
        if (toInject.length === 0) return prev;

        const idx = prev.findIndex(m => m.id === movie.id);
        const next = [...prev];
        if (idx === -1) {
          // Film sélectionné depuis la recherche → ajouter en fin de liste
          return [...next, movie, ...toInject];
        }
        next.splice(idx + 1, 0, ...toInject);
        return next;
      });
    } finally {
      setLoadingId(null);
    }
  }

  const displayMovies = query.trim() ? searchResults : displayList;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <ThemedText style={styles.eyebrow}>Étape 2 / 3</ThemedText>
        <ThemedText type="title" style={styles.title}>Des films que tu adores</ThemedText>
        <ThemedText style={styles.subtitle}>
          Choisis-en au moins 1 — on adaptera tes recommandations.
        </ThemedText>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un film…"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <ThemedText style={styles.clearText}>✕</ThemedText>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      ) : searching ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.red} />
        </View>
      ) : (
        <FlatList
          data={displayMovies}
          numColumns={3}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            query.trim() ? (
              <ThemedText style={styles.emptyText}>
                Aucun film trouvé pour « {query} ».
              </ThemedText>
            ) : null
          }
          renderItem={({ item }) => {
            const on = isSelected(item.id);
            const fetching = loadingId === item.id;
            return (
              <Pressable
                testID={`film-item-${item.id}`}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                onPress={() => handleToggle(item)}
                disabled={fetching}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on, busy: fetching }}
                accessibilityLabel={item.title}
              >
                <View style={[styles.posterWrap, on && styles.posterWrapSelected]}>
                  {item.poster_path ? (
                    <Image
                      source={{ uri: `${POSTER_BASE}${item.poster_path}` }}
                      style={styles.poster}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.poster, styles.posterPlaceholder]} />
                  )}
                  {on && !fetching && (
                    <View style={styles.checkOverlay}>
                      <ThemedText style={styles.checkText}>✓</ThemedText>
                    </View>
                  )}
                  {fetching && (
                    <View style={styles.fetchingOverlay}>
                      <ActivityIndicator color="#fff" size="small" />
                    </View>
                  )}
                </View>
                <ThemedText style={styles.movieTitle} numberOfLines={2}>
                  {item.title}
                </ThemedText>
              </Pressable>
            );
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

function makeStyles(
  colors: typeof Colors['light'] | typeof Colors['dark'],
  scheme: 'light' | 'dark'
) {
  const isDark = scheme === 'dark';
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: H_PAD, paddingBottom: 16, gap: 8 },
    eyebrow: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: colors.red,
    },
    title: { fontSize: 28, fontWeight: '700', lineHeight: 32, color: colors.text },
    subtitle: { fontSize: 15, lineHeight: 22, color: colors.textMuted },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: H_PAD,
      marginBottom: 14,
      backgroundColor: isDark ? colors.surface2 : colors.surface,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 14 : 4,
      gap: 8,
    },
    searchInput: { flex: 1, fontSize: 16, color: colors.text },
    clearText: { fontSize: 13, color: colors.textFaint },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    list: { flex: 1 },
    grid: { paddingHorizontal: H_PAD, paddingBottom: 16, gap: COL_GAP },
    row: { gap: COL_GAP },
    item: { width: ITEM_W },
    itemPressed: { opacity: 0.8 },
    posterWrap: {
      width: ITEM_W,
      aspectRatio: 2 / 3,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    posterWrapSelected: {
      borderColor: colors.red,
      shadowColor: colors.red,
      shadowOpacity: 0.5,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 6,
    },
    poster: { flex: 1 },
    posterPlaceholder: { backgroundColor: isDark ? colors.surface3 : colors.surface2 },
    checkOverlay: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.red,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkText: { color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 16 },
    fetchingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    movieTitle: { fontSize: 11, color: colors.textMuted, marginTop: 5, lineHeight: 14 },
    emptyText: { color: colors.textFaint, fontSize: 14, textAlign: 'center', paddingTop: 30 },
  });
}
