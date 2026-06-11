import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGroupRecommendations } from '@/lib/recommendations';
import { supabase } from '@/lib/supabase';
import { tmdb } from '@/lib/tmdb';
import { saveVote } from '@/lib/votes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import MovieDetailsModal from '@/components/swipe/movie-details-modal';
import SwipeDeck, { type SwipeDeckHandle, type SwipeDirection } from '@/components/swipe/swipe-deck';
import TrailerModal from '@/components/swipe/trailer-modal';
import type { Movie } from '@/wrappers/TMDBTypes';

const MOVIE_COUNT = 10;

type GroupInfo = { name: string; emoji: string };

export default function SwipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);
  const insets = useSafeAreaInsets();

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [detailsMovie, setDetailsMovie] = useState<Movie | null>(null);
  const deckRef = useRef<SwipeDeckHandle>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [{ data }, list] = await Promise.all([
          supabase.from('groups').select('name, emoji').eq('id', id).single(),
          getGroupRecommendations(id, MOVIE_COUNT),
        ]);
        if (active) setGroup(data as unknown as GroupInfo | null);

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

  function handleSwipe(movie: Movie, direction: SwipeDirection) {
    saveVote(id, movie.id, direction);
    setMovies((prev) => prev.filter((m) => m.id !== movie.id));
  }

  return (
    <ThemedView style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
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
          <View style={styles.emptyIconWrap}>
            <MaterialIcons name="error-outline" size={32} color={colors.red} />
          </View>
          <ThemedText style={styles.emptyText}>{error}</ThemedText>
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconWrap}>
            <FontAwesome name="film" size={28} color={colors.red} />
          </View>
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
              onDetailsPress={setDetailsMovie}
            />
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, styles.dislikeBtn, pressed && styles.actionBtnPressed]}
              onPress={() => deckRef.current?.swipe('dislike')}
              accessibilityRole="button"
              accessibilityLabel="Passer ce film"
            >
              <MaterialIcons name="close" size={28} color={colors.red} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, styles.likeBtn, pressed && styles.actionBtnPressed]}
              onPress={() => deckRef.current?.swipe('like')}
              accessibilityRole="button"
              accessibilityLabel="J'aime ce film"
            >
              <FontAwesome name="heart" size={24} color={colors.green} />
            </Pressable>
          </View>
        </>
      )}

      <MovieDetailsModal
        movie={detailsMovie}
        onClose={() => setDetailsMovie(null)}
        onTrailerPress={(key) => {
          setDetailsMovie(null);
          setTrailerKey(key);
        }}
      />
      <TrailerModal videoKey={trailerKey} onClose={() => setTrailerKey(null)} />
    </ThemedView>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  scheme: 'light' | 'dark',
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
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: colors.redLine,
      marginBottom: 6,
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
    dislikeBtn: {
      borderColor: colors.redLine,
    },
    likeBtn: {
      borderColor: colors.surfaceBorder2,
      backgroundColor: scheme === 'dark' ? colors.surface2 : colors.surface,
    },
  });
}
