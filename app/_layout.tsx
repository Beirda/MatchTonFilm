import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import SignInScreen from '@/components/auth/sign-in-screen';

function HeaderWithSub({ title, sub }: Readonly<{ title: string; sub: string }>) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return (
    <View style={headerStyles.container}>
      <Text style={[headerStyles.title, { color: isDark ? '#ECEDEE' : '#11181C' }]}>{title}</Text>
      <Text style={[headerStyles.sub, { color: isDark ? '#9BA1A6' : '#687076' }]}>{sub}</Text>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '600' },
  sub: { fontSize: 11, marginTop: 1, letterSpacing: 0.3 },
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { userId, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.splash, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator color={Colors[colorScheme ?? 'light'].red} />
      </View>
    );
  }

  if (!userId) {
    return <SignInScreen />;
  }

  return (
    <Stack initialRouteName="onboarding">
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="groups/[id]" options={{ title: 'Groupe', headerBackTitle: 'Retour' }} />
      <Stack.Screen name="groups/[id]/swipe" options={{ headerShown: false }} />
      <Stack.Screen name="groups/[id]/matches" options={{ headerShown: false }} />
      <Stack.Screen
        name="groups/[id]/settings"
        options={{ title: 'Paramètres du groupe', headerBackTitle: 'Retour' }}
      />
      <Stack.Screen
        name="groups/create"
        options={{
          headerBackTitle: 'Retour',
          headerTitle: () => <HeaderWithSub title="Nouveau groupe" sub="Configuration" />,
        }}
      />
      <Stack.Screen
        name="groups/join"
        options={{ title: 'Rejoindre un groupe', headerBackTitle: 'Retour' }}
      />
      <Stack.Screen
        name="profile/genres"
        options={{ title: 'Genres préférés', headerBackTitle: 'Retour' }}
      />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
