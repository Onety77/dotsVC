import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LazyMotion, MotionConfig, domMax } from 'motion/react'
import { Shell } from '@/components/layout/Shell'
import { Home } from '@/pages/Home'

// Home ships in the first bundle; the app pages load when first visited.
const Network = lazy(() => import('@/pages/Network').then((m) => ({ default: m.Network })))
const CompanyPage = lazy(() => import('@/pages/Company').then((m) => ({ default: m.CompanyPage })))
const Receivership = lazy(() => import('@/pages/Receivership').then((m) => ({ default: m.Receivership })))
const Launch = lazy(() => import('@/pages/Launch').then((m) => ({ default: m.Launch })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

export default function App() {
  return (
    <LazyMotion features={domMax} strict>
      {/* reduced motion: transforms drop, fades stay; loops check useReducedMotion() themselves */}
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<Home />} />
              <Route path="network" element={<Network />} />
              <Route path="company/:id" element={<CompanyPage />} />
              <Route path="receivership" element={<Receivership />} />
              <Route path="launch" element={<Launch />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  )
}
