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
import type { FilmPreference } from '@/types/preferences';
import type { Movie } from '@/wrappers/TMDBTypes';
import { tmdb } from '@/lib/tmdb';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const INITIAL_COUNT = 20;
const H_PAD = 22;
const COL_GAP = 10;
const { width: SCREEN_W } = Dimensions.get('window');
const ITEM_W = (SCREEN_W - H_PAD * 2 - COL_GAP * 2) / 3;

type Props = Readonly<{
  selected: FilmPreference[];
  onToggle: (film: FilmPreference) => void;
}>;

export default function FilmStep({ selected, onToggle }: Props) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [popular, setPopular] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    tmdb
      .getPopularMovies(INITIAL_COUNT)
      .then(setPopular)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    timer.current = setTimeout(async () => {
      const res = await tmdb.searchMovie(q);
      setSearchResults(res.results);
      setSearching(false);
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  const isSelected = (id: number) => selected.some(f => f.tmdbId === id);

  function toPreference(movie: Movie): FilmPreference {
    return { tmdbId: movie.id, title: movie.title, posterPath: movie.poster_path };
  }

  const displayMovies = query.trim() ? searchResults : popular;

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
            return (
              <Pressable
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                onPress={() => onToggle(toPreference(item))}
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
                  {on && (
                    <View style={styles.checkOverlay}>
                      <ThemedText style={styles.checkText}>✓</ThemedText>
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
    posterPlaceholder: {
      backgroundColor: isDark ? colors.surface3 : colors.surface2,
    },
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
    movieTitle: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 5,
      lineHeight: 14,
    },
    emptyText: {
      color: colors.textFaint,
      fontSize: 14,
      textAlign: 'center',
      paddingTop: 30,
    },
  });
}
