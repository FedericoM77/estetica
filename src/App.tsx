import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminLayout } from './components/admin/AdminLayout'
import { BookingPage } from './pages/BookingPage'
import { MisTurnosPage } from './pages/MisTurnosPage'
import { IngresarPage } from './pages/IngresarPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { TurnosAdminPage } from './pages/admin/TurnosAdminPage'
import { EsteticistasPage } from './pages/admin/EsteticistasPage'
import { TratamientosPage } from './pages/admin/TratamientosPage'
import { SucursalesPage } from './pages/admin/SucursalesPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Acceso público */}
          <Route path="/ingresar" element={<IngresarPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Paciente autenticado */}
          <Route element={<ProtectedRoute rol="CLIENTE" />}>
            <Route path="/" element={<BookingPage />} />
            <Route path="/mis-turnos" element={<MisTurnosPage />} />
          </Route>

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
