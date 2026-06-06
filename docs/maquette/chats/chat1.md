# Film Matching App

_Started 2026-06-03 06:04 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "MatchTonFilm"
Project is currently empty (no files)
Current date is now June 3, 2026
</system-info>

<default aesthetic_system_instructions>
The user has not attached a design system. If they have ALSO not attached references or art direction, and the project is empty, you must ASK the user what visual aesthetic they want. Use the questions_v2 tool to ask about preferred vibe, audience, colors, type, mood, etc. Do NOT just pick your own visual aesthetic without getting the user's aesthetic input -- this is how you get slop!

Once answered, use this guidance when creating designs:
- Choose a type pairing from web-safe set or Google Fonts. Helvetica is a good choice. Avoid hard-to-read or overly stylized fonts. Use 1-3 fonts only.
- Foreground and background: choose a color tone (warm, cool, neutral, something in-between). Use subtly-toned whites and blacks; avoid saturations above 0.02 for whites.
- Accents: choose 0-2 additional accent colors using oklch. All accents should share same chroma and lightness; vary hue.
- NEVER write out an SVG yourself that's more complicated than a square, circle, diamond, etc.
- For imagery, never hand-draw SVGs; use subtly-striped SVG placeholders instead with monospace explainers for what should be dropped there (e.g. “product shot”)

CRITICAL: ignore default aesthetic entirely if given other aesthetic instructions like reference images, design systems or guidance, or if there are files in the project already.
</default aesthetic_system_instructions>

<pasted_text name="Pasted text (196 lines)">
Tu peux donner à Claude Design un prompt orienté produit/UI complet comme celui-ci :

---

# Contexte

Tu es un Product Designer senior spécialisé en applications mobiles grand public.

Conçois l'expérience utilisateur complète (UX/UI) d'une application mobile nommée **MatchTonFilm**, permettant à un groupe d'amis de trouver un film à regarder ensemble grâce à un système de swipe inspiré de Tinder.

L'objectif principal est de réduire les longues discussions sur le choix d'un film et de permettre à un groupe d'obtenir rapidement un classement des films préférés collectivement.

L'application doit être moderne, intuitive, fluide et optimisée pour une utilisation le soir sur smartphone.

---

# Public cible

* Groupes d'amis
* Couples
* Familles
* Colocations
* Âge principal : 18-40 ans
* Utilisateurs peu techniques

---

# Contraintes techniques

* Application mobile iOS et Android
* Backend : Supabase
* Authentification :

  * Email / mot de passe
  * OAuth Google
* Source des données films :

  * TMDB (The Movie Database)

---

# Fonctionnalités

## 1. Authentification

### Écran de bienvenue

* Logo
* Slogan
* Bouton Connexion
* Bouton Inscription
* Continuer avec Google

### Onboarding

Après inscription :

1. Sélection des genres préférés
2. Sélection des films préférés
3. Validation

L'objectif est d'alimenter le moteur de recommandations.

---

## 2. Gestion des groupes

### Écran Accueil

Afficher :

* Groupes de l'utilisateur
* Dernière activité
* Nombre de membres
* Bouton Créer un groupe

### Création de groupe

Paramètres :

* Nom du groupe
* Genres autorisés
* Classification d'âge
* Langue
* Bouton Générer un lien d'invitation

### Rejoindre un groupe

* Via lien partagé
* Via code d'invitation

---

## 3. Système de Swipe

Dans un groupe :

Présenter les films sous forme de cartes.

Chaque carte doit afficher :

* Affiche du film
* Titre
* Année
* Note TMDB
* Genres
* Durée
* Casting principal
* Résumé
* Bande-annonce

Actions :

* Swipe droite = Like
* Swipe gauche = Dislike
* Boutons Like / Dislike accessibles également

Le design doit donner envie de parcourir les films rapidement.

---

## 4. Résultats du groupe

Écran "Matchs"

Afficher :

* Classement des films
* Pourcentage de likes
* Nombre total de votes
* Film gagnant mis en avant

Permettre :

* Réinitialisation des votes
* Nouveau cycle de sélection

---

