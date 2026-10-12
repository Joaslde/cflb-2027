import { useEffect, type ReactNode } from 'react'
import logo from '@/assets/logo-cflb-sm.webp'
import { GlassButton } from '@/components/liquid-glass'
import { usePageMeta } from '@/lib/usePageMeta'

/*
 * Politique de confidentialité du parcours de candidature CFLB 2027.
 * Elle décrit ce que le site fait réellement : à mettre à jour si la collecte,
 * l'hébergement ou les accès changent.
 */

const MISE_A_JOUR = '12 octobre 2026'
const WHATSAPP = '+229 01 98 52 38 70'
const WHATSAPP_LIEN = 'https://wa.me/2290198523870'

const SECTIONS = [
  { id: 'responsable', titre: 'Qui est responsable de tes données' },
  { id: 'donnees', titre: 'Les données que nous collectons' },
  { id: 'usages', titre: 'Ce que nous en faisons' },
  { id: 'base', titre: 'Sur quelle base' },
  { id: 'acces', titre: 'Qui y a accès' },
  { id: 'hebergement', titre: 'Où elles sont stockées' },
  { id: 'duree', titre: 'Combien de temps nous les gardons' },
  { id: 'securite', titre: 'Comment nous les protégeons' },
  { id: 'droits', titre: 'Tes droits' },
  { id: 'mineures', titre: 'Candidates mineures' },
  { id: 'traceurs', titre: 'Cookies et traceurs' },
  { id: 'modifications', titre: 'Modifications de cette politique' },
]

