import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { useAdminSucursales } from '../../hooks/useAdminSucursales'
import type { Sucursal, SucursalInput } from '../../types'

const VACIO: SucursalInput = {
  nombre: '',
  direccion: '',
}

export function SucursalesPage() {
  const { sucursales, isLoadingSucursales, errorSucursales, crear, actualizar, eliminar } =
    useAdminSucursales()
  const [editando, setEditando] = useState<Sucursal | null>(null)
  const [form, setForm] = useState<SucursalInput | null>(null)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  function abrirNuevo() {
    setEditando(null)
    setForm({ ...VACIO })
    setErrorForm(null)
  }

  function abrirEdicion(sucursal: Sucursal) {
    setEditando(sucursal)
    setForm({ nombre: sucursal.nombre, direccion: sucursal.direccion })
    setErrorForm(null)
  }

  function cerrar() {
    setEditando(null)
    setForm(null)
    setErrorForm(null)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    if (form.nombre.trim().length < 2) {
      setErrorForm('Ingresa el nombre de la sucursal.')
      return
    }
    if (form.direccion.trim().length < 5) {
      setErrorForm('Ingresa una direccion valida.')
      return
    }
    setGuardando(true)
    try {
      if (editando) await actualizar(editando.id, form)
      else await crear(form)
      cerrar()
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'No se pudo guardar.')
    } finally {
      setGuardando(false)
    }
  }

  async function borrar(sucursal: Sucursal) {
    if (!confirm(`Eliminar "${sucursal.nombre}"? Esta accion no se puede deshacer.`)) return
    try {
      await eliminar(sucursal.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="font-display text-2xl font-light text-slate-950 dark:text-white">
            Sucursales
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administra sedes, direcciones y disponibilidad multi-sucursal.
          </p>
        </div>
        <Button onClick={abrirNuevo}>+ Nueva sucursal</Button>
      </div>

      {form && (
        <Card className="mb-8">
          <h3 className="mb-4 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {editando ? 'Editar sucursal' : 'Nueva sucursal'}
          </h3>
          <form onSubmit={guardar} className="space-y-4" noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nombre"
                value={form.nombre}
                onChange={(e) => setForm((f) => f && { ...f, nombre: e.target.value })}
              />
              <Input
                label="Direccion"
                value={form.direccion}
                onChange={(e) => setForm((f) => f && { ...f, direccion: e.target.value })}
              />
            </div>

            {errorForm && <p className="text-sm text-error">{errorForm}</p>}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={cerrar}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoadingSucursales && <Spinner label="Cargando sucursales..." />}
      {errorSucursales && <p className="py-10 text-center text-error">{errorSucursales}</p>}

      {!isLoadingSucursales && !errorSucursales && (
        <div className="grid gap-4 sm:grid-cols-2">
          {sucursales.map((sucursal) => (
            <Card
              key={sucursal.id}
              className="border-amber-200/20 bg-zinc-900 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.7)] dark:border-purple-950/40 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg text-amber-100 dark:text-[#E6C687]">
                    {sucursal.nombre}
                  </p>
                  <p className="mt-1 text-sm text-amber-200/75 dark:text-zinc-400">
                    {sucursal.direccion}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    className="border-amber-100/70 px-3 py-1.5 text-xs text-amber-100 hover:border-amber-200 hover:bg-amber-200/10 dark:border-zinc-600 dark:text-zinc-200"
                    onClick={() => abrirEdicion(sucursal)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => void borrar(sucursal)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {sucursales.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Todavia no hay sucursales.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