# Attentes UX

Concevoir :

* User flow complet
* Architecture de l'information
* Navigation mobile
* Wireframes basse fidélité
* Maquettes haute fidélité
* États vides
* États de chargement
* États d'erreur
* Micro-interactions
* Animations de swipe
* Design System

---

# Attentes UI

Style recherché :

* Moderne
* Premium
* Inspiré de Netflix, Letterboxd et Tinder
* Mode sombre par défaut
* Accent color rouge cinématographique
* Cartes immersives
* Affiches de films mises en avant

Créer :

* Palette de couleurs
* Typographie
* Composants
* Boutons
* Cards
* Modales
* Navigation

---

# Livrables demandés

Produis :

1. Analyse UX
2. Parcours utilisateur détaillé
3. Architecture des écrans
4. Wireframes
5. Maquettes UI haute fidélité
6. Design System complet
7. Justification des choix UX/UI
8. Suggestions d'amélioration du produit après MVP

L'objectif est d'obtenir une application suffisamment qualitative pour être publiée sur l'App Store et Google Play.

</pasted_text>

<!-- The user explicitly selected the following skills for this project, as attachments to their message. These are not optional context — they define how you work. Use them. -->
<attached-skill name="Hi-fi design">
Create a high-fidelity, polished design.

Follow this general design process (use the todo list to remember):
(1) ask questions, (2) find existing UI kits and collect design context — copy ALL relevant components and read ALL relevant examples; ask the user if you can't find them, (3) start your file with assumptions + context + design reasoning (as if you are a junior designer and the user is your manager), with placeholders for the designs, and show it to the user early, (4) build out the designs and show the user again ASAP; append some next steps, (5) use your tools to check, verify and iterate on the design.

Good hi-fi designs do not start from scratch — they are rooted in existing design context. Ask the user to Import their codebase, or find a suitable UI kit / design resources, or ask for screenshots of existing UI. You MUST spend time trying to acquire design context, including components. If you cannot find them, ask the user for them. In the Import menu, they can link a local codebase, provide screenshots or Figma links; they can also link another project. Mocking a full product from scratch is a LAST RESORT and will lead to poor design. If stuck, try listing design assets and ls'ing design system files — be proactive! Some designs may need multiple design systems — get them all. Use the starter components (device frames and the like) to get high-quality scaffolding for free.

When presenting several options or explorations side-by-side, lay them out clearly: give the page a neutral gray background, put each option in its own labeled frame (a small heading + a white rounded card sized to its content), and group related options into sections.

When designing, asking many good questions is ESSENTIAL.

Give options: try to give 3+ variations across several dimensions. Mix by-the-book designs that match existing patterns with new and novel interactions, including interesting layouts, metaphors, and visual styles. Have some options that use color or advanced CSS; some with iconography and some without. Start your variations basic and get more advanced and creative as you go! Try remixing the brand assets and visual DNA in interesting ways — play with scale, fills, texture, visual rhythm, layering, novel layouts, type treatments. The goal is not the perfect option; it's exploring atomic variations the user can mix and match.

CSS, HTML, JS and SVG are amazing. Users often don't know what they can do. Surprise the user.

If you do not have an icon, asset or component, draw a placeholder: in hi-fi design, a placeholder is better than a bad attempt at the real thing.
</attached-skill>

<attached-skill name="Interactive prototype">
Create a fully interactive prototype with realistic state management and transitions. Use React useState/useEffect for dynamic behavior. Include hover states, click interactions, form validation, animated transitions, and multi-step navigation flows. It should feel like a real working app, not a static mockup.
</attached-skill>


<system-reminder>Auto-injected reminder (ignore if not relevant): do not recreate copyrighted or branded UI unless the user's email domain matches that company. Create original designs instead.</system-reminder>

## Assistant

_[tool: questions_v2]_

Je vais concevoir l'expérience complète de **MatchTonFilm**. Vous avez déjà donné une direction artistique claire (dark mode, accent rouge cinématographique, inspiration Netflix/Letterboxd/Tinder, cartes immersives), donc je vais m'appuyer dessus. Avant de me lancer, quelques questions pour cadrer le travail et éviter de partir dans la mauvaise direction.

