import { Sim } from '../src/sim/sim'
const sim = new Sim(5, 6); const dt = 1/30; let n = 0
for (let i = 0; i < 30 * 900 && n < 6; i++) { sim.step(dt)
  for (const v of sim.vehicles) for (const o of sim.vehicles) { if (o.id <= v.id) continue
    if (v.school?.state === 'parked' && o.school?.state === 'parked') continue
    const d = Math.hypot(o.x - v.x, o.z - v.z)
    if (d < 2.4 && i % 15 === 0) { n++; console.log(sim.t.toFixed(1), d.toFixed(2), [v, o].map(c => `${c.id}:${c.school?.state ?? 'loop'} s=${c.s.toFixed(1)} v=${c.v.toFixed(1)} (${c.x.toFixed(1)},${c.z.toFixed(1)}) onLoop=${c.onLoop}`).join('  |  ')) } } }
