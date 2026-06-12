import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import GroupEmpty from '@/components/groups/group-empty';

describe('GroupEmpty', () => {
  it('affiche le message d\'état vide', () => {
    const { getByText } = render(<GroupEmpty onCreatePress={jest.fn()} onJoinPress={jest.fn()} />);
    expect(getByText('Aucun groupe… pour l\'instant')).toBeTruthy();
  });

  it('affiche le bouton de création', () => {
    const { getByText } = render(<GroupEmpty onCreatePress={jest.fn()} onJoinPress={jest.fn()} />);
    expect(getByText('Créer un groupe')).toBeTruthy();
  });

  it('appelle onCreatePress au tap sur le bouton', () => {
    const onCreatePress = jest.fn();
    const { getByText } = render(<GroupEmpty onCreatePress={onCreatePress} onJoinPress={jest.fn()} />);
    fireEvent.press(getByText('Créer un groupe'));
    expect(onCreatePress).toHaveBeenCalledTimes(1);
  });

  it('affiche le bouton pour rejoindre avec un code', () => {
    const { getByText } = render(<GroupEmpty onCreatePress={jest.fn()} onJoinPress={jest.fn()} />);
    expect(getByText("J'ai un code d'invitation")).toBeTruthy();
  });

  it('appelle onJoinPress au tap sur le bouton rejoindre', () => {
    const onJoinPress = jest.fn();
    const { getByText } = render(<GroupEmpty onCreatePress={jest.fn()} onJoinPress={onJoinPress} />);
    fireEvent.press(getByText("J'ai un code d'invitation"));
    expect(onJoinPress).toHaveBeenCalledTimes(1);
  });

  it('présente les trois étapes de prise en main', () => {
    const { getByText } = render(<GroupEmpty onCreatePress={jest.fn()} onJoinPress={jest.fn()} />);
    expect(getByText('Crée ton groupe')).toBeTruthy();
    expect(getByText('Invite tes amis')).toBeTruthy();
    expect(getByText('Swipez, matchez')).toBeTruthy();
  });
});
