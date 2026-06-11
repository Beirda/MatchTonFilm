import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import SwipeCard from '@/components/swipe/swipe-card';
import type { Movie } from '@/wrappers/TMDBTypes';

const MOVIE: Movie = {
  id: 1,
  title: 'Dune',
  original_title: 'Dune',
  overview: 'Un jeune noble doit voyager vers la planète la plus dangereuse de l\'univers.',
  tagline: '',
  release_date: '2021-09-15',
  runtime: 155,
  adult: false,
  video: false,
  original_language: 'en',
  status: 'Released',
  popularity: 0,
  vote_average: 8,
  vote_count: 0,
  budget: 0,
  revenue: 0,
  homepage: null,
  imdb_id: null,
  poster_path: '/dune.jpg',
  backdrop_path: null,
  genres: [{ id: 878, name: 'Science-Fiction' }, { id: 12, name: 'Aventure' }],
  production_companies: [],
  production_countries: [],
  spoken_languages: [],
  credits: {
    cast: [
      { id: 1, name: 'Timothée Chalamet', original_name: 'Timothée Chalamet', character: 'Paul', profile_path: null, popularity: 0, order: 0, known_for_department: 'Acting' },
      { id: 2, name: 'Zendaya', original_name: 'Zendaya', character: 'Chani', profile_path: null, popularity: 0, order: 1, known_for_department: 'Acting' },
    ],
    crew: [],
  },
  videos: {
    results: [
      { id: 'v1', key: 'n9xhJrPXop4', name: 'Trailer', site: 'YouTube', size: 1080, type: 'Trailer', official: true, published_at: '2021-01-01' },
    ],
  },
};

describe('SwipeCard', () => {
  it('affiche le titre, l\'année et le résumé', () => {
    const { getByText } = render(<SwipeCard movie={MOVIE} onTrailerPress={jest.fn()} />);
    expect(getByText('Dune')).toBeTruthy();
    expect(getByText('2021')).toBeTruthy();
    expect(getByText(MOVIE.overview)).toBeTruthy();
  });

  it('affiche les genres', () => {
    const { getByText } = render(<SwipeCard movie={MOVIE} onTrailerPress={jest.fn()} />);
    expect(getByText('Science-Fiction')).toBeTruthy();
    expect(getByText('Aventure')).toBeTruthy();
  });

  it('affiche les acteurs principaux', () => {
    const { getByText } = render(<SwipeCard movie={MOVIE} onTrailerPress={jest.fn()} />);
    expect(getByText('Avec Timothée Chalamet, Zendaya')).toBeTruthy();
  });

  it('appelle onTrailerPress avec la clé YouTube au clic sur la bande-annonce', () => {
    const onTrailerPress = jest.fn();
    const { getByText } = render(<SwipeCard movie={MOVIE} onTrailerPress={onTrailerPress} />);
    fireEvent.press(getByText('Bande-annonce'));
    expect(onTrailerPress).toHaveBeenCalledWith('n9xhJrPXop4');
  });

  it('n\'affiche pas le bouton bande-annonce si aucune vidéo', () => {
    const movie = { ...MOVIE, videos: { results: [] } };
    const { queryByText } = render(<SwipeCard movie={movie} onTrailerPress={jest.fn()} />);
    expect(queryByText('Bande-annonce')).toBeNull();
  });

  it('appelle onDetailsPress au tap sur le bouton info', () => {
    const onDetailsPress = jest.fn();
    const { getByLabelText } = render(
      <SwipeCard movie={MOVIE} onTrailerPress={jest.fn()} onDetailsPress={onDetailsPress} />,
    );
    fireEvent.press(getByLabelText('Voir la fiche complète de Dune'));
    expect(onDetailsPress).toHaveBeenCalledWith(MOVIE);
  });

  it("n'affiche pas le bouton info sans onDetailsPress", () => {
    const { queryByLabelText } = render(<SwipeCard movie={MOVIE} onTrailerPress={jest.fn()} />);
    expect(queryByLabelText('Voir la fiche complète de Dune')).toBeNull();
  });
});
