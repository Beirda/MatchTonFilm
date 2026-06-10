import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { tmdb } from '@/lib/tmdb';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import SwipeDeck, { type SwipeDeckHandle, type SwipeDirection } from '@/components/swipe/swipe-deck';
import TrailerModal from '@/components/swipe/trailer-modal';
import type { Movie } from '@/wrappers/TMDBTypes';

const MOVIE_COUNT = 10;

type GroupInfo = { name: string; emoji: string; genres: string[] };

export default function SwipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const deckRef = useRef<SwipeDeckHandle>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data } = await supabase
          .from('groups')
          .select('name, emoji, genres')
          .eq('id', id)
          .single();
        const groupInfo = data as unknown as GroupInfo | null;
        if (active) setGroup(groupInfo);

        const allGenres = await tmdb.getGenres();
        const groupGenres = (groupInfo?.genres ?? []).map((g) => g.toLowerCase());
        const genreIds = allGenres
          .filter((g) => groupGenres.includes(g.name.toLowerCase()))
          .map((g) => g.id);

        const list = genreIds.length > 0
          ? await tmdb.getMoviesByGenres(genreIds, MOVIE_COUNT)
          : await tmdb.getPopularMovies(MOVIE_COUNT);

        const detailed = await Promise.all(list.map((m) => tmdb.getMovieDetails(m.id)));
        if (active) setMovies(detailed);
      } catch {
        if (active) setError('Impossible de charger les films.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  // La persistance du vote (like/dislike) sera branchée en GH-8.
  function handleSwipe(movie: Movie, _direction: SwipeDirection) {
    setMovies((prev) => prev.filter((m) => m.id !== movie.id));
  }

  return (
    <ThemedView style={styles.root}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <ThemedText type="subtitle" numberOfLines={1} style={styles.headerTitle}>
          {group ? `${group.emoji} ${group.name}` : 'Swipe'}
        </ThemedText>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <ThemedText style={styles.emptyText}>{error}</ThemedText>
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.center}>
          <ThemedText type="subtitle">Plus de films pour l&apos;instant</ThemedText>
          <ThemedText style={styles.emptyText}>
            Reviens plus tard pour découvrir de nouvelles propositions.
          </ThemedText>
        </View>
      ) : (
        <>
          <View style={styles.deck}>
            <SwipeDeck
              ref={deckRef}
              movies={movies}
              onSwipe={handleSwipe}
              onTrailerPress={setTrailerKey}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={() => deckRef.current?.swipe('dislike')}
            >
              <MaterialIcons name="close" size={28} color={colors.red} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={() => deckRef.current?.swipe('like')}
            >
              <FontAwesome name="heart" size={24} color={colors.green} />
            </Pressable>
          </View>
        </>
      )}

      <TrailerModal videoKey={trailerKey} onClose={() => setTrailerKey(null)} />
    </ThemedView>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 12,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceBorder,
      borderWidth: 1,
      borderColor: colors.surfaceBorder2,
    },
    iconBtnPressed: {
      opacity: 0.7,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 8,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    deck: {
      flex: 1,
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 12,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 28,
      paddingBottom: 28,
      paddingTop: 4,
    },
    actionBtn: {
      width: 64,
      height: 64,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    actionBtnPressed: {
      opacity: 0.8,
      transform: [{ scale: 0.95 }],
    },
  });
}
