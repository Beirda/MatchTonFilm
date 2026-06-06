import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/** Palettes de posters (deux teintes par film) — reprises de la maquette. */
type Movie = { title: string; p1: string; p2: string };

const MOVIES: Movie[] = [
  { title: 'Dune : Deuxième Partie', p1: '#b5651d', p2: '#2b1606' },
  { title: 'Parasite', p1: '#3a4a3f', p2: '#0c1410' },
  { title: 'Blade Runner 2049', p1: '#c2541c', p2: '#1a0f1f' },
  { title: 'Whiplash', p1: '#a8421a', p2: '#12100c' },
  { title: 'Mad Max : Fury Road', p1: '#d2691e', p2: '#3d1505' },
  { title: 'La La Land', p1: '#2a3a8c', p2: '#0d1230' },
  { title: 'Interstellar', p1: '#3b4a55', p2: '#070a0e' },
  { title: 'Le Loup de Wall Street', p1: '#9a7b1f', p2: '#15110a' },
  { title: 'Get Out', p1: '#6a2f1a', p2: '#0a0606' },
  { title: 'Everything Everywhere', p1: '#7d2b8c', p2: '#160a1f' },
  { title: 'Drive', p1: '#b51e6a', p2: '#10071a' },
  { title: 'Portrait de la jeune fille', p1: '#1f5a52', p2: '#08110f' },
  { title: 'Premier Contact', p1: '#33484a', p2: '#070d0e' },
  { title: 'The Grand Budapest Hotel', p1: '#c46a8e', p2: '#2a1320' },
  { title: 'Joker', p1: '#5a2c6e', p2: '#0a0710' },
  { title: 'Spider-Man : Spider-Verse', p1: '#d11e63', p2: '#15103f' },
];

const POSTER_H = 150;
const GAP = 12;

function PosterCard({ movie }: Readonly<{ movie: Movie }>) {
  return (
    <LinearGradient
      colors={[movie.p1, movie.p2]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.poster}
    >
      <View style={styles.posterSheen} />
      <Text style={styles.posterTitle} numberOfLines={2}>
        {movie.title}
      </Text>
    </LinearGradient>
  );
}

function MarqueeColumn({
  movies,
  duration,
  reverse,
}: Readonly<{ movies: Movie[]; duration: number; reverse: boolean }>) {
  const setHeight = movies.length * (POSTER_H + GAP);
  const offset = useSharedValue(reverse ? -setHeight : 0);

  useEffect(() => {
    offset.value = reverse ? -setHeight : 0;
    offset.value = withRepeat(
      withTiming(reverse ? 0 : -setHeight, { duration: duration * 1000, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(offset);
  }, [duration, reverse, setHeight, offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <View style={styles.column}>
      <Animated.View style={animatedStyle}>
        {[...movies, ...movies].map((m, i) => (
          <PosterCard key={`${m.title}-${i}`} movie={m} />
        ))}
      </Animated.View>
    </View>
  );
}

/** Fond animé : trois colonnes de posters défilant en sens alternés, inclinées. */
export default function PosterMarquee() {
  const colA = MOVIES.filter((_, i) => i % 3 === 0);
  const colB = MOVIES.filter((_, i) => i % 3 === 1);
  const colC = MOVIES.filter((_, i) => i % 3 === 2);

  return (
    <View style={styles.root} pointerEvents="none">
      <View style={styles.grid}>
        <MarqueeColumn movies={colA} duration={42} reverse={false} />
        <MarqueeColumn movies={colB} duration={52} reverse />
        <MarqueeColumn movies={colC} duration={36} reverse={false} />
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#0a0a0d',
  },
  grid: {
    position: 'absolute',
    top: -height * 0.12,
    left: -width * 0.14,
    width: width * 1.28,
    height: height * 1.35,
    flexDirection: 'row',
    gap: GAP,
    transform: [{ rotate: '-8deg' }, { scale: 1.25 }],
  },
  column: {
    flex: 1,
  },
  poster: {
    height: POSTER_H,
    borderRadius: 12,
    marginBottom: GAP,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  posterSheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  posterTitle: {
    padding: 11,
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 8,
  },
});
