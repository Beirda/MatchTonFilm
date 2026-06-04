import { Redirect } from 'expo-router';

// TODO GH-2 : remplacer par hasCompletedOnboarding() depuis Supabase
// → si true, afficher l'écran d'accueil des groupes
// → si false, rediriger vers /onboarding
export default function Index() {
  return <Redirect href="/onboarding" />;
}
