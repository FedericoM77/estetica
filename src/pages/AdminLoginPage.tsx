import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { AuthError } from '../lib/auth'

export function AdminLoginPage() {
  const { usuario, isLoadingAuth, iniciarSesion, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Si ya hay un admin logueado, entrar directo al panel.
  if (!isLoadingAuth && usuario?.rol === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const u = await iniciarSesion({ email, password })
      if (u.rol !== 'ADMIN') {
        // No es un admin: cerramos la sesión para no dejarlo a medias.
        await cerrarSesion()
        setError('Esta cuenta no tiene acceso al panel de administración.')
        return
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout titulo="Panel de administración" subtitulo="Acceso del equipo del centro.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && <p className="text-sm text-error">{error}</p>}

        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </AuthLayout>
  )
}
