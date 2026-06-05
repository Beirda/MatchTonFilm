import { StyleSheet, Text, View } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Avatar from '@/components/ui/avatar';
import type { Group } from '@/types/group';

const POSTER_COLORS = ['#b5651d', '#3a4a3f', '#c2541c'];

function PosterThumb({ index, stacked }: Readonly<{ index: number; stacked: boolean }>) {
  return (
    <View
      style={[
        posterStyles.thumb,
        stacked && { marginLeft: -18 },
        { backgroundColor: POSTER_COLORS[index % POSTER_COLORS.length], zIndex: 3 - index },
      ]}
    />
  );
}

function GroupCard({ group }: Readonly<{ group: Group }>) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);
  const isLive = group.matches > 0;

  return (
    <View style={styles.card}>
      <View style={styles.posters}>
        {[0, 1, 2].map((i) => (
          <PosterThumb key={i} index={i} stacked={i > 0} />
        ))}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {group.emoji} {group.name}
          </Text>
          <MaterialIcons name="chevron-right" size={18} color={colors.textFaint} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.avatarStack}>
            {group.people.slice(0, 4).map((p, k) => (
              <View
                key={k}
                style={{ marginLeft: k > 0 ? -10 : 0, zIndex: 4 - k }}
              >
                <Avatar
                  initial={p.n}
                  color={p.c}
                  size={24}
                  borderColor={colors.surface}
                />
              </View>
            ))}
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {group.members} membre{group.members > 1 ? 's' : ''} · {group.activity}
          </Text>
        </View>

        <View style={styles.badges}>
          <View style={[styles.badge, isLive ? styles.badgeLive : styles.badgeIdle]}>
            <Text style={[styles.badgeText, isLive ? styles.badgeTextLive : styles.badgeTextIdle]}>
              {isLive ? `${group.matches} match${group.matches > 1 ? 's' : ''}` : 'En attente'}
            </Text>
          </View>
          <View style={[styles.badge, styles.badgeIdle]}>
            <Text style={[styles.badgeText, styles.badgeTextIdle]}>{group.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const posterStyles = StyleSheet.create({
  thumb: {
    width: 44,
    height: 64,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 10,
  },
});

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  scheme: 'light' | 'dark',
) {
  const isDark = scheme === 'dark';
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      borderRadius: 22,
      padding: 14,
      shadowColor: isDark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.45 : 0.08,
      shadowRadius: 20,
      elevation: 6,
    },
    posters: {
      flexDirection: 'row',
      flexShrink: 0,
    },
    info: {
      flex: 1,
      gap: 7,
      minWidth: 0,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    name: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.2,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatarStack: {
      flexDirection: 'row',
    },
    meta: {
      fontSize: 13,
      color: colors.textMuted,
      flex: 1,
    },
    badges: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
    },
    badgeLive: {
      backgroundColor: colors.redSoft,
      borderColor: colors.redLine,
    },
    badgeIdle: {
      backgroundColor: colors.surfaceBorder,
      borderColor: colors.surfaceBorder,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    badgeTextLive: {
      color: colors.redBright,
    },
    badgeTextIdle: {
      color: colors.textFaint,
    },
  });
}

export default GroupCard;
