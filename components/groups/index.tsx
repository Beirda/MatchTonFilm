import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { fetchUserGroups } from '@/lib/groups';
import type { Group } from '@/types/group';
import GroupCard from './group-card';

function Separator() {
  return <View style={{ height: 12 }} />;
}

export default function GroupsList() {
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

  return (
    <FlatList
      data={groups}
      keyExtractor={(item) => item.id}
      onRefresh={loadGroups}
      refreshing={refreshing}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [pressed && styles.pressed]}
          onPress={() => router.push(`/groups/${item.id}`)}
        >
          <GroupCard group={item} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  pressed: {
    opacity: 0.85,
  },
});
