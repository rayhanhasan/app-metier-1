import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { sim, useUi, type Shot } from '../store'
import { LOT, ROUNDABOUT, SCHOOL } from '../world'

type View = { pos: [number, number, number]; target: [number, number, number] }

const sx = (SCHOOL.x0 + SCHOOL.x1) / 2

export const VIEWS: Record<Exclude<Shot, 'free' | 'chase'>, View> = {
  hero: { pos: [44, 30, 52], target: [3, 1.5, -9] },
  front: { pos: [sx + 9, 3.1, 6.5], target: [sx - 1.5, 1.9, -13] },
  lot: { pos: [LOT.x1 + 9, 13, 6], target: [(LOT.x0 + LOT.x1) / 2 - 2, 0.8, -15] },
  cafe: { pos: [-22, 4.2, 5.5], target: [-37, 1.4, -8] },
  roundabout: { pos: [ROUNDABOUT.x + 30, 26, 34], target: [ROUNDABOUT.x - 4, 0, -2] },
  top: { pos: [8, 92, 24], target: [6, 0, -6] },
}

const CINEMA: Shot[] = ['hero', 'front', 'chase', 'lot', 'cafe', 'roundabout']
const frozen = new URLSearchParams(location.search).has('still')

export function CameraRig() {
  const ref = useRef<CameraControls>(null)
  const shot = useUi((s) => s.shot)
  const selected = useUi((s) => s.selected)
  const cinema = useUi((s) => s.cinema)
  const started = useRef(false)

  // plans fixes
  useEffect(() => {
    const c = ref.current
    if (!c || shot === 'free' || shot === 'chase') return
    const v = VIEWS[shot]
    c.setLookAt(...v.pos, ...v.target, started.current && !frozen)
    started.current = true
  }, [shot])

  // mode cinéma : enchaîne les plans
  useEffect(() => {
    if (!cinema) return
    let i = 0
    const next = () => {
      const s = CINEMA[i % CINEMA.length]
      i++
      if (s === 'chase') {
        const cars = sim.vehicles.filter((v) => v.school && v.school.state === 'lesson')
        useUi.setState({ shot: 'chase', selected: cars[0]?.id ?? sim.vehicles[0].id })
      } else useUi.setState({ shot: s, selected: null })
    }
    next()
    const id = setInterval(next, 11000)
    return () => clearInterval(id)
  }, [cinema])

  useFrame((_, dt) => {
    const c = ref.current
    if (!c) return
    if (shot === 'chase') {
      const v = sim.vehicles.find((x) => x.id === selected) ?? sim.vehicles.find((x) => x.school?.state === 'lesson')
      if (v) {
        // caméra de poursuite : derrière et au-dessus de la voiture, côté extérieur
        const back = 9.5
        const px = v.x - Math.sin(v.heading) * back + Math.cos(v.heading) * 3.2
        const pz = v.z - Math.cos(v.heading) * back - Math.sin(v.heading) * 3.2
        c.setLookAt(px, 4.6, pz, v.x + Math.sin(v.heading) * 2.5, 1.0, v.z + Math.cos(v.heading) * 2.5, !frozen)
      }
    } else if (cinema && !frozen) {
      c.rotate(dt * 0.018, 0, false)
    }
  })

  return <CameraControls ref={ref} makeDefault minDistance={4} maxDistance={190} maxPolarAngle={1.5} smoothTime={0.9} draggingSmoothTime={0.15} />
}
