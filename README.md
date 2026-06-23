# MatchTonFilm 🎬

App mobile de **swipe de films en groupe**. Chaque membre swipe les films proposés
(comme sur une app de rencontre) ; l'app croise les votes du groupe et fait remonter
le film qui met tout le monde d'accord — « Arrête de débattre. Swipez. »

Projet d'évaluation finale **M1 React Native — SUP de VINCI** (Sujet 1 : MatchTonFilm).

## Fonctionnalités

- **Authentification** Supabase (email + mot de passe, + « Continuer avec Google »).
- **Onboarding** des goûts : genres préférés + films aimés (avec recherche TMDB et
  suggestions de films similaires injectées à la volée).
- **Groupes** : créer un groupe (genres, limite d'âge), le rejoindre par code à 6
  caractères ou par lien d'invitation (`expo-linking` + presse-papier), gérer ses membres.
- **Swipe** type Tinder (`gesture-handler` + `reanimated`) avec rotation de carte,
  tampons « J'aime / Passer », boutons ❤️ / ✕, et fiche film complète (synopsis, durée,
  genres, note TMDB, casting, réalisateur, bande-annonce YouTube en WebView).
- **Recommandations** personnalisées par groupe (intersection des genres du groupe et
  des préférences cumulées des membres, repli sur les films populaires TMDB).
- **Matchs** : classement des films du groupe par taux de likes, avec reset par l'admin.
- **Historique** : fil des votes et arrivées de membres dans tes groupes.

## Stack

- React Native `0.81` + **Expo SDK 54** (Expo Router, file-based routing)
- **TypeScript**
- **Supabase** (auth + Postgres + RLS + RPC `SECURITY DEFINER`)
- **API TMDB** (`/movie/popular`, `/movie/{id}`, `/search/movie`, `/discover`, `/recommendations`)
- `react-native-gesture-handler` + `react-native-reanimated` (swipe), `expo-image`,
  `expo-linear-gradient`, `react-native-webview`

## Démarrage

### Prérequis

- Node.js 20+
- Un projet **Supabase** (URL + clé `anon`) avec le schéma appliqué (voir plus bas)
- Un **jeton de lecture TMDB v4**

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env      # puis renseigne tes propres clés (voir .env.example)

# 3. Appliquer le schéma Supabase
#    via la CLI :   supabase db push
#    ou à la main : exécuter supabase/schema.sql puis les fichiers supabase/migrations/*
#    dans le SQL Editor de Supabase (dans l'ordre des numéros 001 → 007)

