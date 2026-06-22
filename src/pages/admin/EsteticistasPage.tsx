import { useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input, Select } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { useAdminProfesionales } from '../../hooks/useAdminProfesionales'
import type { ProfesionalConServicios, ProfesionalInput } from '../../types'

export function EsteticistasPage() {
  const {
    profesionales,
    servicios,
    sucursales,
    isLoadingProfesionales,
    errorProfesionales,
    crear,
    actualizar,
    eliminar,
  } = useAdminProfesionales()

  const [editando, setEditando] = useState<ProfesionalConServicios | null>(null)
  const [form, setForm] = useState<ProfesionalInput | null>(null)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  function nuevoForm(): ProfesionalInput {
    return {
      sucursal_id: sucursales[0]?.id ?? '',
      nombre: '',
      especialidad: '',
      telefono: '',
      activo: true,
      servicioIds: [],
    }
  }

  function abrirNuevo() {
    setEditando(null)
    setForm(nuevoForm())
    setErrorForm(null)
  }

  function abrirEdicion(p: ProfesionalConServicios) {
    setEditando(p)
    setForm({
      sucursal_id: p.sucursal_id,
      nombre: p.nombre,
      especialidad: p.especialidad,
      telefono: p.telefono ?? '',
      activo: p.activo,
      servicioIds: [...p.servicioIds],
    })
    setErrorForm(null)
  }

  function cerrar() {
    setForm(null)
    setEditando(null)
    setErrorForm(null)
  }

  function toggleServicio(id: string) {
    setForm((f) => {
      if (!f) return f
      const yaEsta = f.servicioIds.includes(id)
      return {
        ...f,
        servicioIds: yaEsta ? f.servicioIds.filter((x) => x !== id) : [...f.servicioIds, id],
      }
    })
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!form) return
    if (form.nombre.trim().length < 3) {
      setErrorForm('Ingresá el nombre del esteticista.')
      return
    }
    if (!form.sucursal_id) {
      setErrorForm('Seleccioná una sucursal.')
      return
    }
    if (!/^\+?[\d\s-]{8,20}$/.test(form.telefono.trim())) {
      setErrorForm('Ingresá un teléfono válido para WhatsApp.')
      return
    }
    if (form.servicioIds.length === 0) {
      setErrorForm('Asigná al menos un tratamiento.')
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

  async function borrar(p: ProfesionalConServicios) {
    if (!confirm(`¿Eliminar a "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    try {
      await eliminar(p.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar.')
    }
  }

  const nombreServicio = (id: string) => servicios.find((s) => s.id === id)?.nombre ?? '—'

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-light text-ink">Esteticistas</h2>
        <Button onClick={abrirNuevo} disabled={sucursales.length === 0}>
          + Nuevo esteticista
        </Button>
      </div>

      {form && (
        <Card className="mb-8">
          <h3 className="mb-4 text-xs uppercase tracking-wider text-muted">
            {editando ? 'Editar esteticista' : 'Nuevo esteticista'}
          </h3>
          <form onSubmit={guardar} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Nombre"
                value={form.nombre}
                onChange={(e) => setForm((f) => f && { ...f, nombre: e.target.value })}
              />
              <Input
                label="Especialidad"
                value={form.especialidad}
                onChange={(e) => setForm((f) => f && { ...f, especialidad: e.target.value })}
              />
              <Input
                label="WhatsApp"
                type="tel"
                value={form.telefono}
                placeholder="+54 9 11 5555-1234"
                onChange={(e) => setForm((f) => f && { ...f, telefono: e.target.value })}
              />
            </div>

            <Select
              label="Sucursal"
              value={form.sucursal_id}
              onChange={(e) => setForm((f) => f && { ...f, sucursal_id: e.target.value })}
            >
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </Select>

            <div>
              <span className="mb-2 block text-sm text-muted">Tratamientos que realiza</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {servicios.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 rounded-input border border-line px-3 py-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={form.servicioIds.includes(s.id)}
                      onChange={() => toggleServicio(s.id)}
                      className="h-4 w-4 accent-gold"
                    />
                    {s.nombre}
                    {!s.activo && <span className="text-xs text-muted">(inactivo)</span>}
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm((f) => f && { ...f, activo: e.target.checked })}
                className="h-4 w-4 accent-gold"
              />
              Activo (disponible para reservar)
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

      {isLoadingProfesionales && <Spinner label="Cargando esteticistas…" />}
      {errorProfesionales && <p className="py-10 text-center text-error">{errorProfesionales}</p>}

      {!isLoadingProfesionales && !errorProfesionales && (
        <ul className="space-y-2">
          {profesionales.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm text-ink">
                  {p.nombre}
                  <span className="ml-2 text-muted">{p.especialidad}</span>
                  {!p.activo && (
                    <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                      Inactivo
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {p.telefono ? `${p.telefono} · ` : ''}
                  {p.servicioIds.length > 0
                    ? p.servicioIds.map(nombreServicio).join(' · ')
                    : 'Sin tratamientos asignados'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => abrirEdicion(p)}>
                  Editar
                </Button>
                <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => void borrar(p)}>
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
          {profesionales.length === 0 && (
            <p className="py-10 text-center text-sm text-line">Todavía no hay esteticistas.</p>
          )}
        </ul>
      )}
    </div>
  )
}
