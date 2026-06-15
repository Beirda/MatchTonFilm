import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { removeGroupMember } from '@/lib/groups';
import { supabase } from '@/lib/supabase';
import { isGroupAdmin } from '@/lib/votes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Avatar from '@/components/ui/avatar';

type MemberProfile = { display_name: string | null; avatar_color: string } | null;

type GroupMember = { user_id: string; role: string; profiles: MemberProfile };

type GroupDetail = {
  name: string;
  emoji: string;
  invitation_code: string;
  genres: string[];
  age_rating: string;
  language: string;
  group_members: GroupMember[] | null;
};

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [admin, setAdmin] = useState<boolean>(false);

  // Rechargé à chaque focus : les modifications faites dans les paramètres
  // (nom, filtres, code) apparaissent immédiatement au retour.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [{ data }, isAdmin] = await Promise.all([
          supabase
            .from('groups')
            .select('name, emoji, invitation_code, genres, age_rating, language, group_members(user_id, role, profiles(display_name, avatar_color))')
            .eq('id', id)
            .single(),
          isGroupAdmin(id),
        ]);
        if (active) {
          setGroup((data as unknown as GroupDetail | null) ?? null);
          setAdmin(isAdmin);
          setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [id]),
  );

  async function handleCopyCode() {
    if (!group) return;
    await Clipboard.setStringAsync(group.invitation_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!group) return;
    const link = Linking.createURL('groups/join', { queryParams: { code: group.invitation_code } });
    await Share.share({ message: `Rejoins mon groupe sur MatchTonFilm !\n${link}`, url: link });
  }

  function handleRemoveMember(member: GroupMember) {
    const label = member.profiles?.display_name ?? 'ce membre';
    Alert.alert(
      'Retirer le membre',
      `Retirer ${label} du groupe ? Cette personne pourra rejoindre à nouveau avec le code d'invitation.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeGroupMember(id, member.user_id);
            } catch {
              Alert.alert('Erreur', 'Impossible de retirer ce membre. Réessaie.');
              return;
            }
            setGroup(prev =>
              prev
                ? {
                    ...prev,
                    group_members: (prev.group_members ?? []).filter(
                      m => m.user_id !== member.user_id,
                    ),
                  }
                : prev,
            );
          },
        },
      ],
    );
  }

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
      <Stack.Screen
        options={{
          headerRight: admin
            ? () => (
                <Pressable
                  onPress={() => router.push(`/groups/${id}/settings`)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Paramètres du groupe"
                >
                  <MaterialIcons name="settings" size={22} color={colors.text} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.emojiBadge}>
            <Text style={styles.emoji}>{group.emoji}</Text>
          </View>
          <ThemedText type="title" style={styles.title}>
            {group.name}
          </ThemedText>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <ThemedText style={styles.chipText}>{group.age_rating}</ThemedText>
            </View>
            <View style={styles.chip}>
              <ThemedText style={styles.chipText}>{group.language}</ThemedText>
            </View>
            {group.genres.map((genre) => (
              <View key={genre} style={styles.chip}>
                <ThemedText style={styles.chipText}>{genre}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.codeBlock}>
          <View style={styles.codeInfo}>
            <ThemedText style={styles.label}>Code d&apos;invitation</ThemedText>
            <ThemedText style={styles.code}>{group.invitation_code}</ThemedText>
          </View>
          <View style={styles.codeActions}>
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
              onPress={handleCopyCode}
              accessibilityRole="button"
              accessibilityLabel="Copier le code d'invitation"
            >
              <MaterialIcons name={copied ? 'check' : 'content-copy'} size={19} color={copied ? colors.green : colors.text} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Partager le lien d'invitation"
            >
              <MaterialIcons name="share" size={19} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <ThemedText style={styles.sectionLabel}>
          {members.length} membre{members.length > 1 ? 's' : ''}
        </ThemedText>
        <View style={styles.memberList}>
          {members.slice(0, 12).map((m) => (
            <View key={m.user_id} style={styles.memberRow}>
              <Avatar
                initial={(m.profiles?.display_name ?? '?').charAt(0).toUpperCase()}
                color={m.profiles?.avatar_color ?? colors.red}
                size={36}
                borderColor={colors.background}
              />
              <ThemedText style={styles.memberName} numberOfLines={1}>
                {m.profiles?.display_name ?? 'Membre'}
              </ThemedText>
              {m.role === 'admin' ? (
                <View style={styles.adminBadge}>
                  <ThemedText style={styles.adminBadgeText}>Admin</ThemedText>
                </View>
              ) : admin ? (
                <Pressable
                  style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
                  onPress={() => handleRemoveMember(m)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Retirer ${m.profiles?.display_name ?? 'ce membre'} du groupe`}
                >
                  <MaterialIcons name="person-remove" size={18} color={colors.red} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.swipeBtn, pressed && styles.swipeBtnPressed]}
          onPress={() => router.push(`/groups/${id}/swipe`)}
        >
          <FontAwesome name="play" size={15} color="#fff" />
          <Text style={styles.swipeBtnText}>Lancer une session</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.resultsBtn, pressed && styles.resultsBtnPressed]}
          onPress={() => router.push(`/groups/${id}/matches`)}
        >
          <FontAwesome name="trophy" size={15} color={colors.text} />
          <Text style={styles.resultsBtnText}>Voir les résultats</Text>
        </Pressable>
      </View>
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
    },
    scroll: {
      padding: 22,
      paddingBottom: 24,
      gap: 18,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hero: {
      alignItems: 'center',
      gap: 12,
      marginTop: 6,
    },
    emojiBadge: {
      width: 76,
      height: 76,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: colors.redLine,
    },
    emoji: {
      fontSize: 36,
    },
    title: {
      textAlign: 'center',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 6,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 5,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    codeBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      padding: 16,
      gap: 12,
    },
    codeInfo: {
      flex: 1,
      gap: 4,
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
    codeActions: {
      flexDirection: 'row',
      gap: 8,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceBorder,
      borderWidth: 1,
      borderColor: colors.surfaceBorder2,
    },
    iconBtnPressed: {
      opacity: 0.7,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    memberList: {
      gap: 10,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    memberName: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
    },
    adminBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: colors.redLine,
    },
    adminBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.red,
      letterSpacing: 0.5,
    },
    removeBtn: {
      width: 36,
      height: 36,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.redSoft,
      borderWidth: 1,
      borderColor: colors.redLine,
    },
    removeBtnPressed: {
      opacity: 0.7,
    },
    footer: {
      padding: 22,
      paddingTop: 12,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceBorder,
    },
    swipeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.red,
      borderRadius: 999,
      paddingVertical: 16,
    },
    swipeBtnPressed: {
      opacity: 0.85,
    },
    swipeBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    resultsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      borderRadius: 999,
      paddingVertical: 16,
    },
    resultsBtnPressed: {
      opacity: 0.85,
    },
    resultsBtnText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
