import { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Movie } from '@/wrappers/TMDBTypes';
import SwipeCard from './swipe-card';

export type SwipeDirection = 'like' | 'dislike';

export type SwipeDeckHandle = {
  swipe: (direction: SwipeDirection) => void;
};

const SWIPE_THRESHOLD = 120;
const ROTATION_RANGE = 18;

type Props = Readonly<{
  movies: Movie[];
  onSwipe: (movie: Movie, direction: SwipeDirection) => void;
  onTrailerPress: (videoKey: string) => void;
  onDetailsPress?: (movie: Movie) => void;
}>;

const SwipeDeck = forwardRef<SwipeDeckHandle, Props>(function SwipeDeck(
  { movies, onSwipe, onTrailerPress, onDetailsPress },
  ref,
) {
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const current = movies[0];
  const next = movies[1];

  function complete(direction: SwipeDirection) {
    if (current) onSwipe(current, direction);
    translateX.value = 0;
    translateY.value = 0;
  }

  function flingOut(direction: SwipeDirection) {
    const target = direction === 'like' ? screenWidth * 1.5 : -screenWidth * 1.5;
    translateX.value = withTiming(target, { duration: 250 }, (finished) => {
      if (finished) runOnJS(complete)(direction);
    });
  }

  useImperativeHandle(ref, () => ({
    swipe: flingOut,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [screenWidth, current]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        runOnJS(flingOut)(e.translationX > 0 ? 'like' : 'dislike');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      [-ROTATION_RANGE, 0, ROTATION_RANGE],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [10, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -10], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.root}>
      {next && (
        <Animated.View
          key={next.id}
          entering={FadeIn.duration(200)}
          style={[styles.cardWrap, styles.nextCard]}
        >
          <SwipeCard movie={next} onTrailerPress={onTrailerPress} />
        </Animated.View>
      )}
      {current && (
        <GestureDetector gesture={pan}>
          <Animated.View key={current.id} style={[styles.cardWrap, cardStyle]}>
            <SwipeCard
              movie={current}
              onTrailerPress={onTrailerPress}
              onDetailsPress={onDetailsPress}
              likeStyle={likeStyle}
              nopeStyle={nopeStyle}
            />
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  cardWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  nextCard: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
});

export default SwipeDeck;
