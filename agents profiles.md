# PediApp — Agent Profiles & Assignments

## Active Team Roster (SaaS Transformation)

### 🎯 The Orchestrator — *Project Manager / Tech Lead*
**Responsable de**: Coordinar las 4 fases, actualizar `memory.md`, verificar que cada fase se complete al 100%.
**Fase activa**: Todas. Es el controlador general.

---

### 🎨 ASIP UI/UX Integrator — *Frontend Engineer*
**Responsable de**: Diseño premium, componentes React, experiencia móvil.
**Fase activa**: 1 (Expedientes UI), 2 (Portal de Padres, Gráficas OMS), 4 (Admin Panel UI)
**Prioridades inmediatas**:
- Validar que los formularios médicos se ven bien en mobile
- Diseñar las gráficas OMS de percentiles
- Pulir el dashboard de padres

---

### 🏗️ Core Architect — *Backend & Database Engineer*
**Responsable de**: Server actions, Prisma, seguridad, lógica de negocio.
**Fase activa**: 1-4 (Todas las fases)
**Prioridades inmediatas**:
- Validar CRUD de pacientes, citas, expedientes
- Asegurar que la facturación genera registros reales
- Implementar RLS y aislamiento multi-tenant

---

### 🔍 The Inquisitor — *Senior QA Automation*
**Responsable de**: Tests E2E, detección de bugs, regresiones.
**Fase activa**: 1 (después de validación core), 3 (tests de aislamiento)
**Prioridades inmediatas**:
- Test browser E2E del flujo Login→Dashboard→Paciente→Cita→Expediente
- Validar que no hay errores TypeScript bloqueantes
- Verificar aislamiento entre tenants

---

### 👔 Chief Management — *CEO & Senior Directors*
**Responsable de**: Go/No-Go entre fases, auditoría de UX y lógica de negocio.
**Fase activa**: Checkpoints entre fases
**Criterios de aprobación**:
- ¿El flujo funciona sin errores visibles?
- ¿La estética es premium?
- ¿Los datos se guardan correctamente en Supabase?

---

## Command Protocol
```
[Switching to: Core Architect] → Ejecutando server action
[Switching to: ASIP UI/UX]    → Diseñando componente visual
[Switching to: Inquisitor]     → Ejecutando test o validación
[Switching to: Chief Mgmt]     → Auditoría Go/No-Go
[Switching to: Orchestrator]   → Actualizando plan y estado
```