# 4. Lancer l'app
npx expo start
```

Depuis le terminal Expo : `a` (Android), `i` (iOS), `w` (web), ou scanner le QR code
avec **Expo Go**.

### Scripts

| Commande | Rôle |
|----------|------|
| `npm start` | Démarre le serveur de développement Expo |
| `npm run android` / `ios` / `web` | Démarre directement sur la plateforme ciblée |
| `npm run lint` | Lint (eslint-config-expo) |
| `npm test` | Suite de tests Jest (`jest-expo` + Testing Library) |
| `npm run test:wrapper` | Tests unitaires du client TMDB (runner `node:test`) |

## Structure du projet

Le projet suit les conventions **Expo Router** (routage par fichiers dans `app/`)
plutôt qu'un dossier `src/`, mais respecte la même séparation des responsabilités :

```
app/            écrans & navigation (Stack + onglets), routage par fichiers
components/     composants réutilisables (auth, swipe, groups, onboarding, ui…)
hooks/          hooks custom (useAuth, useColorScheme…)
lib/            accès données : Supabase (groups, votes, matches, activity…) + TMDB
services/       préférences & profil utilisateur
wrappers/       client TMDB typé (TMDBClient) + types TMDB
constants/      thème, mapping des genres
types/          types partagés
supabase/       schéma SQL + migrations
tests/          tests unitaires & composants
docs/           maquette, scénario de tests E2E, doc OAuth Google
```

> ⚠️ Aucun secret n'est versionné : URL Supabase, clé `anon` et jeton TMDB sont lus
> depuis l'environnement (`process.env.EXPO_PUBLIC_*`, voir [`.env.example`](.env.example)).

## Équipe

Projet réalisé **en solo** par **Keryan** (M1 React Native).

## Authentification (GH-1)

L'app utilise **Supabase Auth** (email + mot de passe). Renseigne un fichier `.env`
à la racine :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Le client est dans [`lib/supabase.ts`](lib/supabase.ts). La session est exposée à
toute l'app via [`hooks/use-auth.tsx`](hooks/use-auth.tsx) (`useAuth()` → `{ userId, email, loading }`).
Le `RootNavigator` ([`app/_layout.tsx`](app/_layout.tsx)) affiche l'écran de connexion
([`components/auth/sign-in-screen.tsx`](components/auth/sign-in-screen.tsx)) tant que l'utilisateur
n'est pas authentifié, puis la navigation normale. La déconnexion se fait depuis l'onglet Profil.

Le schéma SQL (trigger de création de profil, RLS) est dans [`supabase/schema.sql`](supabase/schema.sql),
les correctifs dans [`supabase/migrations`](supabase/migrations). Applique-les via
`supabase db push` ou le SQL Editor de Supabase.

### Design de l'écran auth

L'écran de connexion reprend la maquette *Welcome* (Claude Design), archivée dans
[`docs/maquette/`](docs/maquette) (prototype HTML/CSS/JSX + tokens + chats d'intention) :
fond animé de posters ([`components/auth/poster-marquee.tsx`](components/auth/poster-marquee.tsx),
trois colonnes défilant en boucle `reanimated`). Au montage, le marquee récupère les
films populaires via `tmdb.getPopularMovies()` et affiche leurs vraies affiches
(`expo-image`, fade-in) avec le titre par-dessus ; il retombe sur des dégradés
`expo-linear-gradient` bicolores si TMDB échoue. Voile dégradé global, lockup
MATCH·TON·FILM et accroche condensée. L'écran est volontairement en thème sombre
(la maquette est dark-only). Le formulaire email / mot de passe (notre flux réel)
remplace les boutons de la maquette ; le bouton « Continuer avec Google » est câblé
en OAuth Supabase (`signInWithOAuth` + `expo-web-browser`, voir
[`docs/google-oauth.md`](docs/google-oauth.md)).

## Données (GH-2 / GH-3 / GH-4)

### Préférences — GH-2
[`services/preferences.ts`](services/preferences.ts) persiste les goûts d'onboarding dans
`user_genres` + `user_films`. `hasCompletedOnboarding(userId)` indique si l'utilisateur
a déjà des genres ; l'écran [`app/onboarding.tsx`](app/onboarding.tsx) saute alors directement
aux groupes.

### Groupes — GH-3
[`lib/groups.ts`](lib/groups.ts) `fetchUserGroups()` renvoie les groupes de l'utilisateur
avec le nombre de membres et leurs avatars (jointure `group_members` → `profiles`).
[`app/groups/[id].tsx`](app/groups/[id].tsx) charge le détail d'un groupe.

### Création / rejoindre — GH-4
La RLS masque un groupe tant qu'on n'en est pas membre — un `insert().select()` (création)
ou un `select` par code (join) renverrait donc vide. On passe par deux fonctions
`SECURITY DEFINER` (migration [`003`](supabase/migrations/20260607_003_group_rpcs.sql)) :

- `create_group(name, genres, age_rating, language, code)` → crée le groupe + ajoute le
  créateur comme `admin`, renvoie l'`id`. Appelée depuis [`app/groups/create.tsx`](app/groups/create.tsx).
- `join_group(code)` → ajoute le membre via le code d'invitation, renvoie l'`id` (ou `null`
  si code inconnu). Appelée depuis [`app/groups/join.tsx`](app/groups/join.tsx).

Le code d'invitation est une chaîne de **6 caractères** alphanumériques majuscules
(aligné sur les 6 cases de l'écran « Rejoindre »).

### Rejoindre via lien — GH-5
Le lien d'invitation est une URL `expo-linking` (`matchtonfilm://groups/join?code=XXXXXX`),
générée dans [`app/groups/create.tsx`](app/groups/create.tsx) (`Linking.createURL`) et
partagée via `Share.share`.

