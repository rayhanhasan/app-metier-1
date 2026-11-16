import { Camera, Clapperboard, Moon, Sun, Sunset, Tag, X } from 'lucide-react'
import { useUi, type CarRow, type Shot, type TimeOfDay } from '../store'
import { BRAND } from '../world'
import { tagEls } from '../three/Tags'

const STATE: Record<CarRow['state'], { label: string; dot: string }> = {
  parked: { label: 'Au parking', dot: '#94a3b8' },
  reversing: { label: 'Manœuvre', dot: '#f59e0b' },
  exiting: { label: 'Départ', dot: '#f59e0b' },
  lesson: { label: 'En leçon', dot: '#22c55e' },
  returning: { label: 'Se gare', dot: '#38bdf8' },
}

const TODS: { id: TimeOfDay; label: string; icon: typeof Sun }[] = [
  { id: 'day', label: 'Jour', icon: Sun },
  { id: 'golden', label: 'Fin de journée', icon: Sunset },
  { id: 'night', label: 'Nuit', icon: Moon },
]

const SHOTS: { id: Shot; label: string }[] = [
  { id: 'hero', label: 'Quartier' },
  { id: 'front', label: 'Vitrine' },
  { id: 'lot', label: 'Parking' },
  { id: 'cafe', label: 'Café' },
  { id: 'roundabout', label: 'Giratoire' },
  { id: 'top', label: 'Plan' },
]

function CarTags() {
  const rows = useUi((s) => s.rows)
  const labels = useUi((s) => s.labels)
  const selected = useUi((s) => s.selected)
  const select = useUi((s) => s.select)
  if (!labels) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {rows.map((r) => (
        <button
          key={r.id}
          ref={(el) => {
            if (el) tagEls.set(r.id, el)
            else tagEls.delete(r.id)
          }}
          onClick={() => select(r.id)}
          style={{ visibility: 'hidden' }}
          className={`tag pointer-events-auto absolute left-0 top-0 ${selected === r.id ? 'tag-on' : ''}`}
        >
          <span className="tag-n">{r.n}</span>
          <span className="tag-txt">
            {r.state === 'parked' ? 'Au parking' : `${r.instructor.split(' ')[0]} · ${r.student.split(' ')[0]}`}
            {r.state !== 'parked' && <i>{r.kmh} km/h</i>}
          </span>
        </button>
      ))}
    </div>
  )
}

function Fleet() {
  const rows = useUi((s) => s.rows)
  const selected = useUi((s) => s.selected)
  const select = useUi((s) => s.select)
  return (
    <div className="hud-card w-[300px]">
      <div className="hud-title">Flotte · {rows.filter((r) => r.state === 'lesson').length} en leçon</div>
      {rows.map((r) => (
        <button key={r.id} onClick={() => select(selected === r.id ? null : r.id)} className={`fleet-row ${selected === r.id ? 'fleet-on' : ''}`}>
          <span className="fleet-n">{r.n}</span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[13px] font-semibold text-white">
              {r.instructor} <span className="font-normal text-white/60">avec</span> {r.student.split(' ')[0]}
            </span>
            <span className="block truncate text-[11.5px] text-white/60">{r.note}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[11.5px] text-white/80">
            <span className="size-2 rounded-full" style={{ background: STATE[r.state].dot }} />
            {r.state === 'lesson' ? `${r.kmh} km/h` : STATE[r.state].label}
          </span>
        </button>
      ))}
    </div>
  )
}

function Detail() {
  const row = useUi((s) => s.rows.find((r) => r.id === s.selected))
  const select = useUi((s) => s.select)
  if (!row) return null
  return (
    <div className="hud-card w-[300px]">
      <div className="flex items-start justify-between">
        <div>
          <div className="hud-title">Peugeot 208 · n° {row.n}</div>
          <div className="plate">{row.plate}</div>
        </div>
        <button onClick={() => select(null)} className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white">
          <X size={16} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="stat">
          <span>Moniteur</span>
          <b>{row.instructor}</b>
        </div>
        <div className="stat">
          <span>Élève</span>
          <b>{row.student}</b>
        </div>
        <div className="stat">
          <span>Heure de conduite</span>
          <b>{row.hour} / 20</b>
        </div>
        <div className="stat">
          <span>Vitesse</span>
          <b>{row.kmh} km/h</b>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#ffcc00]" style={{ width: `${(row.hour / 20) * 100}%` }} />
      </div>
      <div className="mt-3 text-[12px] text-white/60">Compétence travaillée</div>
      <div className="text-[14px] font-semibold text-white">{row.skill}</div>
      <div className="mt-2 flex gap-4 text-[12px] text-white/70">
        <span>{row.km.toFixed(1).replace('.', ',')} km parcourus</span>
        <span>
          {row.stalls} calage{row.stalls > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

export function Hud() {
  const s = useUi()
  return (
    <div className="pointer-events-none absolute inset-0 select-none font-sans">
      <CarTags />

      {/* identité + horloge */}
      <div className="absolute left-5 top-5 flex items-center gap-3">
        <div className="hud-card flex items-center gap-3 !py-2.5">
          <div className="grid size-9 place-items-center rounded-lg text-[15px] font-black text-white" style={{ background: BRAND.color }}>
            P
          </div>
          <div>
            <div className="text-[15px] font-bold leading-tight text-white">{BRAND.name}</div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-white/70">
              <span className="live-dot" /> En direct · {s.clock}
            </div>
          </div>
        </div>
      </div>

      {/* flotte + détail */}
      <div className="pointer-events-auto absolute right-5 top-5 flex flex-col gap-2">
        <Fleet />
        <Detail />
      </div>

      {/* fil d'événements */}
      <div className="absolute bottom-20 left-5 flex w-[320px] flex-col gap-1">
        {s.events.slice(0, 3).map((e, i) => (
          <div key={e.text + e.t} className="event" style={{ opacity: 1 - i * 0.28 }}>
            {e.text}
          </div>
        ))}
      </div>

      {/* commandes */}
      <div className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
        <div className="hud-bar">
          {TODS.map((t) => (
            <button key={t.id} onClick={() => s.setTod(t.id)} className={`bar-btn ${s.tod === t.id ? 'bar-on' : ''}`} title={t.label}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
        <div className="hud-bar">
          <Camera size={15} className="mx-1.5 text-white/50" />
          {SHOTS.map((v) => (
            <button key={v.id} onClick={() => s.setShot(v.id)} className={`bar-btn ${s.shot === v.id && !s.cinema ? 'bar-on' : ''}`}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="hud-bar">
          <button onClick={() => s.setCinema(!s.cinema)} className={`bar-btn ${s.cinema ? 'bar-on' : ''}`}>
            <Clapperboard size={15} /> Cinéma
          </button>
          <button onClick={s.toggleLabels} className={`bar-btn ${s.labels ? 'bar-on' : ''}`} title="Étiquettes">
            <Tag size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
