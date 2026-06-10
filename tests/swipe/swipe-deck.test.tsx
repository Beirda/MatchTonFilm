import React, { createRef } from 'react';
import { act, render } from '@testing-library/react-native';

// Le mock officiel exécute withTiming/withSpring et runOnJS de façon synchrone,
// ce qui permet de tester la complétion du swipe sans timers réels.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

import SwipeDeck, { type SwipeDeckHandle } from '@/components/swipe/swipe-deck';
import type { Movie } from '@/wrappers/TMDBTypes';

function buildMovie(id: number, title: string): Movie {
  return {
    id,
    title,
    original_title: title,
    overview: '',
    tagline: '',
    release_date: '2024-01-01',
    runtime: 100,
    adult: false,
    video: false,
    original_language: 'en',
    status: 'Released',
    popularity: 0,
    vote_average: 7,
    vote_count: 0,
    budget: 0,
    revenue: 0,
    homepage: null,
    imdb_id: null,
    poster_path: null,
    backdrop_path: null,
    genres: [],
    production_companies: [],
    production_countries: [],
    spoken_languages: [],
    credits: { cast: [], crew: [] },
    videos: { results: [] },
  };
}

const MOVIES = [buildMovie(1, 'Film A'), buildMovie(2, 'Film B'), buildMovie(3, 'Film C')];

describe('SwipeDeck', () => {
  it('affiche la carte courante et la suivante', () => {
    const { getByText } = render(
      <SwipeDeck movies={MOVIES} onSwipe={jest.fn()} onTrailerPress={jest.fn()} />
    );
    expect(getByText('Film A')).toBeTruthy();
    expect(getByText('Film B')).toBeTruthy();
  });

  it('n\'affiche rien si la liste est vide', () => {
    const { queryByText } = render(
      <SwipeDeck movies={[]} onSwipe={jest.fn()} onTrailerPress={jest.fn()} />
    );
    expect(queryByText('Film A')).toBeNull();
  });

  it('appelle onSwipe avec le film courant et la direction via swipe()', () => {
    const onSwipe = jest.fn();
    const ref = createRef<SwipeDeckHandle>();
    render(<SwipeDeck ref={ref} movies={MOVIES} onSwipe={onSwipe} onTrailerPress={jest.fn()} />);

    act(() => {
      ref.current?.swipe('like');
    });

    expect(onSwipe).toHaveBeenCalledWith(MOVIES[0], 'like');
  });
});