## User

Questions answered:
- deliverable_focus: Un prototype mobile interactif haute-fidélité (cliquable, swipe réel) — le cœur du produit
- key_screens: Onboarding (genres + films préférés), Création / Rejoindre un groupe, Accueil (liste des groupes), Écran Matchs / Classement, Swipe de films (le cœur)
- swipe_feel: Boutons Like/Dislike avec animation de sortie de carte (plus simple)
- visual_direction: Premium néon : noir + rouge avec touches de profondeur (glassmorphism, lueurs subtiles)
- typography: Display marquante (ex. condensé cinéma) + corps neutre lisible
- accent_red: 2
- movie_posters: Je m'en fiche des droits, fais au mieux pour toi, cette maquette sera destiné à Claude Code
- device_frame: Écran plein, sans cadre, façon app native
- language: Français

## Assistant

_[tool: update_todos]_

Parfait, direction claire : **prototype mobile interactif, plein écran, dark néon premium (noir + rouge #FF3B47), typo condensée cinéma + corps neutre, swipe avec boutons + animation de sortie, en français.** Je construis un vrai prototype React cliquable couvrant les 5 flux clés.

_[tool: write_file]_

Je commence par le design system et les données.

_[tool: write_file]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: write_file]_

Maintenant les écrans. Welcome + Onboarding :

_[tool: write_file]_

_[tool: write_file]_

Accueil (groupes) + Créer/Rejoindre :

_[tool: write_file]_

_[tool: write_file]_

Le cœur — l'écran de Swipe :

_[tool: write_file]_

L'écran Matchs :

_[tool: write_file]_

Maintenant le routeur principal et la logique :

_[tool: write_file]_

Et le CSS spécifique aux écrans :Maintenant le fichier HTML principal :

_[tool: write_file]_

_[tool: update_todos]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

Pas d'erreur. Laisse-moi voir le résultat et parcourir les écrans clés.

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: show_to_user]_

L'écran est noir — le contenu Welcome ne s'affiche pas. Laisse-moi inspecter le DOM.

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

Tout est bien rendu (420×837 dans la vue utilisateur) — mon iframe était juste trop courte. Vérifions la vraie vue :

_[tool: eval_js_user_view]_

Bien — l'Accueil est superbe. Je remarque deux détails : « Team Boulot » semble tronqué et le 3ᵉ groupe affiche « En attente » en double. Laisse-moi vérifier et parcourir les autres écrans.

_[tool: str_replace_edit]_

C'est un artefact de screenshot — le texte complet est bien là. Mais le badge dupliqué « En attente / En attente » est réel. Je corrige :Maintenant parcourons les écrans clés — Onboarding, Swipe et Matchs :

_[tool: multi_screenshot]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: eval_js_user_view]_

Mon iframe est trop courte (contenu sous la ligne de flottaison) — la vue utilisateur, elle, rend correctement. Je pilote la navigation là-bas. Allons sur l'Onboarding :

_[tool: sleep]_

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

_[tool: eval_js_user_view]_

L'Onboarding est superbe (les clics rapides ont fusionné, normal). Allons droit au Swipe — l'écran cœur. Je me connecte et j'ouvre un groupe :

_[tool: sleep]_

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

_[tool: sleep]_

_[tool: screenshot_user_view]_

_[tool: str_replace_edit]_

Le Swipe fonctionne et c'est immersif. Un défaut : sur les titres longs (2 lignes), le titre chevauche la ligne d'infos. Je corrige l'espacement :

_[tool: eval_js_user_view]_

Maintenant l'écran Matchs. Je recharge pour appliquer le correctif puis j'y navigue :

_[tool: sleep]_

_[tool: eval_js_user_view]_

_[tool: sleep]_

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

_[tool: str_replace_edit]_

L'écran Matchs est très réussi. Le badge « FILM GAGNANT » passe sur 2 lignes — je force le `nowrap`. Pour Ciné Couple (2 votants) tout est à 100% (logique : les deux ont aimé), mais voyons un groupe à 4 pour la variété. D'abord le badge :

