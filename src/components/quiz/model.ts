/*
 * Modèle du parcours de candidature : données, étapes et validations.
 */

export interface Draft {
  prenom: string
  nom: string
  date_naissance: string
  ville: string
  telephone: string
  email: string
  profession: string
  structure: string
  categorie: string
  motivation: string
  consent_image: boolean
  consent_reglement: boolean
  consent_exactitude: boolean
}

export interface Files {
  photo: File | null
  cv: File | null
}

export const EMPTY_DRAFT: Draft = {
  prenom: '',
  nom: '',
  date_naissance: '',
  ville: '',
  telephone: '+229 ',
  email: '',
  profession: '',
  structure: '',
  categorie: '',
  motivation: '',
  consent_image: false,
  consent_reglement: false,
  consent_exactitude: false,
}

// Catégories provisoires : à remplacer par la liste officielle 2027
export const CATEGORIES = [
  { value: 'Entrepreneure', description: 'Tu portes une entreprise ou une activité.' },
  { value: 'Étudiante', description: 'Tu es en formation et tu veux prendre ta place.' },
  { value: 'Professionnelle', description: 'Tu exerces un métier ou tu diriges une équipe.' },
  { value: 'Porteuse de projet', description: 'Tu as une idée ou un projet à impact.' },
]

export const MOTIVATION_MIN = 50
export const MOTIVATION_MAX = 2000
export const FILE_MAX_BYTES = 5 * 1024 * 1024

export type StepId =
  | 'identite'
  | 'naissance'
  | 'ville'
  | 'telephone'
  | 'email'
  | 'profil'
  | 'categorie'
  | 'motivation'
  | 'photo'
  | 'cv'
  | 'engagements'
  | 'recap'

export const STEPS: StepId[] = [
  'identite',
  'naissance',
  'ville',
  'telephone',
  'email',
  'profil',
  'categorie',
  'motivation',
  'photo',
  'cv',
  'engagements',
  'recap',
]

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

export function ageFrom(date: string) {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

/** Renvoie un message d'erreur, ou null si l'étape est valide. */
export function validate(step: StepId, d: Draft, f: Files): string | null {
  switch (step) {
    case 'identite':
      if (d.prenom.trim().length < 2) return 'Indique ton prénom.'
      if (d.nom.trim().length < 2) return 'Indique ton nom.'
      return null
    case 'naissance': {
      const age = ageFrom(d.date_naissance)
      if (age === null) return 'Indique ta date de naissance.'
      if (age < 15 || age > 90) return 'Cette date de naissance ne semble pas correcte.'
      return null
    }
    case 'ville':
      return d.ville.trim().length < 2 ? 'Indique ta ville.' : null
    case 'telephone': {
      const digits = d.telephone.replace(/\D/g, '')
      return digits.length < 8 || digits.length > 15 ? 'Ce numéro WhatsApp ne semble pas complet.' : null
    }
    case 'email':
      return EMAIL_RE.test(d.email.trim()) ? null : 'Cette adresse email ne semble pas valide.'
    case 'profil':
      return d.profession.trim().length < 2 ? 'Dis-nous ce que tu fais.' : null
    case 'categorie':
      return d.categorie ? null : 'Choisis une catégorie.'
    case 'motivation': {
      const n = d.motivation.trim().length
      if (n < MOTIVATION_MIN) return `Encore ${MOTIVATION_MIN - n} caractères au minimum.`
      if (n > MOTIVATION_MAX) return `${n - MOTIVATION_MAX} caractères de trop.`
      return null
    }
    case 'photo':
      return f.photo && f.photo.size > FILE_MAX_BYTES ? 'La photo dépasse 5 Mo.' : null
    case 'cv':
      if (!f.cv) return 'Ajoute ton CV au format PDF.'
      return f.cv.size > FILE_MAX_BYTES ? 'Le CV dépasse 5 Mo.' : null
    case 'engagements':
      return d.consent_image && d.consent_reglement && d.consent_exactitude ? null : 'Les trois engagements sont nécessaires.'
    case 'recap':
      return null
  }
}

/** Première étape invalide (utile avant l'envoi). */
export function firstInvalid(d: Draft, f: Files): StepId | null {
  return STEPS.find((s) => validate(s, d, f) !== null) ?? null
}