function Section({ id, n, titre, children }: { id: string; n: number; titre: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-or/30 pt-10">
      <p className="font-label text-[10px] uppercase tracking-[0.25em] text-or-fonce">{String(n).padStart(2, '0')}</p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-charcoal sm:text-4xl">{titre}</h2>
      <div className="mt-5 space-y-4 text-lg leading-relaxed text-encre-douce [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-charcoal [&_ul]:list-none [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  )
}

function Puce({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rotate-45 bg-or" />
      <span>{children}</span>
    </li>
  )
}

export function ConfidentialitePage() {
  usePageMeta({
    titre: 'Politique de confidentialité · CFLB 2027',
    description:
      'Comment la CFLB collecte, utilise, protège et conserve les données des candidates au Robot-Pitch Challenge 2027, et comment exercer tes droits.',
    chemin: '/confidentialite',
  })
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div data-glass-backdrop className="min-h-dvh bg-ivoire text-charcoal">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 sm:px-10">
        <a href="/" className="flex items-center gap-3" aria-label="Retour à l’accueil">
          <img src={logo} alt="" className="h-12 w-12 object-contain" />
          <span className="hidden font-label text-[10px] uppercase tracking-[0.25em] text-encre-douce sm:inline">CFLB 2027</span>
        </a>
        <GlassButton href="/" size="sm">
          Retour à l’accueil
        </GlassButton>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-10">
        <p className="font-label text-[10px] uppercase tracking-[0.3em] text-or-fonce">CFLB Robot-Pitch Challenge 2027</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.98] sm:text-7xl">Politique de confidentialité</h1>
        <p className="mt-5 text-encre-douce">Dernière mise à jour : {MISE_A_JOUR}</p>

        {/* L'essentiel en quatre points */}
        <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-or/30 bg-or/30 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Pour ta candidature uniquement', 'Tes données servent à étudier ta candidature et à te recontacter. Rien d’autre.'],
            ['Jamais vendues', 'Aucune revente, aucune publicité, aucun envoi à des tiers à des fins commerciales.'],
            ['Accès restreint', 'Seule l’équipe d’organisation y accède, depuis un espace protégé.'],
            ['Tu gardes la main', 'Tu peux consulter, corriger ou faire supprimer tes données à tout moment.'],
          ].map(([t, d]) => (
            <div key={t} className="bg-ivoire p-7">
              <p className="font-display text-2xl leading-tight">{t}</p>
              <p className="mt-3 leading-relaxed text-encre-douce">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-14 lg:grid-cols-[16rem_1fr]">
          {/* Sommaire */}
          <nav aria-label="Sommaire" className="lg:sticky lg:top-8 lg:self-start">
            <p className="font-label text-[10px] uppercase tracking-[0.25em] text-or-fonce">Sommaire</p>
            <ol className="mt-5 space-y-2.5">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-3 text-[15px] leading-snug text-charcoal/75 transition-colors hover:text-or-fonce">
                    <span className="font-label text-[10px] leading-6 text-or-fonce">{String(i + 1).padStart(2, '0')}</span>
                    {s.titre}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-3xl space-y-14">
            <p className="text-xl leading-relaxed text-encre-douce">
              En déposant ta candidature au CFLB Robot-Pitch Challenge 2027, tu nous confies des informations personnelles. Cette
              page explique, simplement et en détail, ce que nous collectons, pourquoi, qui y a accès, combien de temps nous les
              gardons et comment exercer tes droits.
            </p>

            <Section id="responsable" n={1} titre="Qui est responsable de tes données">
              <p>
                Le responsable du traitement est le <strong>Comité d’organisation de la Conférence des Femmes Leaders du Bénin
                (CFLB)</strong>, qui organise la troisième édition de la conférence et le CFLB Robot-Pitch Challenge 2027.
              </p>
              <p>
                Pour toute question sur tes données, écris-nous sur WhatsApp au{' '}
                <a href={WHATSAPP_LIEN} target="_blank" rel="noopener noreferrer" className="text-charcoal underline decoration-or underline-offset-4">
                  {WHATSAPP}
                </a>
                .
              </p>
            </Section>

            <Section id="donnees" n={2} titre="Les données que nous collectons">
              <p>Nous ne collectons que ce que tu saisis dans le formulaire de candidature :</p>
              <ul>
                <Puce>
                  <strong>Identité et contact :</strong> nom, prénom, date de naissance, ville, numéro WhatsApp et adresse email.
                </Puce>
                <Puce>
                  <strong>Profil :</strong> profession ou activité, structure ou entreprise (facultatif) et catégorie.
                </Puce>
                <Puce>
                  <strong>Candidature :</strong> ta motivation, ton CV au format PDF et, si tu le souhaites, une photo de toi.
                </Puce>
                <Puce>
                  <strong>Engagements :</strong> tes trois accords (droit à l’image, règlement, exactitude des informations) et la
                  date de dépôt.
                </Puce>
                <Puce>
                  <strong>Suivi :</strong> le statut de ta candidature (en attente, acceptée ou refusée) et la date de la décision.
                </Puce>
              </ul>
              <p>
                Pendant que tu remplis le formulaire, tes réponses (sauf la photo et le CV) sont gardées{' '}
                <strong>sur ton appareil uniquement</strong>, dans le stockage de ton navigateur, pour que tu puisses reprendre
                plus tard. Ce brouillon ne nous est pas transmis : il est effacé dès l’envoi de ta candidature, et tu peux
                l’effacer toi-même avec « Recommencer à zéro ».
              </p>
              <p>Nous ne collectons aucune autre donnée : pas de localisation, pas de contacts, pas d’historique de navigation.</p>
            </Section>

            <Section id="usages" n={3} titre="Ce que nous en faisons">
              <p>Tes données servent exclusivement à :</p>
              <ul>
                <Puce>
                  <strong>Étudier ta candidature</strong> au CFLB Robot-Pitch Challenge 2027 : lecture de ta motivation et de ton
                  CV, présélection et décision.
                </Puce>
                <Puce>
                  <strong>Te contacter</strong> par WhatsApp ou par email au sujet de ta candidature : réponse, compléments
                  d’information, préparation du pitch.
                </Puce>
                <Puce>
                  <strong>Organiser le challenge</strong> : programme, passage devant le jury et logistique de l’événement du 20
                  mars 2027.
                </Puce>
                <Puce>
                  <strong>Présenter les candidates retenues</strong> dans la communication de l’événement (site, réseaux sociaux,
                  supports imprimés), uniquement dans le cadre de ton accord sur le droit à l’image.
                </Puce>
              </ul>
              <p>
                Nous n’utilisons pas tes données pour de la prospection commerciale, nous ne les vendons pas et nous ne les
                cédons à aucune entreprise. Nous ne prenons aucune décision automatisée : chaque candidature est examinée par une
                personne.
              </p>
            </Section>

            <Section id="base" n={4} titre="Sur quelle base">
              <p>
                Ce traitement repose sur <strong>ton consentement</strong>, que tu donnes en cochant les engagements à la fin du
                formulaire, et sur ta <strong>demande de participation</strong> au challenge, que nous ne pouvons pas étudier sans
                ces informations.
              </p>
              <p>
                Il respecte la loi n° 2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin, dont le livre
                cinquième encadre la protection des données à caractère personnel.
              </p>
            </Section>

            <Section id="acces" n={5} titre="Qui y a accès">
              <ul>
                <Puce>
                  <strong>L’équipe d’organisation de la CFLB</strong>, depuis un espace d’administration protégé, pour examiner
                  les candidatures et en suivre le statut.
                </Puce>
                <Puce>
                  <strong>Les membres du jury</strong>, pour les seules candidatures présélectionnées et seulement ce qui est utile
                  à l’évaluation des projets.
                </Puce>
                <Puce>
                  <strong>Nos prestataires techniques</strong>, qui hébergent le site et les données pour notre compte, sans
                  pouvoir les utiliser à leurs propres fins (voir la section suivante).
                </Puce>
              </ul>
              <p>Tes données ne sont jamais publiques : aucun visiteur du site ne peut consulter une candidature.</p>
            </Section>

            <Section id="hebergement" n={6} titre="Où elles sont stockées">
              <ul>
                <Puce>
                  <strong>Supabase</strong> héberge la base de données et les fichiers (CV et photos) sur des serveurs situés à
                  Londres, au Royaume-Uni. Tes données sont donc transférées hors du Bénin, chez un prestataire soumis à des règles
                  strictes de protection des données.
                </Puce>
                <Puce>
                  <strong>Vercel</strong> héberge le site lui-même (les pages que tu consultes).
                </Puce>
              </ul>
            </Section>

            <Section id="duree" n={7} titre="Combien de temps nous les gardons">
              <ul>
                <Puce>
                  <strong>Candidatures (données, CV et photos) :</strong> conservées le temps de l’édition 2027, puis supprimées au
                  plus tard le 20 mars 2028, un an après l’événement.
                </Puce>
                <Puce>
                  <strong>Contenus déjà publiés</strong> avec ton accord (par exemple une photo dans une publication sur
                  l’événement) : ils peuvent rester en ligne, mais tu peux demander leur retrait à tout moment.
                </Puce>
                <Puce>
                  <strong>Brouillon sur ton appareil :</strong> effacé dès l’envoi de ta candidature.
                </Puce>
              </ul>
            </Section>

            <Section id="securite" n={8} titre="Comment nous les protégeons">
              <ul>
                <Puce>Tous les échanges entre ton navigateur et nos serveurs sont chiffrés (HTTPS).</Puce>
                <Puce>
                  Les CV et les photos sont rangés dans un espace privé : ils ne sont consultables que par l’équipe d’organisation,
                  au moyen de liens temporaires qui expirent après quelques minutes.
                </Puce>
                <Puce>
                  Des règles de sécurité appliquées directement par la base de données empêchent quiconque, en dehors de
                  l’administration, de lire, de modifier ou de supprimer une candidature.
                </Puce>
                <Puce>L’espace d’administration est protégé par un code d’accès et n’est pas accessible publiquement.</Puce>
              </ul>
            </Section>

            <Section id="droits" n={9} titre="Tes droits">
              <p>À tout moment, tu peux nous demander :</p>
              <ul>
                <Puce>
                  <strong>d’accéder</strong> aux données que nous détenons sur toi ;
                </Puce>
                <Puce>
                  <strong>de les corriger</strong> si elles sont inexactes ou incomplètes ;
                </Puce>
                <Puce>
                  <strong>de les supprimer</strong>, ce qui retire ta candidature ;
                </Puce>
                <Puce>
                  <strong>de retirer ton consentement</strong>, notamment sur ton image. Ce retrait vaut pour l’avenir et ne remet
                  pas en cause ce qui a été fait avant ;
                </Puce>
                <Puce>
                  <strong>de t’opposer</strong> à un usage particulier de tes données.
                </Puce>
              </ul>
              <p>
                Il suffit de nous écrire sur WhatsApp au{' '}
                <a href={WHATSAPP_LIEN} target="_blank" rel="noopener noreferrer" className="text-charcoal underline decoration-or underline-offset-4">
                  {WHATSAPP}
                </a>
                , en précisant le nom et l’adresse email utilisés pour ta candidature. Nous te répondrons dans les meilleurs délais,
                et au plus tard sous un mois.
              </p>
              <p>
                Si tu estimes que tes droits ne sont pas respectés, tu peux saisir l’Autorité de Protection des Données à
                caractère Personnel du Bénin (APDP).
              </p>
            </Section>

            <Section id="mineures" n={10} titre="Candidates mineures">
              <p>
                Le formulaire est ouvert à partir de 15 ans. Si tu as moins de 18 ans, parles-en à un parent ou à ton tuteur légal
                avant de déposer ta candidature : son accord pourra t’être demandé, en particulier pour l’utilisation de ton
                image.
              </p>
            </Section>

            <Section id="traceurs" n={11} titre="Cookies et traceurs">
              <p>
                Le site n’utilise <strong>aucun cookie publicitaire</strong> et <strong>aucun outil de mesure d’audience</strong>.
              </p>
              <ul>
                <Puce>
                  Le stockage de ton navigateur sert uniquement au brouillon de candidature décrit plus haut, et à la session de
                  l’espace d’administration (pour l’équipe d’organisation).
                </Puce>
                <Puce>
                  Les polices de caractères sont chargées depuis Fontshare : comme pour toute ressource en ligne, ton adresse IP
                  est alors transmise à ce service.
                </Puce>
              </ul>
            </Section>

            <Section id="modifications" n={12} titre="Modifications de cette politique">
              <p>
                Nous pouvons mettre à jour cette politique, par exemple si le fonctionnement du formulaire évolue. La date de
                dernière mise à jour figure en haut de la page. En cas de changement important, nous t’en informerons par WhatsApp
                ou par email si ta candidature est en cours.
              </p>
            </Section>

            <div className="flex flex-wrap items-center gap-4 border-t border-or/30 pt-10">
              <GlassButton href="/postuler" variant="or" size="md">
                Déposer ma candidature
              </GlassButton>
              <GlassButton href="/" size="md">
                Retour à l’accueil
              </GlassButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
