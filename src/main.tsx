import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { Loader } from '@/components/Loader'
import { HomePage } from '@/pages/HomePage'
import { ApplyPage } from '@/pages/ApplyPage'
import { SecretGate } from '@/pages/SecretGate'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Loader />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/postuler" element={<ApplyPage />} />
        <Route path="*" element={<SecretGate />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
