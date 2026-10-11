import html2canvas from 'html2canvas-pro'
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shader'

/*
 * Moteur partagé du verre liquide.
 *
 * - Un seul contexte WebGL pour tous les boutons (les navigateurs limitent
 *   le nombre de contextes, et le robot 3D en utilise déjà un).
 * - Chaque zone "[data-glass-backdrop]" est capturée une fois avec html2canvas
 *   (recapturée au redimensionnement). Derrière un bouton, on recompose toutes
 *   les zones qui le croisent, à leur position actuelle : un bouton fixe
 *   (navbar) réfracte donc ce qui défile sous lui.
 * - Les éléments "[data-glass-live]" (canvas du robot, vidéos) sont recopiés
 *   à chaque image par-dessus leur zone : le verre réfracte l'animation.
 * - Les éléments "[data-reveal]" sont capturés dans leur état final, même
 *   s'ils ne sont pas encore apparus à l'écran.
 */

export type GlassShape = 'rounded' | 'circle' | 'pill'

export interface GlassParams {
  shape: GlassShape
  borderRadius: number
  tintTop: [number, number, number]
  tintBottom: [number, number, number]
  tintOpacity: number
  blurRadius: number
  edgeIntensity: number
  rimIntensity: number
  baseIntensity: number
  edgeDistance: number
  rimDistance: number
  baseDistance: number
  cornerBoost: number
  rippleEffect: number
  warp: boolean
}

export interface GlassInstance {
  element: HTMLElement
  canvas: HTMLCanvasElement
  params: () => GlassParams
  onReady: () => void
  visible: boolean
  ready: boolean
  usesLive: boolean
}

const REGION_SCALE = 0.5
const MAX_RENDER_SCALE = 1.5
const PAGE_BACKGROUND = '#f8f5f2'

const IGNORE_SELECTOR = '[data-glass], [data-glass-live], [data-glass-ignore]'

// Captures des zones
const snapshots = new Map<HTMLElement, HTMLCanvasElement>()
const pending = new Map<HTMLElement, Promise<void>>()
const queue: HTMLElement[] = []
let capturing = false

function revealForCapture(doc: Document) {
  doc.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    el.style.opacity = '1'
    el.style.transform = 'none'
    el.style.filter = 'none'
  })
}

// Les captures sont faites une par une pour ne pas bloquer le défilement
function pump() {
  if (capturing) return
  const backdrop = queue.shift()
  if (!backdrop) return
  if (!backdrop.isConnected) {
    pending.delete(backdrop)
    pump()
    return
  }
  capturing = true
  document.fonts.ready
    .then(() =>
      html2canvas(backdrop, {
        scale: 1,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        ignoreElements: (node) => node instanceof Element && node.matches(IGNORE_SELECTOR),
        onclone: revealForCapture,
      }),
    )
    .then((canvas) => {
      snapshots.set(backdrop, canvas)
      markAllDirty()
    })
    .catch((err) => console.warn('[liquid-glass] capture impossible, repli CSS conservé', err))
    .finally(() => {
      pending.delete(backdrop)
      capturing = false
      requestIdle(pump)
    })
}

function requestIdle(fn: () => void) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 500 })
  else setTimeout(fn, 50)
}

function captureBackdrop(backdrop: HTMLElement) {
  if (pending.has(backdrop)) return
  pending.set(backdrop, Promise.resolve())
  queue.push(backdrop)
  requestIdle(pump)
}

function allBackdrops() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-glass-backdrop]'))
}

/** Capture (ou recapture) toutes les zones de la page. */
export function refreshGlassBackdrops() {
  snapshots.forEach((_, b) => !b.isConnected && snapshots.delete(b))
  allBackdrops().forEach(captureBackdrop)
}

let resizeTimer: number | undefined
function onResize() {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(refreshGlassBackdrops, 300)
}

// Contexte WebGL partagé
interface GLState {
  gl: WebGLRenderingContext
  canvas: HTMLCanvasElement
  texture: WebGLTexture
  loc: Record<string, WebGLUniformLocation | null>
}
let glState: GLState | null | undefined

