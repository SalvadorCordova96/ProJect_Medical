# 📝 Guía de Testing - PodoSkin API

## ⚠️ IMPORTANTE: Incompatibilidad SQLite

Los tests que requieren base de datos **NO FUNCIONAN con SQLite** debido a que el proyecto usa tipos específicos de PostgreSQL:

- ❌ **JSONB** - No existe en SQLite (solo JSON)
- ❌ **INET** - Tipo para IPs, no existe en SQLite  
- ❌ **ARRAY** - Arreglos nativos, no existe en SQLite
- ❌ **Schemas** (`auth.`, `clinic.`, `ops.`) - SQLite no los soporta

### Resultado con SQLite

```
sqlalchemy.exc.CompileError: Compiler can't render element of type JSONB/INET/ARRAY
```

## ✅ Solución: Usar PostgreSQL para Tests

### Opción 1: PostgreSQL en Docker (Recomendado)

```bash
# Crear bases de datos de prueba
docker exec -it podoskin-db psql -U podoskin -c "CREATE DATABASE test_auth_db;"
docker exec -it podoskin-db psql -U podoskin -c "CREATE DATABASE test_core_db;"
docker exec -it podoskin-db psql -U podoskin -c "CREATE DATABASE test_ops_db;"

# Editar backend/tests/conftest.py
# Descomentar las líneas de PostgreSQL:
TEST_AUTH_DB_URL = "postgresql://podoskin:podoskin123@localhost:5432/test_auth_db"
TEST_CORE_DB_URL = "postgresql://podoskin:podoskin123@localhost:5432/test_core_db"
TEST_OPS_DB_URL = "postgresql://podoskin:podoskin123@localhost:5432/test_ops_db"

# Ejecutar tests
pytest tests/unit/test_auth_endpoints.py -v
```

### Opción 2: PostgreSQL Local

```bash
# Instalar PostgreSQL localmente
# Crear usuario y bases de datos
psql -U postgres
CREATE USER podoskin WITH PASSWORD 'podoskin123';
CREATE DATABASE test_auth_db OWNER podoskin;
CREATE DATABASE test_core_db OWNER podoskin;
CREATE DATABASE test_ops_db OWNER podoskin;

# Configurar en conftest.py (igual que Opción 1)
```

## 🧪 Tests que SÍ Funcionan con SQLite

Estos tests NO usan base de datos y funcionan correctamente:

```bash
# Tests de validación SQL
pytest tests/unit/test_security_improvements.py::TestSQLValidation -v

# Tests de sanitización de archivos  
pytest tests/unit/test_security_improvements.py::TestFileUploadSecurity -v
```

## 📊 Estado Actual de Tests

### ✅ **25 Tests Pasando** (sin BD)
- Validación SQL injection (4 tests)
- Sanitización de archivos (1 test) 
- Tests unitarios de utilidades (20 tests)

### ⚠️ **96 Tests con Error** (requieren PostgreSQL)
- Tests de autenticación (25 tests)
- Tests de endpoints de pacientes (45 tests)
- Tests de citas (26 tests)

## 🔧 Inconsistencias Corregidas

1. ✅ Pydantic v2: `orm_mode` → `from_attributes`
2. ✅ pytest-asyncio: Agregada configuración de `asyncio_default_fixture_loop_scope`
3. ✅ Importaciones corregidas en subgrafos de LangGraph
4. ✅ Función `get_password_hash` agregada como alias
5. ✅ Test SQL validation más flexible

## 🐛 Problemas Conocidos

### 1. Checkpointer Warning
```
❌ Error al inicializar checkpointer: CREATE INDEX CONCURRENTLY cannot run inside a transaction block
```
**Impacto**: Bajo - El grafo compila sin checkpointer (modo stateless)
**Solución**: Ya implementada con ConnectionPool

### 2. Tests de BD con SQLite
**Impacto**: Alto - 96 tests fallan
**Solución**: Usar PostgreSQL (ver arriba)

## 📝 Cómo Ejecutar Tests

```bash
# Activar entorno virtual
cd backend
.\venv\Scripts\Activate.ps1  # Windows
# o source venv/bin/activate  # Linux/Mac

# Tests sin BD (rápidos)
pytest tests/unit/test_security_improvements.py -v

# Tests completos (requiere PostgreSQL)
pytest tests/unit/ -v

# Con cobertura
pytest tests/unit/ --cov=backend/api --cov-report=html

# Solo tests específicos
pytest tests/unit/test_auth_endpoints.py::TestAuthLogin -v
```

## 🎯 Recomendaciones

1. **Para CI/CD**: Configurar PostgreSQL en el pipeline
2. **Para desarrollo local**: Usar Docker con PostgreSQL
3. **Para tests rápidos**: Ejecutar solo tests sin BD
4. **Para tests completos**: Usar PostgreSQL local o Docker

---

**Última actualización**: 11 de diciembre de 2025
