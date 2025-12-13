# 🎯 PROMPT PARA AGENTE - Implementación NOM-024 Pragmática

## CONTEXTO
Este es un sistema de gestión clínica podológica (PodoSkin) que **NO está certificado** pero debe estar **listo para certificarse** cuando crezca. Tu trabajo es implementar los requisitos técnicos de la **NOM-024-SSA3-2012** que NO requieren trámites burocráticos.

## QUÉ IMPLEMENTAR (19 Requisitos Técnicos)

### BLOQUE 1: Audit Log y Datos Inmutables
1. **Audit log append-only** con triggers PostgreSQL (evitar UPDATE/DELETE)
2. **Estado completo** en cada cambio (no solo deltas)
3. **JSONB estructurado** con esquema documentado para mapeo futuro a HL7/CDA

### BLOQUE 2: Identificación de Pacientes
4. **Campos obligatorios Tabla 1 NOM-024**: CURP (validación formato), apellidos, nombres, fecha nacimiento (AAAAMMDD), estado nacimiento, sexo, nacionalidad, folio interno, estado/municipio/localidad residencia
5. **Datos profesionales de salud**: cédula profesional, especialidad, institución título

### BLOQUE 3: Catálogos Preparados
6. **Tablas de catálogos** (aunque vacías): cat_diagnosticos, cat_procedimientos, cat_medicamentos, cat_municipios, cat_estados, cat_localidades
7. **Campos para códigos oficiales** (CIE-10, etc.) además de texto libre actual

### BLOQUE 4: Exportación
8. **Endpoint JSON/XML** de expediente completo (datos demográficos, consultas, diagnósticos, tratamientos)
9. **Sistema de impresión HTML** formal y elegante con datos seleccionables

### BLOQUE 5: Seguridad RBAC
10. **Roles y permisos documentados** (admin, podologo, recepcion)
11. **Campos preparados** para firma electrónica futura (signature_hash, signature_timestamp, signature_type)
12. **Log de consultas** (quién lee, no solo quién modifica)

### BLOQUE 6: Interoperabilidad Futura
13. **Campos reservados**: CLUES (12 chars), folio_intercambio, consentimiento_paciente
14. **Formato ISO 8601** en TODAS las fechas/timestamps

### BLOQUE 7: Podología Específica
15. **Datos estructurados** de evaluación biomecánica, uñas, callosidades, plantillas
16. **Metadata de imágenes** (fecha, tipo estudio, médico)

### BLOQUE 8: Reportes y Backups
17. **Queries optimizados** para reportes estadísticos (consultas/período, diagnósticos frecuentes)
18. **Proceso de backup** documentado y probado
19. **Diccionario de datos** completo con flujos documentados

## QUÉ **NO** IMPLEMENTAR (Requiere trámites)
❌ Certificación ante DGIS  
❌ Firma electrónica FIEL/e.firma del gobierno  
❌ Validación CURP con RENAPO en tiempo real  
❌ Conexión con sistemas oficiales (IMSS, ISSSTE)  
❌ HL7/CDA completo (solo preparar estructura de datos)

## POR QUÉ SOLO PARTE DE LA NOM-024
La clínica **NO es hospital certificado**, por lo tanto:
- **Artículos 1.2, 7**: Certificación → OMITIR (no aplica aún)
- **Artículo 6.6.2**: Firma electrónica avanzada → PREPARAR campos, no implementar
- **Artículo 6.3**: Interoperabilidad HL7 → PREPARAR estructura de datos exportables
- **Artículos 6.4, 6.5, 6.6**: Catálogos, identificación, seguridad → **IMPLEMENTAR COMPLETAMENTE**

Consulta la **NOM-024-SSA3-2012 oficial** en el DOF para validar cada implementación.

## ARCHIVO GUÍA
Consulta `INFORME_CUMPLIMIENTO_NOM024.md` para ejemplos de código, estructura de tablas, y casos de uso detallados.

## CRITERIO DE ÉXITO
✅ Las 19 preguntas del informe tienen respuesta: **"Implementado completamente"**  
✅ Sistema puede certificarse en el futuro con cambios mínimos  
✅ Sin trámites burocráticos necesarios ahora

## DOCUMENTACIÓN FINAL
Genera `REPORTE_IMPLEMENTACION_NOM024.md` con:
- Status de cada uno de los 19 puntos
- Cambios realizados (migraciones, tablas, endpoints)
- Próximos pasos para certificación futura
