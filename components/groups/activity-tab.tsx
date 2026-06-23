import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchUserActivity, type ActivityEvent } from '@/lib/activity';

export default function ActivityTab() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [initialised, setInitialised] = useState<boolean>(false);

  async function loadActivity() {
    setRefreshing(true);
    const data = await fetchUserActivity();
    setEvents(data);
    setRefreshing(false);
    setInitialised(true);
  }

  useEffect(() => {
    loadActivity();
  }, []);

  if (!initialised) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.red} />
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      onRefresh={loadActivity}
      refreshing={refreshing}
      style={styles.root}
      contentContainerStyle={styles.content}
      ListHeaderComponent={<Text style={styles.title}>Historique</Text>}
      ListEmptyComponent={
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <MaterialIcons name="flash-on" size={28} color={colors.red} />
          </View>
          <Text style={styles.emptyTitle}>Rien à signaler</Text>
          <Text style={styles.emptyBody}>
            Les votes et arrivées dans tes groupes apparaîtront ici.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <MaterialIcons name={item.icon} size={18} color={colors.red} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.label}>{item.text}</Text>
            <Text style={styles.sub}>{item.sub}</Text>
          </View>
        </View>
      )}
    />
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    root: { flex: 1 },
    content: { padding: 22, gap: 10 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 6 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      borderRadius: 14,
      padding: 15,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: colors.redLine,
    },
    textCol: { flex: 1 },
    label: { fontSize: 14, fontWeight: '700', color: colors.text },
    sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    empty: {
      alignItems: 'center',
      paddingVertical: 48,
      gap: 8,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: colors.redLine,
      marginBottom: 6,
    },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
    emptyBody: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      maxWidth: 260,
      lineHeight: 20,
    },
  });
}