_[tool: eval_js_user_view]_

Vérifions le correctif du titre sur le Swipe et la variété des % avec un groupe à 4 membres (Soirée Coloc) :

_[tool: sleep]_

_[tool: eval_js_user_view]_

_[tool: sleep]_

_[tool: screenshot_user_view]_

_[tool: eval_js_user_view]_

Toujours le chevauchement — peut-être du cache. Inspectons les positions réelles :

_[tool: screenshot_user_view]_

Le DOM live est correct : titre sur 1 ligne à 31px, infos 12px en dessous (pas de chevauchement). Le screenshot précédent était un rendu en cache. Confirmons visuellement :

_[tool: eval_js_user_view]_

The screenshot tool can't load the Oswald webfont so it falls back to a wider font and misrenders — but the **live DOM measures cleanly** (title 1 line, 12px gap, no overlap). The real page is correct. Let me verify the like animation and match logic by swiping a few cards:

_[tool: sleep]_

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

Le badge reste à 7 (Dune était déjà un match du preset — déduplication correcte) et la carte est passée à Parasite. L'animation et la logique fonctionnent. Vérifions le classement à 4 membres (variété des %) :

_[tool: eval_js_user_view]_

_[tool: copy_starter_component]_

Le classement à 4 membres montre de la variété (100/100/100/75/75/75%). Tout fonctionne. J'ajoute maintenant un panneau **Tweaks** soigné (couleur d'accent, intensité des lueurs, rayon des cartes) pour rendre le design system ajustable :

_[tool: str_replace_edit]_

Je câble les Tweaks (accent, lueurs, rayon, typo display). D'abord j'ajoute deux polices display alternatives :

_[tool: write_file]_

Maintenant je câble `TweaksLayer` dans App et j'ajoute les scripts :

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Vérifions que tout se charge proprement avec les Tweaks :

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

Le prototype **MatchTonFilm** est prêt et fonctionnel — un vrai produit cliquable, plein écran, en français.

## Ce que j'ai construit

**7 écrans reliés en un flux complet :**
- **Welcome** — affiches en marquee défilant, logo, slogan « Arrêtez de débattre. Swipez. », inscription / Google / connexion
- **Onboarding 3 étapes** — genres (min. 3), films préférés (grille d'affiches), validation récapitulative avec barre de progression
- **Accueil** — liste des groupes (membres, dernière activité, badges de matchs), créer/rejoindre, + nav basse (Groupes / Activité / Profil) et états vides
- **Créer un groupe** — nom, genres autorisés, classification d'âge, langue, génération de **code + lien d'invitation**
- **Rejoindre** — saisie de code à 6 cases + coller un lien
- **Swipe** (le cœur) — cartes empilées avec profondeur, **drag réel + boutons** J'aime/Passer, tampons « J'AIME / NON », animation de sortie, fiche détaillée (casting, synopsis, bande-annonce), skeleton de chargement, toasts « Ça matche ! »
- **Matchs** — film gagnant mis en avant (badge doré, % de likes, votes, note TMDB), classement complet avec barres, réinitialiser / nouveau cycle

**Design system** « premium néon » : noir profond + rouge #FF3B47, typo Oswald condensée cinéma + Manrope, glassmorphism, lueurs, 16 films type TMDB avec affiches stylisées.

**Panneau Tweaks** (bouton Tweaks de la barre d'outils) : nuance d'accent, intensité des lueurs, rayon des cartes, police display (Oswald / Bebas Neue / Anton).

## À noter
- Les **affiches sont des placeholders dégradés stylisés** — branchées sur les vraies images TMDB côté Claude Code, l'app gagnera énormément.
- Pensé comme **maquette de référence pour le dev** : architecture en composants, données mockées isolées dans `app/data.js`.

## Pistes post-MVP
Notifications « X a fini de swiper », chat de groupe, historique des soirées, filtres « dispo sur mes plateformes » (JustWatch). Dis-moi si tu veux que j'ajoute l'un de ces écrans ou que j'explore des variantes visuelles de la carte de swipe.