Côté [`app/groups/join.tsx`](app/groups/join.tsx) :

- Si l'app est ouverte via ce lien, Expo Router transmet `code` en paramètre de route
  (`useLocalSearchParams`) ; le code est pré-rempli dans la grille et le join est lancé
  automatiquement.
- Le bouton « Coller un lien d'invitation » lit le presse-papier (`expo-clipboard`),
  extrait le code via `parseInviteCode` (basé sur `Linking.parse`) puis lance le join.
- Un lien sans paramètre `code`, mal formé, ou avec un code de longueur/format invalide
  est rejeté avec le message « Ce lien d'invitation est invalide. ».

## Recommandations personnalisées (GH-6)

[`lib/recommendations.ts`](lib/recommendations.ts) `getGroupRecommendations(groupId, count)`
calcule les films à proposer à un groupe en croisant deux sources :

- les **genres filtrés du groupe** (`groups.genres`, GH-4), convertis en ids TMDB via
  [`constants/genres.ts`](constants/genres.ts) (`GENRE_TMDB_IDS`) ;
- les **genres préférés cumulés des membres** (`user_genres`, GH-2).

`intersectGenreIds` calcule l'intersection des deux ensembles ; si l'un est vide on retombe
sur l'autre, et si l'intersection est vide on retombe sur les genres du groupe. Si le
groupe n'a aucun genre filtré et qu'aucun membre n'a de préférences, la liste retombe sur
les films populaires TMDB.

La limite d'âge du groupe (`groups.age_rating`) contrôle le contenu adulte : seul un
groupe `18+` passe `include_adult=true` à `discoverMoviesByGenres`/`getMoviesByGenres`
([`wrappers/TMDBClient.ts`](wrappers/TMDBClient.ts)) ; un post-filtre exclut par sécurité
tout résultat `adult: true` pour les autres groupes.

## Swipe (cartes) — GH-7

[`app/groups/[id]/swipe.tsx`](app/groups/[id]/swipe.tsx) propose une interface type Tinder
pour découvrir les films d'un groupe, accessible via le bouton « Lancer une session » sur
la page de détail du groupe.

- Les films proposés viennent de [`getGroupRecommendations(groupId, 10)`](lib/recommendations.ts)
  (GH-6), qui croise les genres filtrés du groupe et les préférences cumulées des membres.
- Chaque film est complété via `tmdb.getMovieDetails(id)` (nouvelle méthode du
  [`TMDBClient`](wrappers/TMDBClient.ts), `append_to_response=credits,videos`) pour
  afficher l'affiche, les genres, le casting principal, le résumé et la bande-annonce.
- [`components/swipe/swipe-deck.tsx`](components/swipe/swipe-deck.tsx) gère le swipe
  (`react-native-gesture-handler` + `react-native-reanimated`) : glisser à droite/gauche
  ou utiliser les boutons ❤️ / ✕ sous la pile.
- [`components/swipe/trailer-modal.tsx`](components/swipe/trailer-modal.tsx) ouvre la
  bande-annonce YouTube dans une `WebView` (`react-native-webview`) plein écran.

## Persistance des votes (GH-8)

Chaque like/dislike est sauvegardé via [`saveVote(groupId, movieId, vote)`](lib/votes.ts)
dans la table `votes` (migration
[`20260610_004_votes.sql`](supabase/migrations/20260610_004_votes.sql)).

- Clé primaire composite `(user_id, group_id, movie_id)` : un nouveau swipe sur le même
  film **met à jour** le vote existant via `upsert` (`onConflict`) plutôt que de créer un
  doublon.
- RLS : chaque utilisateur ne peut écrire que ses propres votes ; les membres du groupe
  peuvent lire l'ensemble des votes du groupe (préparation des matchs, GH-9).
