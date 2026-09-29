import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import { Home } from '@/pages/Home'
import { Network } from '@/pages/Network'
import { CompanyPage } from '@/pages/Company'
import { Receivership } from '@/pages/Receivership'
import { Launch } from '@/pages/Launch'
import { NotFound } from '@/pages/NotFound'

export default function App() {
  return (
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
  )
}
