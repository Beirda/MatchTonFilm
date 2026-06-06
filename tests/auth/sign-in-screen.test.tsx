import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
    },
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

import SignInScreen from '@/components/auth/sign-in-screen';

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
    mockSignUp.mockResolvedValue({ data: { session: {} }, error: null });
  });

  it('affiche le mode connexion par défaut', () => {
    const { getByText } = render(<SignInScreen />);
    expect(getByText('Se connecter')).toBeTruthy();
  });

  it('bascule en mode inscription', () => {
    const { getByText } = render(<SignInScreen />);
    fireEvent.press(getByText('Inscris-toi'));
    expect(getByText('Créer mon compte')).toBeTruthy();
  });

  it('appelle signInWithPassword avec les identifiants saisis', async () => {
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText('toi@exemple.fr'), 'a@b.fr');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'secret123');
    fireEvent.press(getByText('Se connecter'));
    await waitFor(() =>
      expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'a@b.fr', password: 'secret123' })
    );
  });

  it('affiche un message d\'erreur si la connexion échoue', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid login credentials'),
    });
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText('toi@exemple.fr'), 'a@b.fr');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'wrong');
    fireEvent.press(getByText('Se connecter'));
    await waitFor(() => expect(getByText('Email ou mot de passe incorrect.')).toBeTruthy());
  });

  it('affiche un avis de confirmation après inscription sans session', async () => {
    mockSignUp.mockResolvedValue({ data: { session: null }, error: null });
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);
    fireEvent.press(getByText('Inscris-toi'));
    fireEvent.changeText(getByPlaceholderText('toi@exemple.fr'), 'a@b.fr');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'secret123');
    fireEvent.press(getByText('Créer mon compte'));
    await waitFor(() =>
      expect(getByText(/Vérifie tes emails/)).toBeTruthy()
    );
  });
});
