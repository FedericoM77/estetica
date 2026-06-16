import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { useAdminServicios } from '../../hooks/useAdminServicios'
import { formatPrecio } from '../../lib/format'
import type { Servicio, ServicioInput } from '../../types'

const VACIO: ServicioInput = {
  nombre: '',
  descripcion: '',
  duracion_minutos: 60,
  precio: null,
  precio_desde: false,
  activo: true,
}

export function TratamientosPage() {
  const { servicios, isLoadingServicios, errorServicios, crear, actualizar, eliminar } =
    useAdminServicios()

  const [editando, setEditando] = useState<Servicio | null>(null)
  const [form, setForm] = useState<ServicioInput | null>(null)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  function abrirNuevo() {
    setEditando(null)
    setForm({ ...VACIO })
    setErrorForm(null)
  }

  function abrirEdicion(s: Servicio) {
    setEditando(s)
    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion ?? '',
      duracion_minutos: s.duracion_minutos,
      precio: s.precio,
      precio_desde: s.precio_desde,
      activo: s.activo,
    })
    setErrorForm(null)
  }

  function cerrar() {
    setForm(null)
    setEditando(null)
    setErrorForm(null)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    if (form.nombre.trim().length < 2) {
      setErrorForm('Ingresá un nombre.')
      return
    }
    if (form.duracion_minutos < 5 || form.duracion_minutos > 480) {
      setErrorForm('La duración debe estar entre 5 y 480 minutos.')
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

  async function borrar(s: Servicio) {
    if (!confirm(`¿Eliminar "${s.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await eliminar(s.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-light text-ink">Tratamientos</h2>
        <Button onClick={abrirNuevo}>+ Nuevo tratamiento</Button>
      </div>

      {form && (
        <Card className="mb-8">
          <h3 className="mb-4 text-xs uppercase tracking-wider text-muted">
            {editando ? 'Editar tratamiento' : 'Nuevo tratamiento'}
          </h3>
          <form onSubmit={guardar} className="space-y-4" noValidate>
            <Input
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm((f) => f && { ...f, nombre: e.target.value })}
            />
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Descripción</span>
              <textarea
                rows={2}
                className="w-full rounded-input border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold"
                value={form.descripcion ?? ''}
                onChange={(e) => setForm((f) => f && { ...f, descripcion: e.target.value })}
              />
            </label>
            <div className="flex flex-wrap items-end gap-4">
              <Input
                label="Duración (min)"
                type="number"
                min={5}
                max={480}
                step={5}
                className="w-32"
                value={form.duracion_minutos}
                onChange={(e) =>
                  setForm((f) => f && { ...f, duracion_minutos: Number(e.target.value) })
                }
              />
              <Input
                label="Precio (ARS)"
                type="number"
                min={0}
                step={500}
                className="w-40"
                placeholder="A consultar"
                value={form.precio ?? ''}
                onChange={(e) =>
                  setForm(
                    (f) =>
                      f && { ...f, precio: e.target.value === '' ? null : Number(e.target.value) },
                  )
                }
              />
              <label className="flex items-center gap-2 pb-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.precio_desde}
                  onChange={(e) => setForm((f) => f && { ...f, precio_desde: e.target.checked })}
                  className="h-4 w-4 accent-gold"
                />
                "Desde" (varía según largo)
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm((f) => f && { ...f, activo: e.target.checked })}
                className="h-4 w-4 accent-gold"
              />
              Activo (visible para reservar)
            </label>

            {errorForm && <p className="text-sm text-error">{errorForm}</p>}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={cerrar}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoadingServicios && <Spinner label="Cargando tratamientos…" />}
      {errorServicios && <p className="py-10 text-center text-error">{errorServicios}</p>}

      {!isLoadingServicios && !errorServicios && (
        <ul className="space-y-2">
          {servicios.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm text-ink">
                  {s.nombre}
                  {!s.activo && (
                    <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      Inactivo
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  <span className="text-gold">{formatPrecio(s)}</span> · {s.duracion_minutos} min
                  {s.descripcion ? ` · ${s.descripcion}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => abrirEdicion(s)}>
                  Editar
                </Button>
                <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => void borrar(s)}>
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
          {servicios.length === 0 && (
            <p className="py-10 text-center text-sm text-line">Todavía no hay tratamientos.</p>
          )}
        </ul>
      )}
    </div>
  )
}
