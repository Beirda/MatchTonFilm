import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

function HeaderWithSub({ title, sub }: Readonly<{ title: string; sub: string }>) {
  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.title}>{title}</Text>
      <Text style={headerStyles.sub}>{sub}</Text>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '600', color: '#11181C' },
  sub: { fontSize: 11, color: '#687076', marginTop: 1, letterSpacing: 0.3 },
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="onboarding">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="groups/[id]" options={{ title: 'Groupe', headerBackTitle: 'Retour' }} />
        <Stack.Screen
          name="groups/create"
          options={{
            headerBackTitle: 'Retour',
            headerTitle: () => (
              <HeaderWithSub title="Nouveau groupe" sub="Configuration" />
            ),
          }}
        />
        <Stack.Screen name="groups/join" options={{ title: 'Rejoindre un groupe', headerBackTitle: 'Retour' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
