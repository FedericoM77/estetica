import { useCallback, useState } from 'react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Stepper } from '../components/booking/Stepper'
import { StepService } from '../components/booking/StepService'
import { StepProfessional } from '../components/booking/StepProfessional'
import { StepDateTime } from '../components/booking/StepDateTime'
import { StepConfirmation } from '../components/booking/StepConfirmation'
import { SuccessScreen } from '../components/booking/SuccessScreen'
import { useAuth } from '../hooks/useAuth'
import type { DatosCliente, Profesional, Servicio, Slot } from '../types'

type Paso = 1 | 2 | 3 | 4 | 'success'

export function BookingPage() {
  const { usuario } = useAuth()
  const [paso, setPaso] = useState<Paso>(1)
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [profesional, setProfesional] = useState<Profesional | null>(null)
  const [fecha, setFecha] = useState<Date | null>(null)
  const [slot, setSlot] = useState<Slot | null>(null)
  const [cliente, setCliente] = useState<DatosCliente | null>(null)
  // Si el paso 2 se salteó automáticamente, "volver" desde el paso 3 va al 1
  const [pasoProfesionalSalteado, setPasoProfesionalSalteado] = useState(false)

  function seleccionarServicio(nuevo: Servicio) {
    if (servicio?.id !== nuevo.id) {
      // Cambiar de servicio invalida las selecciones posteriores
      setProfesional(null)
      setFecha(null)
      setSlot(null)
      setPasoProfesionalSalteado(false)
    }
    setServicio(nuevo)
  }

  function seleccionarProfesional(nuevo: Profesional) {
    if (profesional?.id !== nuevo.id) {
      setFecha(null)
      setSlot(null)
    }
    setProfesional(nuevo)
  }

  const autoSkipProfesional = useCallback((unico: Profesional) => {
    setProfesional(unico)
    setPasoProfesionalSalteado(true)
    setPaso(3)
  }, [])

  function reiniciar() {
    setServicio(null)
    setProfesional(null)
    setFecha(null)
    setSlot(null)
    setCliente(null)
    setPasoProfesionalSalteado(false)
    setPaso(1)
  }

  return (
    <PageWrapper>
      {paso !== 'success' && <Stepper pasoActual={paso} />}

      {paso === 1 && (
        <StepService
          servicioSeleccionado={servicio}
          onSelect={seleccionarServicio}
          onNext={() => setPaso(2)}
        />
      )}

      {paso === 2 && servicio && (
        <StepProfessional
          servicioId={servicio.id}
          profesionalSeleccionado={profesional}
          onSelect={seleccionarProfesional}
          onAutoSkip={autoSkipProfesional}
          onNext={() => setPaso(3)}
          onBack={() => setPaso(1)}
        />
      )}

      {paso === 3 && servicio && profesional && (
        <StepDateTime
          profesionalId={profesional.id}
          duracionMinutos={servicio.duracion_minutos}
          fechaSeleccionada={fecha}
          slotSeleccionado={slot}
          onSelectFecha={(f) => {
            setFecha(f)
            setSlot(null)
          }}
          onSelectSlot={setSlot}
          onNext={() => setPaso(4)}
          onBack={() => setPaso(pasoProfesionalSalteado ? 1 : 2)}
        />
      )}

      {paso === 4 && servicio && profesional && slot && (
        <StepConfirmation
          servicio={servicio}
          profesional={profesional}
          slot={slot}
          datosIniciales={
            usuario ? { nombre: usuario.nombre, email: usuario.email } : undefined
          }
          onSuccess={(datos) => {
            setCliente(datos)
            setPaso('success')
          }}
          onBack={() => setPaso(3)}
        />
      )}

      {paso === 'success' && servicio && profesional && slot && cliente && (
        <SuccessScreen
          servicio={servicio}
          profesional={profesional}
          slot={slot}
          cliente={cliente}
          onNuevaReserva={reiniciar}
        />
      )}
    </PageWrapper>
  )
}
