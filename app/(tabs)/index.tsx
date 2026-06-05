import { Redirect } from 'expo-router';

// La garde onboarding doit être dans le root layout (ou un middleware),
// pas dans ce fichier — évite la boucle avec router.replace('/(tabs)').
// TODO GH-auth: implémenter la garde dans app/_layout.tsx quand Supabase auth est branché.
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
