import { Sim } from '../src/sim/sim'
import { LOOP, S, SPOTS } from '../src/sim/routes'

const sim = new Sim(5, 6)
console.log('boucle', LOOP.total.toFixed(1), 'm · courbure max', Math.max(...Array.from(LOOP.ks).map(Math.abs)).toFixed(3), '· S', Object.fromEntries(Object.entries(S).map(([k, v]) => [k, +v.toFixed(1)])))
SPOTS.forEach((s, i) => console.log(`place ${i}: entrée ${s.inPath.total.toFixed(1)} m (courb. max ${Math.max(...Array.from(s.inPath.ks).map(Math.abs)).toFixed(2)}), recul ${s.backLen.toFixed(1)} m, sortie ${s.outPath.total.toFixed(1)} m`))
const dt = 1 / 30
let minGap = Infinity, nan = 0, maxV = 0
const stateTime: Record<string, Record<string, number>> = {}
const lastMove: Record<string, number> = {}
let stuck: string[] = []
for (let i = 0; i < 30 * 900; i++) {
  sim.step(dt)
  for (const v of sim.vehicles) {
    if (!Number.isFinite(v.x + v.z + v.heading)) nan++
    maxV = Math.max(maxV, v.v)
    if (v.v > 0.2 || v.school?.state === 'parked') lastMove[v.id] = sim.t
    if (sim.t - (lastMove[v.id] ?? 0) > 45 && !stuck.includes(v.id)) stuck.push(v.id + '@' + sim.t.toFixed(0) + (v.school ? ':' + v.school.state : ''))
    if (v.school) { const st = (stateTime[v.id] ??= {}); st[v.school.state] = (st[v.school.state] ?? 0) + dt }
    for (const o of sim.vehicles) {
      if (o.id <= v.id) continue
      if (v.school?.state === 'parked' && o.school?.state === 'parked') continue
      const d = Math.hypot(o.x - v.x, o.z - v.z)
      if (d < minGap) minGap = d
    }
  }
}
console.log('NaN', nan, '· vitesse max', (maxV * 3.6).toFixed(0), 'km/h · distance min entre deux voitures', minGap.toFixed(2), 'm · bloquées', stuck.slice(0, 8))
for (const [id, st] of Object.entries(stateTime)) console.log(id, Object.entries(st).map(([k, v]) => `${k} ${v.toFixed(0)}s`).join(' · '), '· calages', sim.vehicles.find((v) => v.id === id)!.school!.stalls)
console.log(sim.events.slice(0, 4).map((e) => e.text))
const a = sim.vehicles[0]; console.log('ae-1', a.school!.state, 'wantsReturn', a.school!.wantsReturn, 'timer', a.school!.timer.toFixed(0), 'lotBusy', sim.lotBusy, 'v', a.v.toFixed(1))
