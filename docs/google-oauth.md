# Connexion Google (OAuth)

Le code applicatif est en place (`components/auth/sign-in-screen.tsx`) : le bouton
« Continuer avec Google » ouvre le flux OAuth de Supabase dans un navigateur
sécurisé, récupère les tokens au retour et ouvre la session. Tant que le
provider n'est pas configuré côté serveur, le bouton affiche
« La connexion Google n'est pas encore activée sur le serveur. »

## Configuration requise (une seule fois)

### 1. Google Cloud Console
1. Créer un projet sur [console.cloud.google.com](https://console.cloud.google.com).
2. **APIs & Services → OAuth consent screen** : type *External*, renseigner nom
   de l'app et email.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** :
   - Type : **Web application** (c'est le client que Supabase utilise, même pour mobile).
   - *Authorized redirect URIs* : `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
     (visible dans le dashboard Supabase, étape 2).
4. Noter le **Client ID** et le **Client Secret**.

### 2. Dashboard Supabase
1. **Authentication → Providers → Google** : activer, coller Client ID et Client Secret.
2. **Authentication → URL Configuration → Redirect URLs** : ajouter les URLs de
   retour de l'app :
   - dev Expo Go : `exp://127.0.0.1:8081`, `exp://<IP_LAN>:8081` (une entrée par
     machine de dev, ou utiliser un joker `exp://**`) ;
   - build standalone : `matchtonfilm://` (définir `scheme: "matchtonfilm"` dans
     `app.json` avant le build).

### 3. Vérification
Lancer l'app, taper « Continuer avec Google » : le navigateur s'ouvre sur le
choix de compte Google puis revient dans l'app connecté. Le trigger
`handle_new_user` crée le profil automatiquement (le `display_name` reprend le
nom Google via `full_name`).

## Notes
- En dev Expo Go, l'URL de retour change avec l'IP de la machine : si Google
  renvoie « redirect_uri_mismatch », vérifier l'étape 2.2.
- Sur web, Supabase gère la redirection complète de la page (pas de popup à parser).
