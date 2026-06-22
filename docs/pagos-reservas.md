# Pagos en reservas

## Estrategia recomendada

El turno debe poder reservarse con tres modalidades:

1. **Pago en sucursal**: confirma el turno sin cobro online.
2. **Sena por transferencia**: confirma el turno y deja trazabilidad en `turnos.notas`; el equipo valida el comprobante.
3. **Mercado Pago**: crea una preferencia de checkout en backend y confirma el turno cuando el webhook marca el pago como aprobado.

## Implementacion actual

- El paciente elige el medio de pago en el paso de confirmacion.
- La opcion queda guardada en `turnos.notas` como `Medio de pago: ...`.
- La confirmacion por WhatsApp incluye el medio de pago.
- El flujo no depende de credenciales externas, por lo que funciona en demo.

## Proximo paso para checkout real

Agregar una tabla `pagos`:

```sql
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turno_id UUID NOT NULL REFERENCES turnos(id) ON DELETE CASCADE,
  proveedor VARCHAR(40) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  monto NUMERIC(10,2) NOT NULL,
  external_id TEXT,
  checkout_url TEXT,
  creado_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

El frontend no debe tener tokens de Mercado Pago. La creacion de preferencias y la recepcion de webhooks deben vivir en una Edge Function o backend propio.
