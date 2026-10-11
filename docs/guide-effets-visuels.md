# Guide des effets visuels (référence du projet CFLB 2027)

Source : https://guides.0xloucash.xyz/Cr%C3%A9ation+de+Contenu/Guides+DM/4+repos+GitHub+effets+visuels+-+liens+et+guide

Toutes les bibliothèques ci-dessous sont sous licence MIT.

Prérequis communs : Node.js 18+, un projet React (Vite ou Next.js). Sans React, le guide propose de donner le prompt de chaque effet à Claude Code pour qu'il adapte à la stack.

Précautions du guide :
- Les effets WebGL et 3D sont lourds. Sur mobile, les limiter à une seule section.
- Tester en local avant de déployer.

## Décision du projet

| Outil | Statut |
|---|---|
| Liquid Glass JS | Retenu : boutons et blocs d'information |
| Liquid Logo | Retenu |
| React Three Fiber (3D) | Retenu, probablement nécessaire |
| ShaderGradient | Non obligatoire, à décider plus tard |

## 1. Liquid Glass JS (retenu)

- Effet : verre liquide façon Apple (réfraction et flou en temps réel). Environ 514 étoiles.
- GitHub : https://github.com/dashersw/liquid-glass-js
- Démo : https://dashersw.github.io/liquid-glass-js/
- Techno : JavaScript pur, WebGL 2.0 requis. À encapsuler dans un composant pour React.
- Mise en place :
  1. Cloner le dépôt.
  2. Charger html2canvas depuis le CDN jsDelivr, puis `container.js` et `button.js` du dépôt.
  3. Créer un `Button` avec texte, taille, type (`rounded`, `circle` ou `pill`) et un gestionnaire onClick, puis ajouter son `element` au document.
- Réglages : flou (1 à 15), intensité des bords (0 à 0.1), opacité de la teinte (0 à 1).

## 2. Liquid Logo (retenu)

- Effet : transforme un logo en métal liquide chromé. Environ 796 étoiles.
- Site et démo : https://liquid.paper.design
- GitHub (non cité par le guide, à vérifier) : https://github.com/paper-design/shaders
- Techno : React, paquet `@paper-design/shaders-react`, composant `LiquidMetal`.
- Sans code : téléverser le logo sur le site (le SVG donne le meilleur résultat), régler les curseurs (Refraction, Edge, Liquify, Speed), puis exporter en image ou en vidéo.
- Avec React :
  1. `npm i @paper-design/shaders-react`
  2. Placer le logo dans `/public`.
  3. Utiliser `LiquidMetal` avec les props `image`, `refraction`, `edge`, `liquify`, `speed`, `patternScale`.
  4. Les noms de props changent selon les versions : vérifier dans la version installée.

## 3. React Three Fiber (retenu)

- Effet : 3D réelle (Three.js) dans React. Environ 31,3 k étoiles.
- Documentation : https://docs.pmnd.rs/react-three-fiber
- GitHub (non cité par le guide, à vérifier) : https://github.com/pmndrs/react-three-fiber
- Installation : `npm install three @react-three/fiber`
- Utilisation : une scène avec `Canvas`, des lumières et un mesh (l'exemple du guide est un cube orange en rotation).
- Option : `npm i @react-three/drei` pour les aides comme `OrbitControls`.

## 4. ShaderGradient (non obligatoire)

- Effet : fonds dégradés animés en 3D. Environ 1,8 k étoiles.
- Personnalisation : https://www.shadergradient.co/customize
- GitHub (non cité par le guide, à vérifier) : https://github.com/ruucm/shadergradient
- Techno : React, `@shadergradient/react`. Fonctionne aussi avec Framer et Figma.
- Installation : `npm i @shadergradient/react @react-three/fiber three three-stdlib camera-controls`
- Utilisation :
  1. Ajouter un `ShaderGradientCanvas` contenant un `ShaderGradient`.
  2. Régler `color1`, `color2`, `color3` (hex), `type` (`plane`, `sphere` ou `waterPlane`) et `uSpeed`.
  3. Option rapide : régler le dégradé sur le site, copier l'URL, puis la passer au composant avec `control="query"` et `urlString`.

## Modèle de prompt pour Claude Code (résumé du guide)

Le guide fournit un prompt à compléter. Il demande de : installer la bibliothèque, créer un composant réutilisable, l'intégrer dans une page précise, reproduire l'effet décrit, et montrer un aperçu local avant de finaliser. Il conseille de régler l'effet sur la démo en ligne puis de coller les valeurs ou l'URL dans le prompt.

## Note de fiabilité

Ce fichier est une synthèse faite à partir d'une lecture automatique de la page. Le texte exact des blocs de code et du prompt du guide n'a pas été reproduit mot pour mot : se reporter à la source pour les copier. Les liens GitHub marqués « non cité par le guide » viennent de mes connaissances. Ils ont été testés le 11/10/2026 et répondent tous (HTTP 200).

## Intégration dans le site CFLB 2027

Liquid Glass JS n'est pas utilisé tel quel. Son shader (licence MIT, crédit conservé dans le code) a été porté dans `src/components/liquid-glass/`, car la version d'origine :
- prend une seule capture figée de la page, donc ne suit pas le robot animé ;
- ouvre un contexte WebGL par bouton (limite d'environ 16 par navigateur) ;
- utilise html2canvas 1.4.1, qui plante sur les couleurs `oklch` de Tailwind 4 ;
- génère des `div` au lieu de vrais boutons.

Utilisation :

```tsx
import { GlassButton } from '@/components/liquid-glass'

<GlassButton href="/postuler" variant="or">Postuler</GlassButton>
<GlassButton variant="clair" onClick={retour}>Retour</GlassButton>
```

- `variant` : `or` (action principale) ou `clair` (action secondaire).
- `shape` : `pill` (par défaut), `rounded` ou `circle`. `size` : `sm`, `md`, `lg`.
- La zone dont le verre capture l'arrière-plan porte `data-glass-backdrop`.
- Un canvas animé à réfracter en direct est enveloppé dans `data-glass-live` (avec `preserveDrawingBuffer`).
- Un élément à exclure de la capture (le loader) porte `data-glass-ignore`.
- Sans WebGL, le bouton garde un repli en verre CSS (`backdrop-filter`).
