import { StyleSheet } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  return (
    <ThemedView style={styles.root}>
      {/* TODO GH-3: afficher les détails du groupe (films suggérés, membres) */}
      <ThemedText type="title">Groupe</ThemedText>
      <ThemedText type="subtitle">{id}</ThemedText>
    </ThemedView>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
      paddingTop: 60,
    },
  });
}
