import { Redirect } from 'expo-router';

// TODO GH-3: remplacer par la vraie vérification Supabase (profil utilisateur)
const hasCompletedOnboarding = true;

export default function Index() {
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  return <Redirect href="/(tabs)/home" />;
}
