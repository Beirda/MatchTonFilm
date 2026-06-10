# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

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
dégradés `expo-linear-gradient` + boucle `reanimated`), voile dégradé, lockup
MATCH·TON·FILM et accroche condensée. L'écran est volontairement en thème sombre
(la maquette est dark-only). Le formulaire email / mot de passe (notre flux réel)
remplace les boutons de la maquette ; « Continuer avec Google » est omis (OAuth non câblé).

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

## Swipe (cartes) — GH-7

[`app/groups/[id]/swipe.tsx`](app/groups/[id]/swipe.tsx) propose une interface type Tinder
pour découvrir les films d'un groupe, accessible via le bouton « Lancer une session » sur
la page de détail du groupe.

- Les genres du groupe (noms français de [`constants/genres.ts`](constants/genres.ts)) sont
  comparés (insensible à la casse) à `tmdb.getGenres()` pour récupérer les ids TMDB
  correspondants, puis `tmdb.getMoviesByGenres(ids, 10)` renvoie les films à proposer
  (fallback sur `tmdb.getPopularMovies(10)` si aucun genre ne correspond).
- Chaque film est complété via `tmdb.getMovieDetails(id)` (nouvelle méthode du
  [`TMDBClient`](wrappers/TMDBClient.ts), `append_to_response=credits,videos`) pour
  afficher l'affiche, les genres, le casting principal, le résumé et la bande-annonce.
- [`components/swipe/swipe-deck.tsx`](components/swipe/swipe-deck.tsx) gère le swipe
  (`react-native-gesture-handler` + `react-native-reanimated`) : glisser à droite/gauche
  ou utiliser les boutons ❤️ / ✕ sous la pile. Le like/dislike n'est pour l'instant qu'un
  callback local — la persistance des votes arrive en GH-8.
- [`components/swipe/trailer-modal.tsx`](components/swipe/trailer-modal.tsx) ouvre la
  bande-annonce YouTube dans une `WebView` (`react-native-webview`) plein écran.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
