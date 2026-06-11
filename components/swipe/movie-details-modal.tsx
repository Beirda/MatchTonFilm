import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import type { Movie } from '@/wrappers/TMDBTypes';
import { getTrailer } from './trailer';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w780';
const CAST_COUNT = 8;

function formatRuntime(minutes?: number): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`;
}

type Props = Readonly<{
  movie: Movie | null;
  onClose: () => void;
  onTrailerPress: (videoKey: string) => void;
}>;

export default function MovieDetailsModal({ movie, onClose, onTrailerPress }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);
  const insets = useSafeAreaInsets();

  if (!movie) {
    return null;
  }

  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const runtime = formatRuntime(movie.runtime);
  const cast = (movie.credits?.cast ?? []).slice(0, CAST_COUNT).map((a) => a.name);
  const directors = (movie.credits?.crew ?? [])
    .filter((c) => c.job === 'Director')
    .map((c) => c.name);
  const trailer = getTrailer(movie);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
          <View style={styles.posterWrap}>
            {movie.poster_path ? (
              <Image
                source={{ uri: `${POSTER_BASE}${movie.poster_path}` }}
                style={styles.poster}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.poster, styles.posterPlaceholder]} />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.2)', colors.background]}
              style={styles.posterGradient}
            />
          </View>

          <View style={styles.body}>
            <ThemedText type="title" style={styles.title}>
              {movie.title}
            </ThemedText>

            <View style={styles.metaRow}>
              {year && <ThemedText style={styles.meta}>{year}</ThemedText>}
              {runtime && <ThemedText style={styles.meta}>· {runtime}</ThemedText>}
              {movie.vote_average > 0 && (
                <View style={styles.ratingRow}>
                  <FontAwesome name="star" size={13} color={colors.gold} />
                  <ThemedText style={styles.meta}>
                    {movie.vote_average.toFixed(1)} TMDB
                  </ThemedText>
                </View>
              )}
            </View>

            {movie.genres.length > 0 && (
              <View style={styles.chipRow}>
                {movie.genres.map((genre) => (
                  <View key={genre.id} style={styles.chip}>
                    <ThemedText style={styles.chipText}>{genre.name}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {trailer && (
              <Pressable
                style={({ pressed }) => [styles.trailerBtn, pressed && styles.trailerBtnPressed]}
                onPress={() => onTrailerPress(trailer.key)}
                accessibilityRole="button"
                accessibilityLabel={`Voir la bande-annonce de ${movie.title}`}
              >
                <FontAwesome name="play" size={13} color="#fff" />
                <ThemedText style={styles.trailerBtnText}>Bande-annonce</ThemedText>
              </Pressable>
            )}

            {movie.overview ? (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Synopsis</ThemedText>
                <ThemedText style={styles.sectionBody}>{movie.overview}</ThemedText>
              </View>
            ) : null}

            {directors.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Réalisation</ThemedText>
                <ThemedText style={styles.sectionBody}>{directors.join(', ')}</ThemedText>
              </View>
            )}

            {cast.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Casting</ThemedText>
                <ThemedText style={styles.sectionBody}>{cast.join(', ')}</ThemedText>
              </View>
            )}
          </View>
        </ScrollView>

        <Pressable
          style={({ pressed }) => [
            styles.closeBtn,
            { top: insets.top + 12 },
            pressed && styles.closeBtnPressed,
          ]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fermer la fiche du film"
        >
          <MaterialIcons name="close" size={22} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    posterWrap: {
      width: '100%',
      aspectRatio: 3 / 4,
    },
    poster: {
      ...StyleSheet.absoluteFillObject,
    },
    posterPlaceholder: {
      backgroundColor: colors.surface3,
    },
    posterGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 140,
    },
    body: {
      paddingHorizontal: 22,
      gap: 12,
      marginTop: -22,
    },
    title: {
      fontSize: 28,
      lineHeight: 33,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    meta: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    chipText: {
      fontSize: 11,
      fontWeight: '700',
    },
    trailerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      alignSelf: 'flex-start',
      backgroundColor: colors.red,
      borderRadius: 999,
      paddingHorizontal: 18,
      paddingVertical: 10,
      marginTop: 2,
    },
    trailerBtnPressed: {
      opacity: 0.85,
    },
    trailerBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    section: {
      gap: 4,
      marginTop: 6,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    sectionBody: {
      fontSize: 14.5,
      lineHeight: 21,
    },
    closeBtn: {
      position: 'absolute',
      right: 18,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    closeBtnPressed: {
      opacity: 0.7,
    },
  });
}
