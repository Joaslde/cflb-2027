# CFLB 2027 · Candidatures

Site de candidature de la troisième édition de la Conférence des Femmes Leaders du Bénin (CFLB 2027, thème « Robot Pitch »).
Il présente brièvement l'événement puis recueille les candidatures via un parcours question par question.

## Stack

- React 19, Vite, TypeScript, Tailwind CSS 4
- Supabase (base de données, stockage, authentification) avec **l'URL du projet et la clé anon uniquement**
- React Three Fiber pour le robot 3D du hero, Framer Motion pour les animations
- Verre liquide : shader adapté de [Liquid Glass JS](https://github.com/dashersw/liquid-glass-js) (MIT), voir `src/components/liquid-glass/`

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev
```

| Variable | Rôle |
|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé anon (publique) |

Aucune clé secrète n'est utilisée par l'application. Les mêmes variables sont à déclarer sur Vercel.

## Pages

- `/` : landing (hero robot, effet de voile, sections CFLB, 2026, Vision 2027)
- `/postuler` : parcours de candidature (brouillon local, photo facultative, CV PDF obligatoire)
- Administration : à une adresse non publiée, connexion par PIN (provisoire, à remplacer par une connexion email)

## Base de données

Le schéma complet et les règles de sécurité (RLS) sont dans `supabase/schema.sql` :

- table `inscription_cflb_2027`, bucket privé `inscription-cflb-2027` ;
- un visiteur peut seulement déposer une candidature et ses fichiers ;
- seul un compte dont `app_metadata.cflb_admin = true` peut lire les candidatures, consulter les fichiers et changer le statut.

## Documents

`docs/` contient la présentation de la CFLB, la charte graphique et le guide des effets visuels.
