import { Camera, Clapperboard, Moon, Sun, Sunset, Tag, X } from 'lucide-react'
import { useUi, type Shot, type StaffRow, type TimeOfDay } from '../store'
import { BRAND } from '../world'
import { tagEls } from '../three/Tags'

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

const initials = (n: string) => n.split(' ').map((p) => p[0]).join('').slice(0, 2)
const first = (n: string) => n.split(' ')[0]

/** Étiquettes au-dessus des voitures de l'école : qui est à bord */
function CarTags() {
  const staff = useUi((s) => s.staff)
  const labels = useUi((s) => s.labels)
  const selected = useUi((s) => s.selected)
  const select = useUi((s) => s.select)
  if (!labels) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {staff
        .filter((r) => r.where === 'voiture')
        .map((r) => (
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
            <span className="tag-txt">{r.state === 'parked' ? first(r.name) : `${first(r.name)} · ${first(r.student ?? '')}`}</span>
          </button>
        ))}
    </div>
  )
}

function Team() {
  const staff = useUi((s) => s.staff)
  const selected = useUi((s) => s.selected)
  const select = useUi((s) => s.select)
  const onRoad = staff.filter((r) => r.state === 'lesson').length
  return (
    <div className="hud-card w-[310px]">
      <div className="hud-title">
        Moniteurs · {staff.length} présents · {onRoad} en leçon
      </div>
      {staff.map((r) => (
        <button key={r.id} onClick={() => select(selected === r.id ? null : r.id)} className={`fleet-row ${selected === r.id ? 'fleet-on' : ''}`}>
          <span className="avatar">{initials(r.name)}</span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[13px] font-semibold text-white">{r.name}</span>
            <span className="block truncate text-[11.5px] text-white/60">{r.status}</span>
          </span>
          <span className="size-2 flex-none rounded-full" style={{ background: r.dot }} />
        </button>
      ))}
    </div>
  )
}

function Detail() {
  const row: StaffRow | undefined = useUi((s) => s.staff.find((r) => r.id === s.selected))
  const select = useUi((s) => s.select)
  if (!row) return null
  return (
    <div className="hud-card w-[310px]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="avatar !size-9 !text-[13px]">{initials(row.name)}</span>
          <div>
            <div className="text-[15px] font-bold leading-tight text-white">{row.name}</div>
            <div className="text-[11.5px] text-white/60">Moniteur · {row.where}</div>
          </div>
        </div>
        <button onClick={() => select(null)} className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white">
          <X size={16} />
        </button>
      </div>
      <div className="mt-2.5 text-[13px] text-white/85">{row.status}</div>
      {row.where === 'voiture' && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="stat">
              <span>Élève</span>
              <b>{row.student}</b>
            </div>
            <div className="stat">
              <span>Véhicule</span>
              <b>208 n° {row.n}</b>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[12px] text-white/60">
            <span>Heure de conduite</span>
            <span className="font-semibold text-white">{row.hour} / 20</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#ffcc00]" style={{ width: `${((row.hour ?? 0) / 20) * 100}%` }} />
          </div>
          <div className="mt-3 text-[12px] text-white/60">Compétence travaillée</div>
          <div className="text-[14px] font-semibold text-white">{row.skill}</div>
          <div className="plate mt-3">{row.plate}</div>
        </>
      )}
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

      {/* suivi des moniteurs + fiche */}
      <div className="pointer-events-auto absolute right-5 top-5 flex flex-col gap-2">
        <Team />
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
            <button key={t.id} onClick={() => s.setTod(t.id)} className={`bar-btn whitespace-nowrap ${s.tod === t.id ? 'bar-on' : ''}`} title={t.label}>
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
