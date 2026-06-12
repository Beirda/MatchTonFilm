import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useFocusEffect } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import {
  getProfile,
  getProfileStats,
  updateAvatarColor,
  updateDisplayName,
  type ProfileStats,
} from '@/services/profile';
import Avatar from '@/components/ui/avatar';

const AVATAR_COLORS = [
  '#ff3b47', '#d11e63', '#7d2b8c', '#2a3a8c',
  '#0a7ea4', '#0f8a5f', '#c2541c', '#8c6d1f',
];

export default function ProfileTab() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);
  const { userId, email } = useAuth();

  const [displayName, setDisplayName] = useState<string>('');
  const [avatarColor, setAvatarColor] = useState<string>(colors.red);
  const [stats, setStats] = useState<ProfileStats>({ votes: 0, likes: 0, groups: 0 });
  const [editing, setEditing] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [pickingColor, setPickingColor] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let active = true;
      Promise.all([getProfile(userId), getProfileStats(userId)]).then(([profile, profileStats]) => {
        if (!active) return;
        if (profile) {
          setDisplayName(profile.displayName);
          setAvatarColor(profile.avatarColor);
        }
        setStats(profileStats);
      });
      return () => {
        active = false;
      };
    }, [userId]),
  );

  const shownName = displayName || (email ? email.split('@')[0] : 'Vous');
  const initial = shownName.charAt(0).toUpperCase();

  function startEditing() {
    setDraftName(displayName || shownName);
    setEditing(true);
  }

  async function handleSaveName() {
    if (!userId || saving) return;
    const name = draftName.trim();
    if (!name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateDisplayName(userId, name);
      setDisplayName(name);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handlePickColor(color: string) {
    if (!userId) return;
    setAvatarColor(color);
    setPickingColor(false);
    try {
      await updateAvatarColor(userId, color);
    } catch {
      // couleur non sauvegardée : l'état local reste cohérent au prochain focus
    }
  }

  const statEntries: [string, number][] = [
    ['Films votés', stats.votes],
    ['J’aime', stats.likes],
    ['Groupes', stats.groups],
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setPickingColor(prev => !prev)}
          accessibilityRole="button"
          accessibilityLabel="Changer la couleur de l'avatar"
        >
          <Avatar initial={initial} color={avatarColor} size={84} borderColor={colors.background} />
          <View style={styles.avatarEditBadge}>
            <MaterialIcons name="palette" size={14} color="#fff" />
          </View>
        </Pressable>

        {pickingColor && (
          <View style={styles.colorRow}>
            {AVATAR_COLORS.map(color => (
              <Pressable
                key={color}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  color === avatarColor && styles.colorDotSelected,
                ]}
                onPress={() => handlePickColor(color)}
                accessibilityRole="button"
                accessibilityLabel={`Couleur d'avatar ${color}`}
              />
            ))}
          </View>
        )}

        {editing ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              value={draftName}
              onChangeText={setDraftName}
              autoFocus
              maxLength={30}
              placeholder="Ton pseudo"
              placeholderTextColor={colors.textFaint}
              onSubmitEditing={handleSaveName}
              returnKeyType="done"
            />
            <Pressable
              style={({ pressed }) => [styles.nameActionBtn, pressed && styles.pressed]}
              onPress={handleSaveName}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Enregistrer le pseudo"
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.green} />
              ) : (
                <MaterialIcons name="check" size={20} color={colors.green} />
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.nameActionBtn, pressed && styles.pressed]}
              onPress={() => setEditing(false)}
              accessibilityRole="button"
              accessibilityLabel="Annuler la modification du pseudo"
            >
              <MaterialIcons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.nameRow, pressed && styles.pressed]}
            onPress={startEditing}
            accessibilityRole="button"
            accessibilityLabel="Modifier le pseudo"
          >
            <Text style={styles.name}>{shownName}</Text>
            <MaterialIcons name="edit" size={16} color={colors.textMuted} />
          </Pressable>
        )}
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.statsRow}>
        {statEntries.map(([label, value]) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        onPress={() => router.push('/profile/genres')}
        accessibilityRole="button"
        accessibilityLabel="Modifier mes genres préférés"
      >
        <Text style={styles.rowLabel}>Genres préférés</Text>
        <MaterialIcons name="chevron-right" size={18} color={colors.textFaint} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutBtnPressed]}
        onPress={() => supabase.auth.signOut()}
      >
        <MaterialIcons name="logout" size={18} color={colors.red} />
        <Text style={styles.signOutText}>Se déconnecter</Text>
      </Pressable>
    </ScrollView>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  _scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    root: { flex: 1 },
    content: { padding: 22 },
    header: { alignItems: 'center', marginBottom: 22 },
    avatarEditBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.red,
      borderWidth: 2,
      borderColor: colors.background,
    },
    colorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      marginTop: 14,
    },
    colorDot: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorDotSelected: {
      borderColor: colors.text,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 14,
    },
    name: { fontSize: 22, fontWeight: '700', color: colors.text },
    nameEditRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 14,
    },
    nameInput: {
      minWidth: 160,
      maxWidth: 220,
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.red,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 8,
      textAlign: 'center',
    },
    nameActionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    pressed: { opacity: 0.7 },
    email: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    statCard: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
    },
    statValue: { fontSize: 26, fontWeight: '700', color: colors.text },
    statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceBorder,
    },
    rowLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    signOutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 28,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.redLine,
      backgroundColor: colors.redSoft,
    },
    signOutBtnPressed: { opacity: 0.7 },
    signOutText: { fontSize: 15, fontWeight: '700', color: colors.red },
  });
}
