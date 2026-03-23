import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import TermsPage from './pages/TermsPage'
import EpcPage from './pages/EpcPage'
import EpcGeneratorPage from './pages/EpcGeneratorPage'
import DeliveryPage from './pages/DeliveryPage'
import ConsultancyGeneratorPage from './pages/ConsultancyGeneratorPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* EPC experience (high-volume, consumer-facing) */}
        <Route path="/epc" element={<EpcPage />} />

        {/* Consultancy delivery (secure document download) */}
        <Route path="/delivery" element={<DeliveryPage />} />

        {/* Internal generators */}
        <Route path="/epc-generate" element={<EpcGeneratorPage />} />
        <Route path="/generate" element={<ConsultancyGeneratorPage />} />
      </Routes>
    </>
  )
}
