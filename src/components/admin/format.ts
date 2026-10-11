import type { Statut } from '@/lib/adminApi'

export const STATUT_LABEL: Record<Statut, string> = {
  en_attente: 'En attente',
  acceptee: 'Acceptée',
  refusee: 'Refusée',
}

export const STATUT_DOT: Record<Statut, string> = {
  en_attente: 'bg-or',
  acceptee: 'bg-[#4c8a59]',
  refusee: 'bg-[#b8483c]',
}

const dateCourte = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const dateLongue = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const heure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : dateCourte.format(d)
}

export function formatDateHeure(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : `${dateLongue.format(d)} à ${heure.format(d)}`
}

/** Date de naissance "AAAA-MM-JJ" en toutes lettres, sans décalage de fuseau. */
export function formatNaissance(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  return y && m && d ? dateLongue.format(new Date(y, m - 1, d)) : ymd
}

export function ageFrom(ymd: string): number | null {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return null
  const now = new Date()
  const age = now.getFullYear() - y - (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d) ? 1 : 0)
  return age >= 0 && age < 130 ? age : null
}

/**
 * Lien WhatsApp (https://wa.me/<numéro international sans +>).
 * Les numéros béninois sont complétés : indicatif 229 s'il manque, et préfixe 01
 * pour l'ancien format à 8 chiffres (passage aux numéros à 10 chiffres en 2024).
 */
export function whatsappLink(phone: string): string | null {
  const trimmed = phone.trim()
  let digits = trimmed.replace(/\D/g, '')
  if (!trimmed.startsWith('+')) {
    if (digits.startsWith('00')) digits = digits.slice(2)
    else if (digits.length === 10 && digits.startsWith('01')) digits = `229${digits}`
    else if (digits.length === 8) digits = `229${digits}`
  }
  if (digits.length === 11 && digits.startsWith('229')) digits = `22901${digits.slice(3)}`
  return digits.length >= 8 ? `https://wa.me/${digits}` : null
}

export function initiales(prenom: string, nom: string): string {
  return `${prenom.trim().charAt(0)}${nom.trim().charAt(0)}`.toUpperCase()
}
