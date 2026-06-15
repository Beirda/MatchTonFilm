# Scénario de test E2E — Parcours complet MatchTonFilm

Scénario de recette manuelle couvrant le happy path multi-utilisateurs et les
correctifs des issues #25 à #35. Les libellés cités sont les libellés exacts de
l'interface.

## Prérequis

| # | Prérequis | Détail |
|---|-----------|--------|
| P1 | Migration Supabase à jour | `supabase/migrations/20260611_006_group_member_genres.sql` appliquée (sinon les membres n'ont pas le même pool de films → étape 5 échoue) |
| P2 | Variables d'env | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_TMDB_TOKEN` |
| P3 | Deux appareils | Appareil **A** (Alice, future admin) et appareil **B** (Bruno), sur le même réseau si Expo Go |
| P4 | Comptes propres | Deux emails jamais utilisés (ou purger `auth.users` de test) |
| P5 | (Optionnel) OAuth Google | Provider Google activé dans Supabase — cf. `docs/google-oauth.md` ; sinon l'étape 1-bis affichera le message d'erreur attendu |

---

## Étape 1 — Inscription et onboarding (E2E-001, issue #25)

**Appareil A :**
1. Ouvrir l'app → l'écran d'accueil affiche « Arrête de débattre. Swipez. »
2. Taper « Inscris-toi », saisir email + mot de passe (≥ 6 caractères) → « Créer mon compte ».
3. Onboarding étape 1/3 : sélectionner **au moins 3 genres** (ex. Action, Science-Fiction, Thriller).
4. Étape 2/3 : sélectionner un film hollywoodien connu (ex. *Dune*).
   - ✅ **Vérif #25/#33** : les 3 films injectés juste sous le film sélectionné sont
     **cohérents avec lui** (recommandations TMDB, plus des films régionaux hors sujet).
5. Étape 3/3 : valider le récapitulatif.

**Attendu :** arrivée sur l'accueil connecté, prénom affiché en haut, état vide
avec les 3 cartes « Crée ton groupe / Invite tes amis / Swipez, matchez » et
**deux** boutons : « Créer un groupe » et « J'ai un code d'invitation » (✅ #28).

### Étape 1-bis — Connexion Google (E2E-002, issue #26)
Sur un appareil vierge : taper « Continuer avec Google ».
- Provider configuré → choix du compte Google dans le navigateur → retour dans
  l'app, session ouverte, profil créé avec le nom Google.
- Provider non configuré → message « La connexion Google n'est pas encore
  activée sur le serveur. » (pas de crash, pas d'écran blanc).

---

## Étape 2 — Création du groupe (E2E-003)

**Appareil A :**
1. « Créer un groupe » → nom `Soirée Test`, genres `Action` + `Science-fiction`,
   âge `16+`, langue `VF + VOSTFR`.
2. « Générer un lien d'invitation » → noter le **code à 6 caractères**.
3. Valider, revenir à l'accueil.

**Attendu :** ✅ **Vérif #28** — le groupe apparaît dans la liste **sans changer
d'onglet** (rafraîchissement au focus). Badge « En attente » + « À lancer ».

---

## Étape 3 — Rejoindre via code (E2E-004, issue #28)

**Appareil B :** créer un compte (étape 1), puis :
1. « J'ai un code d'invitation » → saisir le code noté en 2.2
   (ou « Coller un lien d'invitation » avec le lien partagé).
2. « Rejoindre le groupe ».

**Attendu :** arrivée sur la page du groupe ; sur **A**, la page du groupe
liste **2 membres avec leurs noms**. Contre-test : saisir un code bidon →
« Ce code d'invitation est invalide. » (E2E-011).

---

## Étape 4 — Session de swipe (E2E-005, issue #29)

**Appareils A et B en parallèle :** « Lancer une session ».
1. ✅ **Vérif #29** : le bouton retour du haut n'est **pas** sous la barre de
   statut du téléphone.
2. ✅ **Vérif #29** : noter les 3 premiers films sur A et sur B → **les mêmes
   films dans le même ordre** (pool commun, nécessite P1).
3. Taper ⓘ en haut à droite d'une carte → fiche complète (synopsis entier,
   réalisation, casting, note TMDB). Fermer.
4. « Bande-annonce » → ✅ **Vérif #29** : la vidéo YouTube se lit dans l'app
   (plus d'« Error 153 »).
5. Sur A : liker (cœur ou swipe droite) les films 1 et 2, passer le 3.
   Sur B : liker les films 1 et 3, passer le 2.

---

## Étape 5 — Reprise de session (E2E-006, issue #30)

**Appareil A :** tuer l'app après les 3 votes, la rouvrir, relancer la session.

**Attendu :** ✅ la session reprend au **film 4** — aucun des 3 films votés ne
réapparaît.

---

## Étape 6 — Matchs et film gagnant (E2E-007/010, issues #31 #34)

**Sur A et B :** page groupe → « Voir les résultats ».
1. ✅ **Vérif #31** : pas de barre parasite `groups/[id]/matches` au-dessus du
   header — uniquement le header avec l'emoji et le nom du groupe.
2. ✅ **Vérif #34** : le film 1 (liké par les deux) affiche **2/2 votes · 100 %**
   et porte le badge « FILM GAGNANT » ; les films 2 et 3 affichent **1/2 votes
   · 50 %** (dénominateur = membres, plus jamais `1/1`).
3. ✅ **Vérif E2E-012** : classement **identique** sur A et sur B.
4. Sur l'accueil : la carte du groupe montre les **affiches** des films en tête
   et le badge « 1 match » (✅ #27).

---

## Étape 7 — Paramètres du groupe et gestion du lien (issue #35)

**Appareil A (admin) :** page du groupe → ⚙️ en haut à droite.
1. Renommer le groupe, changer la langue → « Enregistrer » → retour : la page
   du groupe reflète les changements immédiatement.
2. Rouvrir ⚙️ → « Régénérer le code » → confirmer.
3. **Appareil B (contre-test lien expiré, E2E-011)** : se déconnecter avec un
   3e compte, tenter de rejoindre avec l'**ancien** code → « Ce code
   d'invitation est invalide. » Le **nouveau** code fonctionne.
4. **Appareil B (non-admin)** : la page du groupe n'affiche **pas** la roue ⚙️.

---

## Étape 8 — Réinitialisation des votes (E2E-008, issue #32)

**Appareil A (admin) :** écran des résultats → bouton « Réinitialiser » en bas
du classement → confirmer.

**Attendu :** « Pas encore de match » sur A **et** B (après rafraîchissement) ;
relancer une session → les films revotables réapparaissent. Sur **B**
(non-admin), le bouton « Réinitialiser » est absent.

---

## Étape 9 — Profil et activité (issue #25)

**Appareil A :** onglet « Profil » (nav basse — plus de bouton profil redondant
en haut à droite).
1. Taper le pseudo → le modifier → ✓ → le nouveau pseudo s'affiche, et sur
   **B** la liste des membres du groupe le reflète.
2. Taper l'avatar → choisir une couleur → l'avatar change.
3. « Genres préférés » → la page s'ouvre préremplie → modifier → « Enregistrer ».
4. Stats : « Films votés / J'aime / Groupes » correspondent aux actions réelles
   du scénario (ex. 3 votés, 2 j'aime, 1 groupe après l'étape 8 : 0/0/1).
5. Onglet « Activité » : les événements réels apparaissent (« Bruno a rejoint
   Soirée Test », « Alice a aimé <film> · Soirée Test »), triés du plus récent
   au plus ancien.
6. « Se déconnecter » → retour à l'écran d'auth ; se reconnecter → les groupes
   et la progression sont intacts.

---

## Critères d'acceptation globaux

- [ ] Aucun crash ni écran blanc sur tout le parcours.
- [ ] Pool de films strictement identique entre membres d'un même groupe (P1).
- [ ] Dénominateur des votes = nombre de membres, partout.
- [ ] Classement et film gagnant identiques sur tous les appareils.
- [ ] Les films votés ne réapparaissent jamais dans une session (hors reset).
- [ ] Toutes les chaînes visibles sont en français.
- [ ] Les actions admin (reset, ⚙️) sont invisibles pour les membres.

## Limites connues
- En Expo Go, le lien profond `exp://<IP>:8081/--/groups/join?code=…` ne
  s'ouvre que si Expo Go tourne déjà sur le même réseau — passer par « Coller
  un lien d'invitation » sinon. Un build standalone avec `scheme` dédié lèvera
  cette limite.
- L'étape 1-bis dépend de la configuration serveur (P5).
