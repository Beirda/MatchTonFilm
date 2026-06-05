import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchUserGroups } from '@/lib/groups';
import type { Group } from '@/types/group';
import GroupCard from './group-card';
import GroupEmpty from './group-empty';

function Separator() {
  return <View style={{ height: 14 }} />;
}

type Props = Readonly<{
  onCreatePress: () => void;
  onJoinPress: () => void;
}>;

export default function GroupsList({ onCreatePress, onJoinPress }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  async function loadGroups() {
    setRefreshing(true);
    const data = await fetchUserGroups();
    setGroups(data);
    setRefreshing(false);
  }

  useEffect(() => {
    loadGroups();
  }, []);

  if (!refreshing && groups.length === 0) {
    return <GroupEmpty onCreatePress={onCreatePress} />;
  }

  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id}
      onRefresh={loadGroups}
      refreshing={refreshing}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <Text style={styles.eyebrow}>Mes groupes · {groups.length}</Text>
          <Pressable
            style={({ pressed }) => [styles.joinBtn, pressed && styles.joinBtnPressed]}
            onPress={onJoinPress}
          >
            <Text style={styles.joinBtnText}>Rejoindre</Text>
          </Pressable>
        </View>
      }
      ListFooterComponent={
        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
          onPress={onCreatePress}
        >
          <FontAwesome name="plus" size={18} color={colors.text} />
          <Text style={styles.createBtnText}>Créer un nouveau groupe</Text>
        </Pressable>
      }
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
          <Pressable
            style={({ pressed }) => [pressed && styles.cardPressed]}
            onPress={() => router.push(`/groups/${item.id}`)}
          >
            <GroupCard group={item} />
          </Pressable>
        </Animated.View>
      )}
    />
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    content: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
      marginTop: 10,
    },
    eyebrow: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    joinBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    joinBtnPressed: {
      opacity: 0.6,
    },
    joinBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.red,
    },
    createBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      borderRadius: 999,
      paddingVertical: 16,
      marginTop: 16,
    },
    createBtnPressed: {
      opacity: 0.7,
    },
    createBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    cardPressed: {
      transform: [{ scale: 0.985 }],
    },
  });
}
