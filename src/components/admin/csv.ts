import type { Inscription } from '@/lib/adminApi'
import { STATUT_LABEL } from './format'

/*
 * Export CSV généré dans le navigateur, pensé pour Excel : séparateur ";",
 * BOM UTF-8, fins de ligne CRLF, dates à l'heure du Bénin.
 */

const TIME_ZONE = 'Africa/Porto-Novo'
const dateHeure = new Intl.DateTimeFormat('fr-FR', { timeZone: TIME_ZONE, dateStyle: 'short', timeStyle: 'short' })
const jourIso = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE })

const formatDateHeure = (iso: string | null) => (iso ? dateHeure.format(new Date(iso)) : '')
const formatJour = (ymd: string) => ymd.split('-').reverse().join('/')
const ouiNon = (v: boolean) => (v ? 'Oui' : 'Non')

function age(naissance: string, aujourdhui: string): number | '' {
  const [by, bm, bd] = naissance.split('-').map(Number)
  const [ty, tm, td] = aujourdhui.split('-').map(Number)
  if (!by || !ty) return ''
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0)
}

// Cellule : formules neutralisées (injection CSV), puis protection de ; " et retours à la ligne
function cell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[";\r\n]/.test(text) || text !== text.trim() ? `"${text.replace(/"/g, '""')}"` : text
}

// Téléphone forcé en texte : Excel garde le "+" et les zéros de tête
function cellTelephone(value: string): string {
  const text = value.trim()
  return /^\+?[\d\s().]+$/.test(text) ? `"=""${text}"""` : cell(text)
}

const COLONNES: [string, (r: Inscription, aujourdhui: string) => string][] = [
  ['Date de dépôt', (r) => cell(formatDateHeure(r.created_at))],
  ['Statut', (r) => cell(STATUT_LABEL[r.statut] ?? r.statut)],
  ['Prénom', (r) => cell(r.prenom)],
  ['Nom', (r) => cell(r.nom)],
  ['Date de naissance', (r) => cell(formatJour(r.date_naissance))],
  ['Âge', (r, a) => cell(age(r.date_naissance, a))],
  ['Ville', (r) => cell(r.ville)],
  ['Téléphone WhatsApp', (r) => cellTelephone(r.telephone_whatsapp)],
  ['Email', (r) => cell(r.email)],
  ['Profession', (r) => cell(r.profession)],
  ['Structure', (r) => cell(r.structure)],
  ['Catégorie', (r) => cell(r.categorie)],
  ['Motivation', (r) => cell(r.motivation)],
  ['Photo fournie', (r) => cell(ouiNon(Boolean(r.photo_url)))],
  ['Droit à l’image', (r) => cell(ouiNon(r.consent_image))],
  ['Règlement accepté', (r) => cell(ouiNon(r.consent_reglement))],
  ['Exactitude certifiée', (r) => cell(ouiNon(r.consent_exactitude))],
  ['Date d’examen', (r) => cell(formatDateHeure(r.reviewed_at))],
  ['Identifiant', (r) => cell(r.id)],
]

export function construireCsv(rows: Inscription[], maintenant = new Date()): string {
  const aujourdhui = jourIso.format(maintenant)
  const lignes = [
    COLONNES.map(([titre]) => cell(titre)).join(';'),
    ...rows.map((row) => COLONNES.map(([, lire]) => lire(row, aujourdhui)).join(';')),
  ]
  return `﻿${lignes.join('\r\n')}\r\n`
}

export function telechargerCsv(rows: Inscription[]) {
  const nom = `cflb-2027-inscriptions-${jourIso.format(new Date())}.csv`
  const url = URL.createObjectURL(new Blob([construireCsv(rows)], { type: 'text/csv;charset=utf-8' }))
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nom
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