function initGL(): GLState | null {
  if (glState !== undefined) return glState
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false })
  if (!gl) return (glState = null)

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[liquid-glass] shader', gl.getShaderInfoLog(s))
      return null
    }
    return s
  }
  const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  if (!vs || !fs) return (glState = null)

  const program = gl.createProgram()!
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('[liquid-glass] programme', gl.getProgramInfoLog(program))
    return (glState = null)
  }
  gl.useProgram(program)

  const bind = (name: string, data: number[]) => {
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    const at = gl.getAttribLocation(program, name)
    gl.enableVertexAttribArray(at)
    gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0)
  }
  bind('a_position', [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
  bind('a_texcoord', [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0])

  const texture = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const names = [
    'u_image', 'u_resolution', 'u_regionSize', 'u_margin', 'u_refScale', 'u_borderRadius', 'u_shape',
    'u_blurRadius', 'u_warp', 'u_edgeIntensity', 'u_rimIntensity', 'u_baseIntensity', 'u_edgeDistance',
    'u_rimDistance', 'u_baseDistance', 'u_cornerBoost', 'u_rippleEffect', 'u_tintOpacity', 'u_tintTop', 'u_tintBottom',
  ]
  const loc: GLState['loc'] = {}
  for (const n of names) loc[n] = gl.getUniformLocation(program, n)

  gl.uniform1i(loc.u_image, 0)
  gl.clearColor(0, 0, 0, 0)

  return (glState = { gl, canvas, texture, loc })
}

// Zone composée derrière un bouton
const region = document.createElement('canvas')
const regionCtx = region.getContext('2d')!

const intersects = (a: DOMRect, x: number, y: number, w: number, h: number) =>
  a.right > x && a.left < x + w && a.bottom > y && a.top < y + h

function drawLive(el: HTMLCanvasElement | HTMLVideoElement, x: number, y: number, w: number, h: number) {
  const r = el.getBoundingClientRect()
  if (!r.width || !r.height || !intersects(r, x, y, w, h)) return false

  if (el instanceof HTMLCanvasElement) {
    const kx = el.width / r.width
    const ky = el.height / r.height
    regionCtx.drawImage(el, (x - r.left) * kx, (y - r.top) * ky, w * kx, h * ky, 0, 0, w, h)
    return true
  }

  // Vidéo en object-fit: cover, avec ses filtres CSS (noir et blanc, opacité, fusion)
  if (el.readyState < 2 || !el.videoWidth) return true
  const css = getComputedStyle(el)
  const s = Math.max(r.width / el.videoWidth, r.height / el.videoHeight)
  const ox = (r.width - el.videoWidth * s) / 2
  const oy = (r.height - el.videoHeight * s) / 2
  regionCtx.save()
  regionCtx.globalAlpha = parseFloat(css.opacity) || 1
  if (css.filter && css.filter !== 'none') regionCtx.filter = css.filter
  if (css.mixBlendMode === 'multiply') regionCtx.globalCompositeOperation = 'multiply'
  regionCtx.drawImage(el, (x - r.left - ox) / s, (y - r.top - oy) / s, w / s, h / s, 0, 0, w, h)
  regionCtx.restore()
  return true
}

/**
 * Recompose l'arrière-plan d'un bouton, marges comprises (en px CSS).
 * La zone est dessinée en résolution réduite : le verre la floute de toute façon.
 * Renvoie null si une capture manque encore.
 */
function composeRegion(rect: DOMRect, mx: number, my: number): { live: boolean; w: number; h: number } | null {
  const w = Math.ceil(rect.width + mx * 2)
  const h = Math.ceil(rect.height + my * 2)
  const x = rect.left - mx
  const y = rect.top - my
  const cw = Math.ceil(w * REGION_SCALE)
  const ch = Math.ceil(h * REGION_SCALE)
  if (region.width !== cw || region.height !== ch) {
    region.width = cw
    region.height = ch
  }
  regionCtx.setTransform(REGION_SCALE, 0, 0, REGION_SCALE, 0, 0)
  regionCtx.fillStyle = PAGE_BACKGROUND
  regionCtx.fillRect(0, 0, w, h)

  let live = false
  for (const b of allBackdrops()) {
    const bRect = b.getBoundingClientRect()
    if (!bRect.width || !bRect.height || !intersects(bRect, x, y, w, h)) continue
    const snap = snapshots.get(b)
    if (!snap) {
      captureBackdrop(b)
      return null
    }
    // Les rapports k absorbent une éventuelle mise à l'échelle CSS de la zone
    const kx = snap.width / bRect.width
    const ky = snap.height / bRect.height
    regionCtx.drawImage(snap, (x - bRect.left) * kx, (y - bRect.top) * ky, w * kx, h * ky, 0, 0, w, h)

    b.querySelectorAll<HTMLCanvasElement | HTMLVideoElement>('[data-glass-live] canvas, [data-glass-live] video').forEach((el) => {
      if (drawLive(el, x, y, w, h)) live = true
    })
  }
  return { live, w, h }
}

/** Amplitude maximale de la réfraction, pour dimensionner les marges. */
function refractionReach(p: GlassParams) {
  return p.edgeIntensity + p.rimIntensity + p.cornerBoost + p.rippleEffect + (p.warp ? p.baseIntensity : 0)
}

function renderInstance(inst: GlassInstance) {
  const state = initGL()
  if (!state) return
  const rect = inst.element.getBoundingClientRect()
  if (rect.width < 1 || rect.height < 1) return
  const p = inst.params()
  const reach = refractionReach(p)
  const mx = Math.ceil(reach * window.innerWidth) + 16
  const my = Math.ceil(reach * window.innerHeight) + 16
  const composed = composeRegion(rect, mx, my)
  if (!composed) return
  inst.usesLive = composed.live

  const { gl, canvas, texture, loc } = state
  const scale = Math.min(window.devicePixelRatio || 1, MAX_RENDER_SCALE)
  const pw = Math.ceil(rect.width * scale)
  const ph = Math.ceil(rect.height * scale)
  if (canvas.width < pw || canvas.height < ph) {
    canvas.width = Math.max(canvas.width, pw)
    canvas.height = Math.max(canvas.height, ph)
  }

  const radius =
    p.shape === 'pill' ? rect.height / 2 : p.shape === 'circle' ? Math.min(rect.width, rect.height) / 2 : p.borderRadius

  gl.viewport(0, 0, pw, ph)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, region)

  gl.uniform2f(loc.u_resolution, rect.width, rect.height)
  gl.uniform2f(loc.u_regionSize, composed.w, composed.h)
  gl.uniform2f(loc.u_margin, mx, my)
  // Comme l'original, la réfraction est proportionnelle à la taille de l'écran
  gl.uniform2f(loc.u_refScale, window.innerWidth, window.innerHeight)
  gl.uniform1f(loc.u_borderRadius, radius)
  gl.uniform1i(loc.u_shape, p.shape === 'pill' ? 2 : p.shape === 'circle' ? 1 : 0)
  gl.uniform1f(loc.u_blurRadius, p.blurRadius)
  gl.uniform1f(loc.u_warp, p.warp ? 1 : 0)
  gl.uniform1f(loc.u_edgeIntensity, p.edgeIntensity)
  gl.uniform1f(loc.u_rimIntensity, p.rimIntensity)
  gl.uniform1f(loc.u_baseIntensity, p.baseIntensity)
  gl.uniform1f(loc.u_edgeDistance, p.edgeDistance)
  gl.uniform1f(loc.u_rimDistance, p.rimDistance)
  gl.uniform1f(loc.u_baseDistance, p.baseDistance)
  gl.uniform1f(loc.u_cornerBoost, p.cornerBoost)
  gl.uniform1f(loc.u_rippleEffect, p.rippleEffect)
  gl.uniform1f(loc.u_tintOpacity, p.tintOpacity)
  gl.uniform3fv(loc.u_tintTop, p.tintTop)
  gl.uniform3fv(loc.u_tintBottom, p.tintBottom)
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  const target = inst.canvas
  if (target.width !== pw || target.height !== ph) {
    target.width = pw
    target.height = ph
  }
  const ctx = target.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, pw, ph)
  ctx.drawImage(canvas, 0, canvas.height - ph, pw, ph, 0, 0, pw, ph)

  if (!inst.ready) {
    inst.ready = true
    inst.onReady()
  }
}