- `saveVote` est appelé depuis `handleSwipe` dans
  [`app/groups/[id]/swipe.tsx`](app/groups/[id]/swipe.tsx) ; si aucun utilisateur n'est
  connecté, l'appel ne fait rien.

## Calcul des matchs (GH-9)

[`getGroupMatches(groupId)`](lib/matches.ts) calcule le score de chaque film voté dans un
groupe et renvoie un classement trié par score décroissant.

- Score : `% = likes / total des votes (likes + dislikes)` sur ce film, arrondi à l'entier
  le plus proche.
- Les votes sont récupérés depuis la table `votes` (GH-8) et agrégés par `movie_id`, puis
  chaque film est complété via `tmdb.getMovieDetails(id)` pour l'affiche et le titre.
- [`app/groups/[id]/matches.tsx`](app/groups/[id]/matches.tsx) affiche le résultat : le
  film gagnant en avant (score, votes) suivi du classement du reste des films, accessible
  via le bouton « Voir les résultats » sur la page de détail du groupe.
- Mise à jour : tirer la liste vers le bas ou appuyer sur le bouton de rafraîchissement
  recalcule le classement à partir des votes les plus récents.

## Reset des votes (GH-11)

L'admin du groupe peut relancer un cycle de swipe depuis l'écran des résultats
([`app/groups/[id]/matches.tsx`](app/groups/[id]/matches.tsx)) via le bouton « Réinitialiser ».

- [`isGroupAdmin(groupId)`](lib/votes.ts) vérifie le rôle de l'utilisateur connecté dans
  `group_members` pour n'afficher le bouton qu'aux admins.
- [`resetGroupVotes(groupId)`](lib/votes.ts) appelle la RPC `reset_group_votes`
  (migration [`20260610_005_reset_votes.sql`](supabase/migrations/20260610_005_reset_votes.sql)),
  exécutée en `SECURITY DEFINER` pour pouvoir supprimer les votes de **tous** les membres
  du groupe (la policy RLS `votes: CRUD ses propres votes` limite chaque membre à ses
  propres lignes).
- La RPC vérifie elle-même `is_group_admin(p_group_id)` et lève une exception sinon —
  la sécurité ne repose pas uniquement sur l'affichage conditionnel du bouton côté client.
- Une confirmation est demandée avant suppression ; une fois les votes supprimés, le
  classement est rechargé et un nouveau cycle de swipe peut commencer.

## Workflow de développement

Le projet est développé avec l'assistance de **Claude Code**, encadrée par un
workflow strict — l'IA produit du code, mais ne le merge jamais sans franchir des
garde-fous automatisés.

### Une branche = un ticket = une PR

Chaque fonctionnalité ou correctif vit sur sa propre branche (`feature/…`, `fix/…`,
`docs/…`, `improve/…`) et est intégrée à `main` via une **pull request**. L'historique
Git reflète ce découpage : les tickets `GH-1` à `GH-11` couvrent les fonctionnalités,
puis une série de PR de correctifs et de polish (voir l'historique des PR).

### CI obligatoire avant merge

À chaque pull request vers `main`, le workflow [`/.github/workflows/ci.yml`](.github/workflows/ci.yml)
exécute **trois étapes séquentielles** (chacune doit passer pour débloquer la suivante) :

1. **Lint** — `npm run lint` (eslint-config-expo)
2. **Type-check** — `npx tsc --noEmit`
3. **Test** — `npm test` (Jest + Testing Library)

Une PR qui casse le lint, les types ou un test est bloquée. C'est ce filet qui
**encadre les contributions de l'IA** : tout dépassement de périmètre ou régression
introduite par une génération automatique est rattrapé par la CI avant d'atteindre `main`.

### Rôle de l'IA dans la boucle

Le code de fonctionnalité est écrit à partir d'un ticket cadré, puis l'IA est
sollicitée en fin de cycle pour les tâches répétitives — **génération des tests**,
**documentation** et **passe de polish** — chaque sortie étant relue et validée par la
CI et par moi avant merge. Le détail de cette collaboration (apports, dérives observées,
analyse critique) est documenté dans le document individuel du projet.
