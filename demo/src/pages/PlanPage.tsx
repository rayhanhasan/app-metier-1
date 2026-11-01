import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useStore } from '../store'
import { Scene } from '../three/Scene'
import { SceneLabels } from '../ui/SceneLabels'
import { ModeTabs } from '../ui/Shell'
import { CopilotPanel } from '../ui/CopilotPanel'
import { LotPanel } from '../ui/LotPanel'
import { AnswerCard, Legend, Timeline } from '../ui/BottomBar'

export function PlanPage({ active }: { active: boolean }) {
  const select = useStore((s) => s.select)
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        frameloop={active ? 'always' : 'never'}
        camera={{ position: [60, 70, 90], fov: 30, near: 0.5, far: 600 }}
        onPointerMissed={() => select(null)}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      {active && <SceneLabels />}

      <div className={`pointer-events-none absolute inset-0 z-10 flex-col gap-3 p-3 ${active ? 'flex' : 'hidden'}`}>
        <div className="flex items-start justify-between gap-3">
          <ModeTabs />
          <Legend />
        </div>
        <div className="flex min-h-0 flex-1 justify-between gap-3">
          <div className="flex min-h-0 flex-col">
            <CopilotPanel />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <Timeline />
            <AnswerCard />
          </div>
          <div className="flex min-h-0 flex-col">
            <LotPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
