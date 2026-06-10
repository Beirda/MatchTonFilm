import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGroupMatches, type MovieMatch } from '@/lib/matches';
import { supabase } from '@/lib/supabase';
import { isGroupAdmin, resetGroupVotes } from '@/lib/votes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

type GroupInfo = { name: string; emoji: string };

function formatRuntime(minutes?: number): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`;
}

export default function MatchesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = makeStyles(colors, colorScheme);

  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [ranking, setRanking] = useState<MovieMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async () => {
    const [{ data }, matches, admin] = await Promise.all([
      supabase.from('groups').select('name, emoji').eq('id', id).single(),
      getGroupMatches(id),
      isGroupAdmin(id),
    ]);
    setGroup(data as unknown as GroupInfo | null);
    setRanking(matches);
    setIsAdmin(admin);
  }, [id]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await load();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function onResetVotes() {
    Alert.alert(
      'Réinitialiser les votes',
      'Tous les votes du groupe seront supprimés et un nouveau cycle pourra commencer. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              await resetGroupVotes(id);
              await load();
            } catch {
              Alert.alert('Erreur', 'Impossible de réinitialiser les votes.');
            } finally {
              setResetting(false);
            }
          },
        },
      ],
    );
  }

  const winner = ranking[0];
  const rest = ranking.slice(1);

  return (
    <ThemedView style={styles.root}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <MaterialIcons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <ThemedText type="subtitle" numberOfLines={1} style={styles.headerTitle}>
          {group ? `${group.emoji} ${group.name}` : 'Résultats'}
        </ThemedText>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={onRefresh}
          accessibilityRole="button"
          accessibilityLabel="Rafraîchir"
        >
          <MaterialIcons name="refresh" size={20} color={colors.text} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      ) : !winner ? (
        <View style={styles.center}>
          <View style={styles.emptyIconWrap}>
            <FontAwesome name="film" size={28} color={colors.red} />
          </View>
          <ThemedText type="subtitle">Pas encore de match</ThemedText>
          <ThemedText style={styles.emptyText}>
            Lancez une session de swipe pour faire émerger vos films communs.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => String(item.movie.id)}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              <Animated.View entering={FadeIn.duration(300)} style={styles.winner}>
                {winner.movie.poster_path ? (
                  <Image
                    source={{ uri: `${POSTER_BASE}${winner.movie.poster_path}` }}
                    style={styles.winnerPoster}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.winnerPoster, styles.posterPlaceholder]} />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.85)']}
                  locations={[0, 0.3, 1]}
                  style={styles.winnerGradient}
                />
                <View style={styles.winnerBadge}>
                  <FontAwesome name="trophy" size={13} color="#1a1206" />
                  <ThemedText style={styles.winnerBadgeText}>FILM GAGNANT</ThemedText>
                </View>
                <View style={styles.winnerInfo}>
                  {(winner.movie.genres ?? []).length > 0 && (
                    <View style={styles.chipRow}>
                      {winner.movie.genres.map((genre) => (
                        <View key={genre.id} style={styles.chip}>
                          <ThemedText style={styles.chipText}>{genre.name}</ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
                  <ThemedText type="title" style={styles.winnerTitle} numberOfLines={2}>
                    {winner.movie.title}
                  </ThemedText>
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <ThemedText style={styles.statValue}>{winner.pct}%</ThemedText>
                      <ThemedText style={styles.statLabel}>de likes</ThemedText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                      <ThemedText style={styles.statValue}>{winner.likes}/{winner.total}</ThemedText>
                      <ThemedText style={styles.statLabel}>votes</ThemedText>
                    </View>
                    {winner.movie.vote_average > 0 ? (
                      <>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                          <View style={styles.statRatingRow}>
                            <FontAwesome name="star" size={14} color={colors.gold} />
                            <ThemedText style={styles.statValue}>
                              {winner.movie.vote_average.toFixed(1)}
                            </ThemedText>
                          </View>
                          <ThemedText style={styles.statLabel}>TMDB</ThemedText>
                        </View>
                      </>
                    ) : null}
                  </View>
                </View>
              </Animated.View>

              <Pressable
                style={({ pressed }) => [styles.launchBtn, pressed && styles.launchBtnPressed]}
                onPress={() => router.push(`/groups/${id}/swipe`)}
                accessibilityRole="button"
                accessibilityLabel="Lancer la soirée"
              >
                <FontAwesome name="play" size={16} color="#fff" />
                <ThemedText style={styles.launchBtnText}>Lancer la soirée</ThemedText>
              </Pressable>

              {rest.length > 0 && (
                <ThemedText style={styles.sectionTitle}>Classement du groupe</ThemedText>
              )}
            </>
          }
          renderItem={({ item, index }) => {
            const runtime = formatRuntime(item.movie.runtime);
            return (
            <Animated.View
              entering={FadeInDown.delay(index * 50).springify()}
              style={styles.rankRow}
            >
              <ThemedText style={styles.rankNum}>{index + 2}</ThemedText>
              {item.movie.poster_path ? (
                <Image
                  source={{ uri: `${POSTER_BASE}${item.movie.poster_path}` }}
                  style={styles.rankPoster}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.rankPoster, styles.posterPlaceholder]} />
              )}
              <View style={styles.rankInfo}>
                <View style={styles.rankTitleRow}>
                  <ThemedText style={styles.rankTitle} numberOfLines={1}>
                    {item.movie.title}
                  </ThemedText>
                  <ThemedText style={styles.rankPct}>{item.pct}%</ThemedText>
                </View>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: `${item.pct}%` }]} />
                </View>
                <ThemedText style={styles.rankVotes}>
                  {item.likes}/{item.total} votes
                  {runtime ? ` · ${runtime}` : ''}
                </ThemedText>
              </View>
            </Animated.View>
            );
          }}
          ListFooterComponent={
            isAdmin ? (
              <Pressable
                style={({ pressed }) => [
                  styles.resetBtn,
                  (pressed || resetting) && styles.resetBtnPressed,
                ]}
                onPress={onResetVotes}
                disabled={resetting}
                accessibilityRole="button"
                accessibilityLabel="Réinitialiser les votes"
              >
                {resetting ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <>
                    <MaterialIcons name="refresh" size={19} color={colors.text} />
                    <ThemedText style={styles.resetBtnText}>Réinitialiser</ThemedText>
                  </>
                )}
              </Pressable>
            ) : null
          }
        />
      )}
    </ThemedView>
  );
}

function makeStyles(
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'],
  scheme: 'light' | 'dark',
) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 12,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
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
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
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
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    list: {
      paddingHorizontal: 18,
      paddingBottom: 28,
      gap: 10,
    },
    winner: {
      borderRadius: 22,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 8,
      marginBottom: 16,
    },
    winnerPoster: {
      width: '100%',
      height: 320,
    },
    winnerGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    posterPlaceholder: {
      backgroundColor: colors.surface3,
    },
    winnerBadge: {
      position: 'absolute',
      top: 14,
      left: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.gold,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    winnerBadgeText: {
      color: '#1a1206',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    winnerInfo: {
      position: 'absolute',
      left: 18,
      right: 18,
      bottom: 16,
      gap: 4,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 8,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    chipText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
    },
    winnerTitle: {
      fontSize: 28,
      lineHeight: 32,
      color: '#fff',
      textTransform: 'uppercase',
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginTop: 10,
    },
    stat: {
      gap: 2,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: '#fff',
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.7)',
    },
    statDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    statRatingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    launchBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.red,
      borderRadius: 999,
      paddingVertical: 16,
      marginBottom: 22,
    },
    launchBtnPressed: {
      opacity: 0.85,
    },
    launchBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.textMuted,
      marginBottom: 12,
    },
    rankRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      borderRadius: 16,
      padding: 10,
    },
    rankNum: {
      width: 24,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '700',
      color: colors.textMuted,
    },
    rankPoster: {
      width: 42,
      height: 62,
      borderRadius: 8,
    },
    rankInfo: {
      flex: 1,
      gap: 6,
    },
    rankTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    rankTitle: {
      flex: 1,
      fontSize: 14.5,
      fontWeight: '700',
    },
    rankPct: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.red,
    },
    bar: {
      height: 4,
      borderRadius: 999,
      backgroundColor: colors.surfaceBorder2,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: scheme === 'dark' ? colors.redBright : colors.red,
    },
    rankVotes: {
      fontSize: 11.5,
      color: colors.textMuted,
    },
    resetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.surfaceBorder,
      borderRadius: 999,
      paddingVertical: 16,
      marginTop: 22,
    },
    resetBtnPressed: {
      opacity: 0.7,
    },
    resetBtnText: {
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
