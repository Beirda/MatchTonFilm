import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import GroupEmpty from '@/components/groups/group-empty';

describe('GroupEmpty', () => {
  it('affiche le message d\'état vide', () => {
    const { getByText } = render(<GroupEmpty onCreatePress={jest.fn()} />);
    expect(getByText('Aucun groupe… pour l\'instant')).toBeTruthy();
  });

  it('affiche le bouton de création', () => {
    const { getByText } = render(<GroupEmpty onCreatePress={jest.fn()} />);
    expect(getByText('Créer un groupe')).toBeTruthy();
  });

  it('appelle onCreatePress au tap sur le bouton', () => {
    const onCreatePress = jest.fn();
    const { getByText } = render(<GroupEmpty onCreatePress={onCreatePress} />);
    fireEvent.press(getByText('Créer un groupe'));
    expect(onCreatePress).toHaveBeenCalledTimes(1);
  });
});
