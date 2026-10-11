// Adapté du composant 21st.dev "robot-hero" (docs/prompt-hero) aux couleurs CFLB.
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { GlassButton } from '@/components/liquid-glass'

class HeartCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super()
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    t = t * Math.PI * 2
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    return optionalTarget.set(x * 0.002, (y + 6) * 0.002, 0)
  }
}

const sharedHeartCurve = new HeartCurve()

function ResponsiveGroup({ children, scale = 1 }: { children: ReactNode; scale?: number }) {
  const { viewport } = useThree()
  const s = Math.min(1.1, viewport.width / 3.5) * scale
  return <group scale={s}>{children}</group>
}

function GlassCapsule({ color, power, intensity }: { color: string; power: number; intensity: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      color: { value: new THREE.Color('#ffffff') },
      power: { value: 2.5 },
      intensity: { value: 0.6 },
    }),
    [],
  )

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.color.value.set(color)
      materialRef.current.uniforms.power.value = power
      materialRef.current.uniforms.intensity.value = intensity
    }
  })

  return (
    <mesh>
      <sphereGeometry args={[0.3, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          uniform float power;
          uniform float intensity;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
            fresnel = pow(fresnel, power);
            gl_FragColor = vec4(color, fresnel * intensity);
          }
        `}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

const earBaseMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.4, metalness: 0.6 })
const earRingMat = new THREE.MeshStandardMaterial({ color: '#d4af37', roughness: 0.25, metalness: 1 })
const earCenterMat = new THREE.MeshStandardMaterial({ color: '#0e0e0e', roughness: 0.8 })
const antennaBaseMat = new THREE.MeshStandardMaterial({ color: '#b8932a', roughness: 0.3, metalness: 1 })
const antennaStickMat = new THREE.MeshStandardMaterial({ color: '#d4af37', roughness: 0.3, metalness: 1 })
const antennaTipMat = new THREE.MeshStandardMaterial({ color: '#ffd700', roughness: 0.2, toneMapped: false })

function RobotEar({ position, scale = 1, isLeft = false }: { position: [number, number, number]; scale?: number; isLeft?: boolean }) {
  const dir = isLeft ? -1 : 1
  return (
    <group position={position} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={earBaseMat}>
        <cylinderGeometry args={[0.04, 0.04, 0.025, 32]} />
      </mesh>
      <mesh position={[dir * 0.012, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={earRingMat}>
        <torusGeometry args={[0.032, 0.008, 16, 32]} />
      </mesh>
      <mesh position={[dir * 0.012, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={earCenterMat}>
        <cylinderGeometry args={[0.03, 0.03, 0.005, 32]} />
      </mesh>
      <group position={[dir * 0.015, 0.035, 0]} rotation={[-0.4, 0, 0]}>
        <mesh position={[0, 0.01, 0]} castShadow receiveShadow material={antennaBaseMat}>
          <cylinderGeometry args={[0.006, 0.008, 0.02, 16]} />
        </mesh>
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow material={antennaStickMat}>
          <cylinderGeometry args={[0.003, 0.003, 0.1, 8]} />
        </mesh>
        <mesh position={[0, 0.11, 0]} castShadow receiveShadow material={antennaTipMat}>
          <sphereGeometry args={[0.006, 16, 16]} />
        </mesh>
      </group>
    </group>
  )
}

const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.8, 1.2), toneMapped: false, transparent: true })
const heartMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.6, 0.2), toneMapped: false })

function RobotEye({
  position,
  rotation,
  scale = 1,
  blinkDuration = 0.15,
  blinkCycle = 3.0,
  isLovedRef,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  scale?: number
  blinkDuration?: number
  blinkCycle?: number
  isLovedRef: RefObject<boolean>
}) {
  const groupRef = useRef<THREE.Group>(null)
  const normalEyesRef = useRef<THREE.Group>(null)
  const heartEyeRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current || !normalEyesRef.current || !heartEyeRef.current) return
    const isHeart = isLovedRef.current
    normalEyesRef.current.visible = !isHeart
    heartEyeRef.current.visible = isHeart

    const cycle = clock.getElapsedTime() % blinkCycle
    let targetScaleY = 1
    if (cycle < blinkDuration && !isHeart) {
      const blinkClose = Math.sin((cycle / blinkDuration) * Math.PI)
      targetScaleY = Math.max(0.05, 1.0 - blinkClose)
    }
    groupRef.current.scale.set(scale, scale * targetScaleY, scale)
  })

  const { topPath, bottomPath } = useMemo(() => {
    const w = 0.025
    const h = 0.035
    const r = 0.02
    const g = 0.005
    const V = (x: number, y: number) => new THREE.Vector3(x, y, 0)

    const build = (s: number) => {
      const p = new THREE.CurvePath<THREE.Vector3>()
      p.add(new THREE.LineCurve3(V(-w, s * g), V(-w, s * (h - r))))
      p.add(new THREE.QuadraticBezierCurve3(V(-w, s * (h - r)), V(-w, s * h), V(-w + r, s * h)))
      p.add(new THREE.LineCurve3(V(-w + r, s * h), V(w - r, s * h)))
      p.add(new THREE.QuadraticBezierCurve3(V(w - r, s * h), V(w, s * h), V(w, s * (h - r))))
      p.add(new THREE.LineCurve3(V(w, s * (h - r)), V(w, s * g)))
      return p
    }

    return { topPath: build(1), bottomPath: build(-1) }
  }, [])

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={heartEyeRef} visible={false} material={heartMat}>
        <tubeGeometry args={[sharedHeartCurve, 64, 0.0035, 8, true]} />
      </mesh>
      <group ref={normalEyesRef}>
        <mesh material={eyeMat}>
          <tubeGeometry args={[topPath, 20, 0.0035, 8, false]} />
        </mesh>
        <mesh material={eyeMat}>
          <tubeGeometry args={[bottomPath, 20, 0.0035, 8, false]} />
        </mesh>
      </group>
    </group>
  )
}

// Texture procédurale : léger grain métallique sur le châssis doré
function generatePbrTexturesAsync(): Promise<{ colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const size = 512
      const canvasC = document.createElement('canvas')
      const canvasB = document.createElement('canvas')
      canvasC.width = canvasB.width = size
      canvasC.height = canvasB.height = size
      const ctxC = canvasC.getContext('2d')
      const ctxB = canvasB.getContext('2d')

      if (ctxC && ctxB) {
        ctxC.fillStyle = '#ffffff'
        ctxC.fillRect(0, 0, size, size)
        ctxB.fillStyle = '#808080'
        ctxB.fillRect(0, 0, size, size)

        for (let i = 0; i < 8000; i++) {
          const x = Math.random() * size
          const y = Math.random() * size
          const r = 0.5 + Math.random() * 1.2
          const isDark = Math.random() > 0.2

          ctxC.beginPath()
          ctxC.arc(x, y, r, 0, Math.PI * 2)
          ctxC.fillStyle = isDark ? '#c9c9c9' : '#ffffff'
          ctxC.fill()

          ctxB.beginPath()
          ctxB.arc(x, y, r, 0, Math.PI * 2)
          ctxB.fillStyle = isDark ? '#000000' : '#ffffff'
          ctxB.fill()
        }
      }

      const texC = new THREE.CanvasTexture(canvasC)
      const texB = new THREE.CanvasTexture(canvasB)
      texC.colorSpace = THREE.SRGBColorSpace
      texC.wrapS = texB.wrapS = THREE.RepeatWrapping
      texC.wrapT = texB.wrapT = THREE.RepeatWrapping
      texC.repeat.set(6, 3)
      texB.repeat.set(6, 3)
      texC.needsUpdate = true
      texB.needsUpdate = true

      resolve({ colorMap: texC, bumpMap: texB })
    }, 0)
  })
}

const NECK = {
  baseR: 0.215,
  baseH: -0.05,
  midR: 0.28,
  midH: 0.02,
  lipBottomR: 0.295,
  lipBottomH: 0.045,
  lipTopR: 0.27,
  lipTopH: 0.055,
  innerR: 0.1,
  innerDropH: 0.0,
}
const BODY = { bodyBevelR: 0.235, bodyBevelY: 0.34, bodyBevelT: 0.025 }

function RobotPrototype({
  color,
  screenColor,
  screenGlow,
  blinkCycle,
  metalness,
  roughness,
}: {
  color: string
  screenColor: string
  screenGlow: number
  blinkCycle: number
  metalness: number
  roughness: number
}) {
  const isLovedRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const [textures, setTextures] = useState<{ colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null>(null)

  const config = {
    moveSpeed: 0.35,
    bodyRotSpeed: 10.0,
    headRotSpeed: 20.0,
    bodyTiltY: 0.95,
    headLookX: 0.3,
    headLookY: 1.8,
  }

  useFrame((state, delta) => {
    if (!bodyRef.current || !headRef.current) return
    const dt = Math.min(delta, 0.1)
    const t = state.clock.getElapsedTime()

    // Léger mouvement de veille pour rester vivant sur mobile, sans curseur
    const tx = state.pointer.x + Math.sin(t * 0.6) * 0.08
    const ty = state.pointer.y + Math.sin(t * 0.9) * 0.05

    const targetPosX = tx * (state.viewport.width / 3.5)
    bodyRef.current.position.x = THREE.MathUtils.lerp(bodyRef.current.position.x, targetPosX, config.moveSpeed * dt)
    bodyRef.current.position.y = -0.3 + Math.sin(t * 1.4) * 0.015

    const relativeX = tx - bodyRef.current.position.x / 2.5
    const lerp = THREE.MathUtils.lerp
    bodyRef.current.rotation.y = lerp(bodyRef.current.rotation.y, -relativeX * config.bodyTiltY, config.bodyRotSpeed * dt)
    bodyRef.current.rotation.x = lerp(bodyRef.current.rotation.x, -ty * 0.25, config.bodyRotSpeed * dt)
    bodyRef.current.rotation.z = lerp(bodyRef.current.rotation.z, -relativeX * 0.15, config.bodyRotSpeed * dt)

    headRef.current.rotation.y = lerp(headRef.current.rotation.y, relativeX * config.headLookY, config.headRotSpeed * dt)
    headRef.current.rotation.x = lerp(headRef.current.rotation.x, -ty * config.headLookX, config.headRotSpeed * dt)
  })

  useEffect(() => {
    let mounted = true
    let generated: { colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null
    generatePbrTexturesAsync().then((res) => {
      if (mounted) {
        generated = res
        setTextures(res)
      } else {
        res.colorMap.dispose()
        res.bumpMap.dispose()
      }
    })
    return () => {
      mounted = false
      generated?.colorMap.dispose()
      generated?.bumpMap.dispose()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      document.body.style.cursor = 'auto'
    }
  }, [])

  // Un clic sur le robot : ses yeux deviennent des coeurs pendant 2 secondes
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    isLovedRef.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      isLovedRef.current = false
    }, 2000)
  }

  const neckProfile = useMemo(
    () => [
      new THREE.Vector2(NECK.innerR, NECK.baseH),
      new THREE.Vector2(NECK.baseR, NECK.baseH),
      new THREE.Vector2(NECK.midR, NECK.midH),
      new THREE.Vector2(NECK.lipBottomR, NECK.lipBottomH),
      new THREE.Vector2(NECK.lipTopR, NECK.lipTopH),
      new THREE.Vector2(NECK.innerR, NECK.lipTopH),
      new THREE.Vector2(NECK.innerR, NECK.lipTopH - NECK.innerDropH),
    ],
    [],
  )

  const headMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.35, metalness: 0.4 }), [])

  if (!textures) return null

  const chassis = (
    <meshStandardMaterial
      color={color}
      map={textures.colorMap}
      bumpMap={textures.bumpMap}
      bumpScale={0.004}
      roughness={roughness}
      metalness={metalness}
      envMapIntensity={1.2}
    />
  )

  return (
    <group
      ref={bodyRef}
      position={[0, -0.3, 0]}
      onPointerDown={handlePointerDown}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.43, 64, 64, 0, Math.PI * 2, Math.PI * 0.15, Math.PI * 0.85]} />
        {chassis}
      </mesh>

      <mesh position={[0, BODY.bodyBevelY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[BODY.bodyBevelR, BODY.bodyBevelT, 32, 64]} />
        {chassis}
      </mesh>

      <mesh position={[0, 0.38, 0]} receiveShadow castShadow>
        <latheGeometry args={[neckProfile, 64]} />
        {chassis}
      </mesh>

      <group ref={headRef} position={[0, 0.6, 0]}>
        <mesh material={headMat} castShadow receiveShadow>
          <sphereGeometry args={[0.28, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
        </mesh>

        <GlassCapsule color={screenColor} power={3.8} intensity={screenGlow} />

        <group position={[0, -0.02, 0.29]}>
          <RobotEye position={[-0.07, 0, 0]} rotation={[0, -0.2, 0]} scale={1.1} blinkDuration={0.45} blinkCycle={blinkCycle} isLovedRef={isLovedRef} />
          <RobotEye position={[0.07, 0, 0]} rotation={[0, 0.2, 0]} scale={1.1} blinkDuration={0.45} blinkCycle={blinkCycle} isLovedRef={isLovedRef} />
        </group>

        <RobotEar position={[-0.29, 0, 0]} isLeft scale={1.3} />
        <RobotEar position={[0.29, 0, 0]} scale={1.3} />
      </group>
    </group>
  )
}

export interface RobotHeroProps {
  eyebrow?: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  /** Met la scène 3D en pause (quand le voile recouvre le hero). */
  paused?: boolean
  color?: string
  scale?: number
  screenColor?: string
  screenGlow?: number
  blinkCycle?: number
  metalness?: number
  roughness?: number
}

export function RobotHero({
  eyebrow = 'Édition 2027',
  title = 'Conférence des Femmes Leaders du Bénin',
  subtitle = 'Femmes d’Impact : Leadership, Innovation et Gouvernance au service du Bénin de demain',
  ctaText = 'Déposer ma candidature',
  ctaHref = '/postuler',
  paused = false,
  color = '#d4af37',
  scale = 1,
  screenColor = '#ffd700',
  screenGlow = 1.2,
  blinkCycle = 3.0,
  metalness = 0.85,
  roughness = 0.38,
}: RobotHeroProps) {
  return (
    <section
      data-glass-backdrop
      className="relative flex h-dvh min-h-[540px] w-full flex-col overflow-hidden lg:justify-end"
      style={{ background: 'radial-gradient(ellipse at 50% 45%, #fffdf8 0%, #f4ecdd 42%, #e3d2b2 100%)' }}
    >
      {/*
        Zone du robot. Sur mobile et tablette elle occupe l'espace entre le logo
        et le texte (le robot ne chevauche jamais le titre). Sur ordinateur elle
        couvre tout le hero.
      */}
      <div className="relative mt-24 min-h-[200px] flex-1 lg:absolute lg:inset-0 lg:mt-0">
        {/* Grand titre de fond : police Georgia validée */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <h2
            aria-hidden
            className="flex select-none flex-col items-center whitespace-nowrap font-hero font-black text-or-fonce lg:translate-y-[30px]"
            style={{ opacity: 0.16, letterSpacing: '-0.04em', lineHeight: 0.92 }}
          >
            <span style={{ fontSize: 'clamp(2rem, 7.5vw, 8.5rem)' }}>CFLB 2027</span>
            <span style={{ fontSize: 'clamp(3rem, 13.5vw, 15rem)' }}>ROBOT PITCH</span>
          </h2>
        </div>

        {/* data-glass-live : le verre des boutons réfracte cette scène en direct */}
        <div data-glass-live className="absolute inset-0 z-10">
          <Canvas
            shadows
            dpr={[1, 2]}
            frameloop={paused ? 'never' : 'always'}
            gl={{ preserveDrawingBuffer: true }}
            camera={{ position: [0, 0.2, 6], fov: 40 }}
          >
            <ambientLight intensity={0.55} />
            <directionalLight position={[2, 5, 4]} intensity={1.5} color="#fff3d1" castShadow shadow-mapSize={[1024, 1024]} />
            <directionalLight position={[-4, 2, -4]} intensity={0.6} color="#d4af37" />

            {/* Éclairage studio généré localement : aucune dépendance réseau */}
            <Environment resolution={256}>
              <Lightformer form="rect" intensity={3} color="#fff6e0" position={[0, 4, 3]} scale={[6, 2, 1]} />
              <Lightformer form="rect" intensity={1.5} color="#ffd98a" position={[-4, 1, 2]} rotation-y={Math.PI / 3} scale={[3, 4, 1]} />
              <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[4, 1, 2]} rotation-y={-Math.PI / 3} scale={[3, 4, 1]} />
              <Lightformer form="ring" intensity={2} color="#d4af37" position={[0, 0, -5]} scale={4} />
            </Environment>

            <ResponsiveGroup scale={scale}>
              <ContactShadows position={[0, -0.79, 0]} opacity={0.55} scale={15} resolution={1024} blur={2.2} far={2.5} color="#5a4410" />
              <RobotPrototype
                color={color}
                screenColor={screenColor}
                screenGlow={screenGlow}
                blinkCycle={blinkCycle}
                metalness={metalness}
                roughness={roughness}
              />
            </ResponsiveGroup>
          </Canvas>
        </div>
      </div>

      {/* Texte : sous lg, marge basse pour rester au-dessus de la bulle de menu */}
      <div className="pointer-events-none relative z-20 mx-auto w-full max-w-[1400px] px-5 pb-24 pt-2 sm:px-8 lg:pb-14">
        <div className="flex flex-col items-center gap-4 text-center lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-end lg:gap-8 lg:text-left">
          <div>
            <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-or-fonce">{eyebrow}</p>
            <h1 className="mx-auto mt-2 max-w-xl font-display text-[2rem] leading-[1.02] text-charcoal sm:text-5xl lg:mx-0 lg:mt-3">
              {title}
            </h1>
          </div>
          <div className="pointer-events-auto order-last lg:order-none">
            <GlassButton href={ctaHref} variant="or" size="lg">
              {ctaText}
            </GlassButton>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-encre-douce lg:justify-self-end lg:text-right">{subtitle}</p>
        </div>
      </div>
    </section>
  )
}

export default RobotHero
