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
