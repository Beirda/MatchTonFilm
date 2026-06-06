import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Avatar from '@/components/ui/avatar';

type Member = { display_name: string | null; avatar_color: string } | null;

type GroupDetail = {
  name: string;
  emoji: string;
  invitation_code: string;
  genres: string[];
  age_rating: string;
  language: string;
  group_members: { profiles: Member }[] | null;
};

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('groups')
        .select('name, emoji, invitation_code, genres, age_rating, language, group_members(profiles(display_name, avatar_color))')
        .eq('id', id)
        .single();
      if (active) {
        setGroup((data as unknown as GroupDetail | null) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color={colors.red} />
      </ThemedView>
    );
  }

  if (!group) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="subtitle">Groupe introuvable</ThemedText>
      </ThemedView>
    );
  }

  const members = group.group_members ?? [];

  return (
    <ThemedView style={styles.root}>
      <ThemedText type="title">
        {group.emoji} {group.name}
      </ThemedText>

      <View style={styles.codeBlock}>
        <ThemedText style={styles.label}>Code d&apos;invitation</ThemedText>
        <ThemedText style={styles.code}>{group.invitation_code}</ThemedText>
      </View>

      <ThemedText style={styles.label}>
        {members.length} membre{members.length > 1 ? 's' : ''}
      </ThemedText>
      <View style={styles.avatarRow}>
        {members.slice(0, 8).map((m, i) => (
          <Avatar
            key={i}
            initial={(m.profiles?.display_name ?? '?').charAt(0).toUpperCase()}
            color={m.profiles?.avatar_color ?? colors.red}
            size={36}
            borderColor={colors.background}
          />
        ))}
      </View>

      <ThemedText style={styles.label}>Filtres</ThemedText>
      <ThemedText style={styles.filters}>
        {group.age_rating} · {group.language}
        {group.genres.length > 0 ? ` · ${group.genres.join(', ')}` : ''}
      </ThemedText>
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
      padding: 22,
      paddingTop: 32,
      gap: 16,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    codeBlock: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      padding: 16,
      gap: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    code: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 4,
    },
    avatarRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filters: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
  });
}
