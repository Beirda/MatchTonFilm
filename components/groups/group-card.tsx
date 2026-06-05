import { StyleSheet } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Group } from '@/types/group';

function GroupCard({ group }: Readonly<{ group: Group }>) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="defaultSemiBold">{group.name}</ThemedText>
      {group.description ? (
        <ThemedText>{group.description}</ThemedText>
      ) : null}
      <ThemedText style={styles.meta}>
        {group.memberCount} membre{group.memberCount > 1 ? 's' : ''}
      </ThemedText>
    </ThemedView>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  scheme: 'light' | 'dark',
) {
  const isDark = scheme === 'dark';
  const cardBg = isDark ? '#1e2022' : '#f8f9fa';
  const borderColor = isDark ? '#2e3235' : '#e8eaed';

  return StyleSheet.create({
    card: {
      backgroundColor: cardBg,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor,
      padding: 16,
      gap: 4,
    },
    meta: {
      color: colors.icon,
      fontSize: 13,
    },
  });
}

export default GroupCard;
