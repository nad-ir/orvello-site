import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import TermsPage from './pages/TermsPage'
import ClientPage from './pages/ClientPage'
import GeneratorPage from './pages/GeneratorPage'

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
        <Route path="/" element={<HomePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/client" element={<ClientPage />} />
        <Route path="/generate" element={<GeneratorPage />} />
      </Routes>
    </>
  )
}
