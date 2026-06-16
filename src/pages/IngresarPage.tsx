import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/auth/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { AuthError } from '../lib/auth'

type Modo = 'login' | 'registro'

export function IngresarPage() {
  const { usuario, isLoadingAuth, iniciarSesion, registrarPaciente } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState<Modo>('login')

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Si ya hay sesión, redirigir según el rol.
  if (!isLoadingAuth && usuario) {
    return <Navigate to={usuario.rol === 'ADMIN' ? '/admin' : '/'} replace />
  }

  function validar(): string | null {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return 'Ingresá un email válido.'
    }
    if (password.length < 4) return 'La contraseña es demasiado corta.'
    if (modo === 'registro') {
      if (nombre.trim().length < 3) return 'Ingresá tu nombre completo.'
      if (!/^\+?[\d\s-]{8,20}$/.test(telefono.trim())) return 'Ingresá un teléfono válido.'
    }
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validacion = validar()
    if (validacion) {
      setError(validacion)
      return
    }
    setError(null)
    setEnviando(true)
    try {
      if (modo === 'login') {
        await iniciarSesion({ email, password })
      } else {
        await registrarPaciente({ nombre, telefono, email, password })
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'No se pudo completar la operación.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      titulo={modo === 'login' ? 'Ingresá a tu cuenta' : 'Creá tu cuenta'}
      subtitulo={
        modo === 'login'
          ? 'Reservá tu turno en pocos pasos.'
          : 'Registrate para reservar y ver tus turnos.'
      }
      footer={
        <button
          type="button"
          onClick={() => {
            setModo((m) => (m === 'login' ? 'registro' : 'login'))
            setError(null)
          }}
          className="transition-colors hover:text-ink"
        >
          {modo === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {modo === 'registro' && (
          <>
            <Input
              label="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
            />
            <Input
              label="Teléfono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              autoComplete="tel"
              placeholder="+54 9 11 5555-1234"
            />
          </>
        )}
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
          autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
        />

        {error && <p className="text-sm text-error">{error}</p>}

        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? 'Procesando…' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  )
}
