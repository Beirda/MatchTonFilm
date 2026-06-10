import { Pressable, StyleSheet, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import type { Movie } from '@/wrappers/TMDBTypes';
import { getTrailer } from './trailer';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w780';
const CAST_COUNT = 4;

type Props = Readonly<{
  movie: Movie;
  onTrailerPress: (videoKey: string) => void;
  likeStyle?: AnimatedStyle;
  nopeStyle?: AnimatedStyle;
}>;

export default function SwipeCard({ movie, onTrailerPress, likeStyle, nopeStyle }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const cast = (movie.credits?.cast ?? [])
    .slice(0, CAST_COUNT)
    .map((a) => a.name);
  const trailer = getTrailer(movie);

  return (
    <View style={styles.card}>
      {movie.poster_path ? (
        <Image
          source={{ uri: `${POSTER_BASE}${movie.poster_path}` }}
          style={styles.poster}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.poster, styles.posterPlaceholder]} />
      )}

      {likeStyle && (
        <Animated.View style={[styles.stamp, styles.stampLike, likeStyle]}>
          <ThemedText style={[styles.stampText, styles.stampTextLike]}>J&apos;aime</ThemedText>
        </Animated.View>
      )}
      {nopeStyle && (
        <Animated.View style={[styles.stamp, styles.stampNope, nopeStyle]}>
          <ThemedText style={[styles.stampText, styles.stampTextNope]}>Passer</ThemedText>
        </Animated.View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
        style={styles.gradient}
      >
        <View style={styles.titleRow}>
          <ThemedText type="title" style={styles.title} numberOfLines={2}>
            {movie.title}
          </ThemedText>
          {year && <ThemedText style={styles.year}>{year}</ThemedText>}
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

        {cast.length > 0 && (
          <ThemedText style={styles.cast} numberOfLines={1}>
            Avec {cast.join(', ')}
          </ThemedText>
        )}

        {movie.overview ? (
          <ThemedText style={styles.overview} numberOfLines={4}>
            {movie.overview}
          </ThemedText>
        ) : null}

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
      </LinearGradient>
    </View>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 10,
    },
    poster: {
      ...StyleSheet.absoluteFillObject,
    },
    posterPlaceholder: {
      backgroundColor: colors.surface3,
    },
    gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 18,
      paddingTop: 80,
      paddingBottom: 22,
      gap: 8,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    title: {
      flex: 1,
      color: '#fff',
      fontSize: 24,
    },
    year: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 3,
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
      backgroundColor: 'rgba(255,255,255,0.16)',
    },
    chipText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
    },
    cast: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 13,
      fontWeight: '600',
    },
    overview: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 13,
      lineHeight: 19,
    },
    trailerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'flex-start',
      backgroundColor: colors.red,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 9,
      marginTop: 4,
    },
    trailerBtnPressed: {
      opacity: 0.85,
    },
    trailerBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '700',
    },
    stamp: {
      position: 'absolute',
      top: 36,
      borderWidth: 4,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 6,
      zIndex: 10,
    },
    stampLike: {
      left: 22,
      borderColor: colors.green,
      transform: [{ rotate: '-18deg' }],
    },
    stampNope: {
      right: 22,
      borderColor: colors.red,
      transform: [{ rotate: '18deg' }],
    },
    stampText: {
      fontSize: 26,
      fontWeight: '900',
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    stampTextLike: {
      color: colors.green,
    },
    stampTextNope: {
      color: colors.red,
    },
  });
}
