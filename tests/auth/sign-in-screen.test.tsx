import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockSetSession = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      setSession: (...args: unknown[]) => mockSetSession(...args),
    },
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

const mockOpenAuthSession = jest.fn();
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: (...args: unknown[]) => mockOpenAuthSession(...args),
}));
jest.mock('expo-linking', () => ({
  createURL: (path: string) => `exp://127.0.0.1:8081/--${path}`,
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

  it('connecte via Google : flux OAuth puis ouverture de session', async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: 'https://supabase.example/auth?provider=google' },
      error: null,
    });
    mockOpenAuthSession.mockResolvedValue({
      type: 'success',
      url: 'exp://127.0.0.1:8081/--/#access_token=at&refresh_token=rt',
    });
    mockSetSession.mockResolvedValue({ error: null });

    const { getByText } = render(<SignInScreen />);
    fireEvent.press(getByText('Continuer avec Google'));

    await waitFor(() =>
      expect(mockSetSession).toHaveBeenCalledWith({ access_token: 'at', refresh_token: 'rt' })
    );
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({ skipBrowserRedirect: true }),
    });
  });

  it("indique quand le provider Google n'est pas activé côté serveur", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: null,
      error: new Error('provider is not enabled'),
    });

    const { getByText } = render(<SignInScreen />);
    fireEvent.press(getByText('Continuer avec Google'));

    await waitFor(() =>
      expect(getByText("La connexion Google n'est pas encore activée sur le serveur.")).toBeTruthy()
    );
  });

  it("n'ouvre pas de session si l'utilisateur annule le flux Google", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: 'https://supabase.example/auth?provider=google' },
      error: null,
    });
    mockOpenAuthSession.mockResolvedValue({ type: 'cancel' });

    const { getByText } = render(<SignInScreen />);
    fireEvent.press(getByText('Continuer avec Google'));

    await waitFor(() => expect(mockOpenAuthSession).toHaveBeenCalled());
    expect(mockSetSession).not.toHaveBeenCalled();
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
