# Charte Graphique, Design System & Philosophie Design
**Projet :** Conférence des Femmes Leaders du Bénin (CFLB)

---

## 1. Philosophie Design

Le design de l'application repose sur un univers **Haute Couture, Prestige & Élégance**, reflétant l'excellence et le leadership féminin. 

* **Luxe & Contraste Élevé :** L'association du noir profond et de touches dorées crée un contraste saisissant qui valorise immédiatement les visuels (candidates, parrains, marraines).
* **Glassmorphic & Immersion :** Utilisation intensive d'effets de flou d'arrière-plan (*Glassmorphism*) pour donner une impression de profondeur, de modernité et de légèreté visuelle.
* **Mobile-First & Mobile-Centric :** L'application privilégie l'expérience sur smartphone (mise en page immersive pleine page, cartes flottantes au pouce, modals centrées) tout en s'adaptant élégamment sur ordinateur.
* **Conversion Sans Friction :** Les éléments d'action (boutons de vote, achat de tickets) sont proéminents, fortement contrastés et immédiatement accessibles pour maximiser l'engagement utilisateur.

---

## 2. Palette de Couleurs

### Couleurs Principales (Fond & Structure)
* **Noir Absolu (`#000000`) :** Utilisé pour les arrière-plans immersifs et les overlays vidéo/photo.
* **Noir Charcoal (`#0E0E0E`) :** Utilisé pour les cartes, en-têtes et conteneurs sombres pour créer un léger contraste avec le fond.
* **Fonds Translucides (`rgba(20, 20, 20, 0.6)` à `rgba(30, 30, 30, 0.9)`) :** Base des éléments Glassmorphism avec flou (*backdrop-filter*).
* **Fond Ivoire / Light (`#F8F5F2`) :** Utilisé spécifiquement sur la billetterie pour une ambiance "Ticket Papier Officiel".

### Couleurs d'Accentuation (Luxe & Prestige)
* **Or Chaud / Gold (`#D4AF37`) :** Couleur signature pour les titres, séparateurs, bordures et accents.
* **Or Éclatant (`#FFD700`) :** Reservé aux éléments interactifs majeurs (boutons primaires, états actifs, modales).
* **Dégradé Doré (`linear-gradient(135deg, #cfaa2e, #eea810)`) :** Appliqué sur les boutons principaux d'action (Voter, Payer).

### Couleurs de Texte & Typographie
* **Texte Blanc Pur (`#FFFFFF`) :** Utilisé pour la lisibilité sur fond sombre.
* **Texte Muted (`rgba(255, 255, 255, 0.7)` / `#888888`) :** Pour les descriptions, labels, sous-titres et métadonnées.
* **Texte Sombre (`#0E0E0E` / `#555555`) :** Pour les conteneurs à fond clair (billetterie).

---

## 3. Typographie

### Titres & Identité d'Apparat
* **Police Principale :** `Playfair Display`, serif.
  * **Usage :** Noms des candidates, titres des personnalités (Marraine/Parrain), titres de sections prestigieuses.
  * **Rendu :** Élégant, intemporel, haut de gamme.
* **Police Festive / Titres Spéciaux :** `Lobster`, cursive.
  * **Usage :** Titres d'en-tête de billets ou éléments d'invitation.

### Texte d'Interface & Corps de Texte
* **Police Universelle UI :** `Montserrat`, sans-serif.
  * **Usage :** Boutons, labels de formulaires, textes de description, badges, sous-titres.
  * **Spécifications :**
    * **Labels & Badges :** Majuscules (`text-transform: uppercase`), espacement de lettres (`letter-spacing: 1px` à `2px`), graisse élevée (`font-weight: 600` à `800`).
    * **Corps de texte :** Graisse normale (`font-weight: 400`), hauteur de ligne aérée (`line-height: 1.5` à `1.6`).

---

## 4. Design Patterns & Composants UI

### A. La Carte Glassmorphism (`.info-card`)
* **Fond :** `rgba(20, 20, 20, 0.6)`
* **Flou d'arrière-plan :** `backdrop-filter: blur(25px)`
* **Bordure :** `1px solid rgba(255, 255, 255, 0.1)`
* **Rayon de bordure (Border Radius) :** `20px` à `30px`
* **Ombrage :** `0 10px 40px rgba(0, 0, 0, 0.5)`

### B. Le Séparateur Doré (`.separator-gold`)
* **Usage :** Placé sous le nom des personnalités pour ancrer visuellement le titre.
* **Style :** Ligne fine dorée (`#D4AF37`), largeur fixe (environ `50px` à `80px`), hauteur `2px` à `3px`.
* **Comportement Responsive :** Centré sur mobile (`ms-auto me-auto`), aligné dynamiquement selon la grille sur Desktop.

### C. Cercle Avatar / Logo (`.event-logo-circle`, `.logo-circle`)
* **Usage :** Mise en valeur des logos et visuels de marque.
* **Style :** Cercle parfait (`border-radius: 50%`), fond blanc pur, bordure dorée fine (`3px solid #D4AF37`), ombre portée dorée (`box-shadow: 0 0 15px rgba(212, 175, 55, 0.4)`).

### D. Boutons d'Action (`.btn-vote`, `.btn-pay`, `.btn-purchase`)
* **Design :** Dégradé doré ou fond `#FFD700` avec texte sombre pour un contraste maximal.
* **Typographie :** Majuscules, `font-weight: 800`, `letter-spacing: 1px`.
* **Effets :**
  * **Hover :** Légère élévation (`transform: scale(1.04)` ou `translateY(-3px)`), ombre dorée amplifiée.
  * **Active / Click :** Légère compression (`transform: scale(0.95)`).
  * **Disabled :** Opacité réduite (`0.5`) avec filtre de niveaux de gris (`filter: grayscale(1)`).

### E. Notifications & Modales
* **Modale Overlay :** Fond sombre semi-transparent (`rgba(0, 0, 0, 0.8)`) avec flou (`backdrop-filter: blur(10px)`).
* **Toast Notification :** Positionné en haut au centre (`top: 30px`, `left: 50%`), coins très arrondis (`border-radius: 20px`), bordure fine dorée, entrées animées via transitions CSS (`slide-fade`).

---

## 5. Directives de Layout & Responsivité

### Structure Mobile (Mobile-First)
* Arrière-plans en mode image fixe pleine page (`height: 100vh`, `background-size: cover`).
* Gradient d'assombrissement dynamique (`linear-gradient(to top, rgba(0,0,0,0.9) 20%, transparent 70%)`) pour garantir la lisibilité des textes situés en bas d'écran.
* Cartes d'information fixées en bas d'écran pour un accès facile au pouce.

### Structure Desktop (Grille Bootstrap 5)
* Disposition en grille classique avec conteneurs centrés (`max-width`).
* Alternance visuelle dynamique entre les sections (ex: `flex-row-reverse` pour la section Parrain afin d'inverser l'image et le texte par rapport à la Marraine).
* Alignements de texte conditionnels : centrés sur mobile (`text-center`), alignés à gauche ou à droite sur grand écran (`text-lg-end`, `text-lg-start`).