import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminLayout } from './components/admin/AdminLayout'
import { BookingPage } from './pages/BookingPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { TurnosAdminPage } from './pages/admin/TurnosAdminPage'
import { EsteticistasPage } from './pages/admin/EsteticistasPage'
import { TratamientosPage } from './pages/admin/TratamientosPage'
import { SucursalesPage } from './pages/admin/SucursalesPage'
import { ThemeToggle } from './components/ui/ThemeToggle'

export default function App() {
  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      localStorage.getItem('aurum-theme') === 'dark',
    )
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ThemeToggle />
        <Routes>
          {/* Acceso publico para clientes */}
          <Route path="/" element={<BookingPage />} />
          <Route path="/ingresar" element={<Navigate to="/" replace />} />
          <Route path="/cliente/login" element={<Navigate to="/" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin autenticado */}
          <Route element={<ProtectedRoute rol="ADMIN" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="turnos" element={<TurnosAdminPage />} />
              <Route path="esteticistas" element={<EsteticistasPage />} />
              <Route path="tratamientos" element={<TratamientosPage />} />
              <Route path="sucursales" element={<SucursalesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
