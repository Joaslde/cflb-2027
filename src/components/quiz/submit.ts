import { BUCKET_INSCRIPTIONS, TABLE_INSCRIPTIONS, supabase } from '@/lib/supabase'
import type { Draft, Files } from './model'

export class SubmitError extends Error {
  constructor(
    message: string,
    readonly kind: 'doublon' | 'reseau' | 'config' | 'inconnu',
  ) {
    super(message)
  }
}

const PHOTO_MAX_SIDE = 1600

/** Réduit une photo trop lourde (connexions mobiles) en JPEG de 1600 px maximum. */
async function compressPhoto(file: File): Promise<Blob> {
  if (file.size < 900 * 1024) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }

async function upload(path: string, body: Blob) {
  const { error } = await supabase!.storage
    .from(BUCKET_INSCRIPTIONS)
    .upload(path, body, { contentType: body.type, upsert: false })
  if (error) throw new SubmitError('Le fichier n’a pas pu être envoyé. Vérifie ta connexion et réessaie.', 'reseau')
}

/** Dépose les fichiers puis enregistre la candidature. */
export async function submitCandidature(d: Draft, f: Files) {
  if (!supabase) throw new SubmitError('Le formulaire n’est pas configuré. Contacte l’équipe CFLB.', 'config')

  const id = crypto.randomUUID()
  let photoPath: string | null = null
  let cvPath: string | null = null

  if (f.photo) {
    const blob = await compressPhoto(f.photo)
    photoPath = `${id}/photo.${EXT[blob.type] ?? 'jpg'}`
    await upload(photoPath, blob)
  }
  if (f.cv) {
    cvPath = `${id}/cv.pdf`
    await upload(cvPath, f.cv)
  }

  // Pas de .select() : le public n'a pas le droit de relire la ligne
  const { error } = await supabase.from(TABLE_INSCRIPTIONS).insert({
    id,
    nom: d.nom.trim(),
    prenom: d.prenom.trim(),
    date_naissance: d.date_naissance,
    ville: d.ville.trim(),
    telephone_whatsapp: `${d.indicatif} ${d.telephone.replace(/\D/g, '')}`,
    email: d.email.trim().toLowerCase(),
    photo_url: photoPath,
    profession: d.profession.trim(),
    structure: d.structure.trim() || null,
    categorie: d.categorie,
    motivation: d.motivation.trim(),
    cv_url: cvPath,
    consent_image: d.consent_image,
    consent_reglement: d.consent_reglement,
    consent_exactitude: d.consent_exactitude,
  })

  if (error) {
    if (error.code === '23505') throw new SubmitError('Une candidature existe déjà avec cette adresse email.', 'doublon')
    if (error.message?.toLowerCase().includes('fetch')) {
      throw new SubmitError('Connexion impossible. Vérifie ta connexion et réessaie.', 'reseau')
    }
    throw new SubmitError('L’envoi a échoué. Réessaie dans un instant.', 'inconnu')
  }
}