// Boucle de rendu commune
const instances = new Set<GlassInstance>()
let dirty = true
let rafId = 0
let observer: IntersectionObserver | null = null

function markAllDirty() {
  dirty = true
}

function loop() {
  rafId = requestAnimationFrame(loop)
  const all = dirty
  dirty = false
  instances.forEach((inst) => {
    if (!inst.visible) return
    if (all || inst.usesLive || !inst.ready) renderInstance(inst)
  })
}

export function registerGlass(inst: GlassInstance) {
  if (!initGL()) return () => {}

  if (instances.size === 0) {
    window.addEventListener('scroll', markAllDirty, { passive: true })
    window.addEventListener('resize', onResize)
    observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        instances.forEach((i) => {
          if (i.element === e.target) i.visible = e.isIntersecting
        })
      })
      markAllDirty()
    })
    rafId = requestAnimationFrame(loop)
    // Capture anticipée de toutes les zones une fois la page posée
    window.setTimeout(refreshGlassBackdrops, 400)
  }

  instances.add(inst)
  observer?.observe(inst.element)
  markAllDirty()

  return () => {
    instances.delete(inst)
    observer?.unobserve(inst.element)
    queueMicrotask(() => snapshots.forEach((_, b) => !b.isConnected && snapshots.delete(b)))
    if (instances.size === 0) {
      cancelAnimationFrame(rafId)
      observer?.disconnect()
      observer = null
      window.removeEventListener('scroll', markAllDirty)
      window.removeEventListener('resize', onResize)
    }
  }
}

export function invalidateGlass() {
  markAllDirty()
}
