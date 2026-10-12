import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Pages publiques à référencer (l'administration n'y figure jamais)
const PAGES_PUBLIQUES = [
  { chemin: '/', priorite: '1.0', frequence: 'weekly' },
  { chemin: '/postuler', priorite: '0.9', frequence: 'monthly' },
  { chemin: '/confidentialite', priorite: '0.3', frequence: 'yearly' },
]

/*
 * Référencement : remplace __SITE_URL__ dans index.html par l'adresse du site
 * (variable VITE_SITE_URL, sinon l'adresse Vercel par défaut) et génère
 * robots.txt et sitemap.xml à la compilation.
 */
function referencement(siteUrl: string): Plugin {
  return {
    name: 'cflb-referencement',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    generateBundle() {
      const aujourdhui = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      })
      const urls = PAGES_PUBLIQUES.map(
        (p) =>
          `  <url>\n    <loc>${siteUrl}${p.chemin}</loc>\n    <lastmod>${aujourdhui}</lastmod>\n    <changefreq>${p.frequence}</changefreq>\n    <priority>${p.priorite}</priority>\n  </url>`,
      ).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'https://cflb-2027.vercel.app').replace(/\/+$/, '')

  return {
    plugins: [react(), tailwindcss(), referencement(siteUrl)],
    // Accès au serveur de développement via un tunnel Cloudflare (test sur téléphone)
    server: {
      allowedHosts: ['.trycloudflare.com'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
