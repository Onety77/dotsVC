import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LazyMotion, MotionConfig, domMax } from 'motion/react'
import { Shell } from '@/components/layout/Shell'
import { Home } from '@/pages/Home'
import { Network } from '@/pages/Network'
import { CompanyPage } from '@/pages/Company'
import { Receivership } from '@/pages/Receivership'
import { AuctionPage } from '@/pages/Auction'
import { Launch } from '@/pages/Launch'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
    <LazyMotion features={domMax} strict>
      {/* reduced motion: transforms drop, fades stay; loops check useReducedMotion() themselves */}
      <MotionConfig reducedMotion="user">
        {/* sync navigations, so a page change can run inside a View Transition (TravelLink) */}
        <BrowserRouter useTransitions={false}>
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<Home />} />
              <Route path="network" element={<Network />} />
              <Route path="company/:id" element={<CompanyPage />} />
              <Route path="receivership" element={<Receivership />} />
              <Route path="receivership/:id" element={<AuctionPage />} />
              <Route path="launch" element={<Launch />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  )
}
