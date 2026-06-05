import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import GenreStep from '@/components/onboarding/genre-step';
import type { GenrePreference } from '@/types/preferences';

describe('GenreStep', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => mockOnToggle.mockClear());

  it('affiche les 18 genres TMDB', () => {
    const { getByText } = render(
      <GenreStep selected={[]} onToggle={mockOnToggle} />
    );
    expect(getByText('Action')).toBeTruthy();
    expect(getByText('Thriller')).toBeTruthy();
    expect(getByText('Science-Fiction')).toBeTruthy();
    expect(getByText('Western')).toBeTruthy();
  });

  it('appelle onToggle avec le bon genre au tap', () => {
    const { getByText } = render(
      <GenreStep selected={[]} onToggle={mockOnToggle} />
    );
    fireEvent.press(getByText('Action'));
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith({ id: 28, name: 'Action' });
  });

  it('appelle onToggle pour désélectionner un genre déjà sélectionné', () => {
    const selected: GenrePreference[] = [{ id: 28, name: 'Action' }];
    const { getByText } = render(
      <GenreStep selected={selected} onToggle={mockOnToggle} />
    );
    fireEvent.press(getByText('Action'));
    expect(mockOnToggle).toHaveBeenCalledWith({ id: 28, name: 'Action' });
  });

  it('appelle onToggle indépendamment pour chaque genre', () => {
    const { getByText } = render(
      <GenreStep selected={[]} onToggle={mockOnToggle} />
    );
    fireEvent.press(getByText('Action'));
    fireEvent.press(getByText('Horreur'));
    fireEvent.press(getByText('Comédie'));
    expect(mockOnToggle).toHaveBeenCalledTimes(3);
  });
});
