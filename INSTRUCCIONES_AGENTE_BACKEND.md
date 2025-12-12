# 🔧 INSTRUCCIONES PARA AGENTE DE BACKEND
**Proyecto:** PodoSkin - Sistema de Gestión Clínica Podológica  
**Tu Rol:** Desarrollador Backend (FastAPI + Python + PostgreSQL)  
**Fecha:** 12 de diciembre de 2024  
**Repositorio:** https://github.com/AbrahamCordova96/Proyecto_Clinica_Podoskin.git

---

## 🎯 TU MISIÓN PRINCIPAL

Implementar gestión segura de API Keys de Gemini por usuario y crear un catálogo de comandos dinámico para el chatbot. Actualmente no existe forma de que cada usuario configure su propia API Key y el frontend no sabe qué comandos puede ejecutar.

---

## 📂 TU ÁREA DE TRABAJO

**PUEDES MODIFICAR:**
- ✅ `/backend/schemas/auth/models.py` (modelo SysUsuario)
- ✅ `/backend/api/routes/usuarios.py` (endpoints de usuarios)
- ✅ `/backend/api/routes/chat.py` (agregar catálogo de comandos)
- ✅ `/backend/api/core/encryption.py` (CREAR - servicio de encriptación)
- ✅ `/backend/api/core/config.py` (agregar configuración de encriptación)
- ✅ `/backend/requirements.txt` (agregar `cryptography`)
- ✅ Scripts SQL en `/backend/schemas/` (migraciones)

**NO PUEDES TOCAR:**
- ❌ `/frontend/**/*` (otro agente se encarga)
- ❌ `/backend/api/deps/auth.py` (autenticación ya funciona, no la rompas)
- ❌ Estructura de tablas existentes (solo AGREGAR columnas, no modificar/eliminar)
- ❌ `/backend/agents/**/*` (LangGraph ya funciona)
- ❌ Archivos de configuración Docker

---

## 📋 TAREAS PRIORITARIAS

### **FASE 1: AGREGAR SOPORTE DE API KEYS EN BASE DE DATOS**

**Objetivo:** Extender el modelo `SysUsuario` para almacenar API Keys de Gemini encriptadas.

#### **TAREA 1.1: Modificar modelo SysUsuario**

**Archivo:** `backend/schemas/auth/models.py`

**Agregar después de la línea 48 (después de `clinica` relationship):**

```python
# backend/schemas/auth/models.py

class SysUsuario(Base):
    __tablename__ = "sys_usuarios"
    __table_args__ = {"schema": "auth"}

    id_usuario = Column(BigInteger, primary_key=True, autoincrement=True)
    nombre_usuario = Column(String(50), nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    rol = Column(String, nullable=False)
    activo = Column(Boolean, default=True)
    email = Column(String, unique=True)
    last_login = Column(TIMESTAMP(timezone=True))
    failed_login_attempts = Column(BigInteger, default=0)
    locked_until = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # FK a Clinica
    clinica_id = Column(BigInteger, ForeignKey("auth.clinicas.id_clinica"), nullable=True)
    clinica = relationship("Clinica", back_populates="usuarios")
    
    # ======== NUEVO: Campos para API Key de Gemini ========
    gemini_api_key_encrypted = Column(String(500), nullable=True, comment="API Key de Gemini encriptada con Fernet")
    gemini_api_key_updated_at = Column(TIMESTAMP(timezone=True), nullable=True, comment="Última actualización de la API Key")
    gemini_api_key_last_validated = Column(TIMESTAMP(timezone=True), nullable=True, comment="Última validación exitosa de la API Key")
    # ======================================================
```

#### **TAREA 1.2: Crear migración SQL**

**Crear archivo:** `backend/schemas/migrations/002_add_gemini_api_key.sql`

```sql
-- backend/schemas/migrations/002_add_gemini_api_key.sql
-- Migración: Agregar campos para API Key de Gemini
-- Fecha: 2024-12-12
-- Autor: Agente Backend

-- Agregar columnas al modelo SysUsuario
ALTER TABLE auth.sys_usuarios
ADD COLUMN IF NOT EXISTS gemini_api_key_encrypted VARCHAR(500),
ADD COLUMN IF NOT EXISTS gemini_api_key_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS gemini_api_key_last_validated TIMESTAMPTZ;

-- Agregar comentarios para documentación
COMMENT ON COLUMN auth.sys_usuarios.gemini_api_key_encrypted IS 'API Key de Gemini encriptada con Fernet';
COMMENT ON COLUMN auth.sys_usuarios.gemini_api_key_updated_at IS 'Última actualización de la API Key';
COMMENT ON COLUMN auth.sys_usuarios.gemini_api_key_last_validated IS 'Última validación exitosa contra API de Gemini';

-- Crear índice para búsquedas por usuarios con API Key configurada
CREATE INDEX IF NOT EXISTS idx_usuarios_gemini_key 
ON auth.sys_usuarios(id_usuario) 
WHERE gemini_api_key_encrypted IS NOT NULL;
```

**Ejecutar migración manualmente:**
```bash
# Conectar a la base de datos
docker exec -it podoskin-db psql -U podoskin -d clinica_auth_db

# Ejecutar el script
\i /path/to/002_add_gemini_api_key.sql

# Verificar
\d auth.sys_usuarios
```

#### **CRITERIOS DE ACEPTACIÓN FASE 1:**
- ✅ Modelo `SysUsuario` tiene 3 nuevas columnas
- ✅ Script SQL ejecutado exitosamente
- ✅ Columnas existen en la base de datos
- ✅ No se rompieron relaciones existentes

---

### **FASE 2: CREAR SERVICIO DE ENCRIPTACIÓN**

**Objetivo:** Implementar encriptación segura con Fernet para proteger las API Keys.

#### **TAREA 2.1: Agregar librería cryptography**

**Archivo:** `backend/requirements.txt`

**Agregar:**
```txt
cryptography==41.0.7
```

**Instalar:**
```bash
cd backend
pip install cryptography==41.0.7
```

#### **TAREA 2.2: Agregar clave de encriptación en configuración**

**Archivo:** `backend/api/core/config.py`

**Agregar después de la línea 107 (después de `FROM_EMAIL`):**

```python
# backend/api/core/config.py

class Settings(BaseSettings):
    # ... configuración existente ...
    
    # ========== Encryption Configuration ==========
    # Clave de encriptación para API Keys (Fernet)
    # IMPORTANTE: Generar con: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    # En producción, usar variable de entorno y rotarla periódicamente
    ENCRYPTION_KEY: str = "TU_CLAVE_FERNET_AQUI_CAMBIAR_EN_PRODUCCION"
    
    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"
        extra = "ignore"
```

**Generar clave para `.env`:**
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

**Agregar a `backend/.env`:**
```bash
ENCRYPTION_KEY=yZ7xN8P2Jk4Lm9Rt5Qs6Wn3Xv1Hb0Gc8Fd7Ea5Zb4=
```

#### **TAREA 2.3: Crear servicio de encriptación**

**Crear archivo:** `backend/api/core/encryption.py`

```python
# backend/api/core/encryption.py
"""
Servicio de encriptación para API Keys y datos sensibles.
Usa Fernet (symmetric encryption) de cryptography.
"""

import logging
from cryptography.fernet import Fernet, InvalidToken
from backend.api.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Inicializar cipher con la clave de configuración
try:
    _cipher = Fernet(settings.ENCRYPTION_KEY.encode())
except Exception as e:
    logger.error(f"Error inicializando cipher de encriptación: {e}")
    logger.warning("USANDO CLAVE DE ENCRIPTACIÓN DE DESARROLLO - NO USAR EN PRODUCCIÓN")
    # Fallback a una clave de desarrollo (solo para testing local)
    _cipher = Fernet(Fernet.generate_key())


def encrypt_api_key(plain_key: str) -> str:
    """
    Encripta una API Key en texto plano.
    
    Args:
        plain_key: API Key en texto plano
        
    Returns:
        API Key encriptada en formato string
        
    Raises:
        ValueError: Si la API Key está vacía
        Exception: Si falla la encriptación
    """
    if not plain_key or not plain_key.strip():
        raise ValueError("La API Key no puede estar vacía")
    
    try:
        encrypted_bytes = _cipher.encrypt(plain_key.encode())
        return encrypted_bytes.decode()
    except Exception as e:
        logger.error(f"Error encriptando API Key: {e}")
        raise Exception("Error al encriptar la API Key")


def decrypt_api_key(encrypted_key: str) -> str:
    """
    Desencripta una API Key.
    
    Args:
        encrypted_key: API Key encriptada
        
    Returns:
        API Key en texto plano
        
    Raises:
        ValueError: Si la API Key encriptada está vacía
        InvalidToken: Si la API Key no puede desencriptarse (corrupta o clave incorrecta)
    """
    if not encrypted_key or not encrypted_key.strip():
        raise ValueError("La API Key encriptada no puede estar vacía")
    
    try:
        decrypted_bytes = _cipher.decrypt(encrypted_key.encode())
        return decrypted_bytes.decode()
    except InvalidToken:
        logger.error("Token inválido al desencriptar API Key")
        raise InvalidToken("La API Key no pudo ser desencriptada (posiblemente corrupta)")
    except Exception as e:
        logger.error(f"Error desencriptando API Key: {e}")
        raise Exception("Error al desencriptar la API Key")


def validate_encryption_key() -> bool:
    """
    Valida que la clave de encriptación funcione correctamente.
    
    Returns:
        True si la encriptación/desencriptación funciona
    """
    try:
        test_data = "test_api_key_validation"
        encrypted = encrypt_api_key(test_data)
        decrypted = decrypt_api_key(encrypted)
        return decrypted == test_data
    except Exception as e:
        logger.error(f"Error validando clave de encriptación: {e}")
        return False
```

#### **TAREA 2.4: Agregar validador de API Key de Gemini**

**Crear archivo:** `backend/api/services/gemini_validator.py`

```python
# backend/api/services/gemini_validator.py
"""
Validador de API Keys de Google Gemini.
Verifica que la API Key sea válida antes de almacenarla.
"""

import logging
import httpx
from typing import Tuple

logger = logging.getLogger(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"


async def validate_gemini_api_key(api_key: str) -> Tuple[bool, str]:
    """
    Valida una API Key de Gemini contra la API de Google.
    
    Args:
        api_key: API Key a validar
        
    Returns:
        Tuple (is_valid: bool, message: str)
        
    Ejemplo:
        is_valid, msg = await validate_gemini_api_key("AIza...")
        if is_valid:
            print("API Key válida")
    """
    if not api_key or len(api_key) < 20:
        return False, "API Key demasiado corta o vacía"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Hacer una petición simple para verificar que la key funciona
            response = await client.get(
                f"{GEMINI_API_URL}?key={api_key}"
            )
            
            if response.status_code == 200:
                logger.info("API Key de Gemini validada exitosamente")
                return True, "API Key válida"
            elif response.status_code == 400:
                return False, "API Key inválida o expirada"
            elif response.status_code == 429:
                # Rate limit - pero la key es válida
                logger.warning("Rate limit en validación de Gemini, asumiendo válida")
                return True, "API Key válida (rate limit)"
            else:
                logger.warning(f"Respuesta inesperada de Gemini: {response.status_code}")
                return False, f"Error al validar API Key (código {response.status_code})"
                
    except httpx.TimeoutException:
        logger.error("Timeout validando API Key de Gemini")
        return False, "Timeout al validar API Key"
    except Exception as e:
        logger.error(f"Error validando API Key de Gemini: {e}")
        return False, "Error al validar API Key"
```

**Agregar httpx a requirements.txt:**
```txt
httpx==0.25.2
```

#### **CRITERIOS DE ACEPTACIÓN FASE 2:**
- ✅ Servicio de encriptación creado y funcional
- ✅ Puede encriptar y desencriptar API Keys
- ✅ Validador de Gemini implementado
- ✅ Maneja errores apropiadamente

---

### **FASE 3: CREAR ENDPOINTS PARA GESTIÓN DE API KEYS**

**Objetivo:** Permitir que usuarios actualicen, obtengan y eliminen su API Key de Gemini.

#### **TAREA 3.1: Agregar schemas Pydantic**

**Archivo:** `backend/schemas/auth/schemas.py`

**Agregar al final del archivo:**

```python
# backend/schemas/auth/schemas.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# ... schemas existentes ...

# ============================================================================
# SCHEMAS PARA API KEY DE GEMINI
# ============================================================================

class GeminiKeyUpdate(BaseModel):
    """Request para actualizar API Key de Gemini."""
    api_key: str = Field(
        ..., 
        min_length=20, 
        max_length=200,
        description="API Key de Google Gemini"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "api_key": "AIzaSyC1234567890abcdefghijklmnopqrstuv"
            }
        }


class GeminiKeyStatus(BaseModel):
    """Response con estado de la API Key."""
    has_key: bool = Field(..., description="Si el usuario tiene API Key configurada")
    is_valid: Optional[bool] = Field(None, description="Si la API Key es válida (solo si has_key=True)")
    last_updated: Optional[datetime] = Field(None, description="Última actualización")
    last_validated: Optional[datetime] = Field(None, description="Última validación exitosa")
    
    class Config:
        json_schema_extra = {
            "example": {
                "has_key": True,
                "is_valid": True,
                "last_updated": "2024-12-12T10:30:00Z",
                "last_validated": "2024-12-12T10:30:00Z"
            }
        }
```

#### **TAREA 3.2: Agregar endpoints en usuarios.py**

**Archivo:** `backend/api/routes/usuarios.py`

**Agregar al final del archivo (antes de `def get_router()` si existe):**

```python
# backend/api/routes/usuarios.py

from backend.api.core.encryption import encrypt_api_key, decrypt_api_key
from backend.api.services.gemini_validator import validate_gemini_api_key
from backend.schemas.auth.schemas import GeminiKeyUpdate, GeminiKeyStatus
from sqlalchemy.sql import func as sql_func

# ... código existente ...


# =============================================================================
# ENDPOINT: GET /usuarios/{id}/gemini-key/status
# =============================================================================

@router.get("/{usuario_id}/gemini-key/status", response_model=GeminiKeyStatus)
async def get_gemini_key_status(
    usuario_id: int,
    current_user: SysUsuario = Depends(get_current_active_user),
    db: Session = Depends(get_auth_db)
):
    """
    Obtiene el estado de la API Key de Gemini del usuario.
    
    **Permisos:** 
    - Usuario solo puede ver su propio estado
    - Admin puede ver el estado de cualquier usuario
    """
    # Solo el propio usuario o Admin
    if usuario_id != current_user.id_usuario and current_user.rol != ROLE_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta información"
        )
    
    usuario = db.query(SysUsuario).filter(
        SysUsuario.id_usuario == usuario_id
    ).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    has_key = bool(usuario.gemini_api_key_encrypted)
    
    # Si tiene key, verificar si es válida
    is_valid = None
    if has_key:
        try:
            decrypted_key = decrypt_api_key(usuario.gemini_api_key_encrypted)
            is_valid, _ = await validate_gemini_api_key(decrypted_key)
        except Exception as e:
            logger.error(f"Error validando API Key para usuario {usuario_id}: {e}")
            is_valid = False
    
    return GeminiKeyStatus(
        has_key=has_key,
        is_valid=is_valid,
        last_updated=usuario.gemini_api_key_updated_at,
        last_validated=usuario.gemini_api_key_last_validated
    )


# =============================================================================
# ENDPOINT: PUT /usuarios/{id}/gemini-key
# =============================================================================

@router.put("/{usuario_id}/gemini-key")
async def update_gemini_key(
    usuario_id: int,
    data: GeminiKeyUpdate,
    current_user: SysUsuario = Depends(get_current_active_user),
    db: Session = Depends(get_auth_db)
):
    """
    Actualiza la API Key de Gemini del usuario.
    
    **Permisos:** 
    - Usuario solo puede actualizar su propia API Key
    - Admin puede actualizar la API Key de cualquier usuario
    
    **Seguridad:**
    - La API Key se valida contra la API de Gemini antes de guardar
    - Se encripta con Fernet antes de almacenar en BD
    - Se audita la operación
    """
    # Solo el propio usuario o Admin
    if usuario_id != current_user.id_usuario and current_user.rol != ROLE_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar esta API Key"
        )
    
    usuario = db.query(SysUsuario).filter(
        SysUsuario.id_usuario == usuario_id
    ).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Validar API Key contra Gemini
    logger.info(f"Validando API Key de Gemini para usuario {usuario_id}")
    is_valid, validation_message = await validate_gemini_api_key(data.api_key)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"API Key inválida: {validation_message}"
        )
    
    # Encriptar y guardar
    try:
        encrypted_key = encrypt_api_key(data.api_key)
        
        usuario.gemini_api_key_encrypted = encrypted_key
        usuario.gemini_api_key_updated_at = sql_func.now()
        usuario.gemini_api_key_last_validated = sql_func.now()
        
        db.commit()
        
        logger.info(f"API Key de Gemini actualizada para usuario {usuario_id}")
        
        return {
            "message": "API Key de Gemini actualizada exitosamente",
            "status": "valid",
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error guardando API Key encriptada: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al guardar la API Key"
        )


# =============================================================================
# ENDPOINT: DELETE /usuarios/{id}/gemini-key
# =============================================================================

@router.delete("/{usuario_id}/gemini-key")
async def delete_gemini_key(
    usuario_id: int,
    current_user: SysUsuario = Depends(get_current_active_user),
    db: Session = Depends(get_auth_db)
):
    """
    Elimina la API Key de Gemini del usuario.
    
    **Permisos:** 
    - Usuario solo puede eliminar su propia API Key
    - Admin puede eliminar la API Key de cualquier usuario
    """
    # Solo el propio usuario o Admin
    if usuario_id != current_user.id_usuario and current_user.rol != ROLE_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta API Key"
        )
    
    usuario = db.query(SysUsuario).filter(
        SysUsuario.id_usuario == usuario_id
    ).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    if not usuario.gemini_api_key_encrypted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Este usuario no tiene API Key configurada"
        )
    
    # Eliminar
    usuario.gemini_api_key_encrypted = None
    usuario.gemini_api_key_updated_at = None
    usuario.gemini_api_key_last_validated = None
    
    db.commit()
    
    logger.info(f"API Key de Gemini eliminada para usuario {usuario_id}")
    
    return {
        "message": "API Key de Gemini eliminada exitosamente"
    }
```

**Agregar imports necesarios al inicio del archivo:**
```python
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
```

#### **CRITERIOS DE ACEPTACIÓN FASE 3:**
- ✅ Endpoint `GET /usuarios/{id}/gemini-key/status` funciona
- ✅ Endpoint `PUT /usuarios/{id}/gemini-key` valida y guarda API Key encriptada
- ✅ Endpoint `DELETE /usuarios/{id}/gemini-key` elimina API Key
- ✅ Solo el usuario o Admin pueden gestionar la API Key
- ✅ Validación contra Gemini API funciona

---

### **FASE 4: MODIFICAR LOGIN PARA CARGAR ESTADO DE API KEY**

**Objetivo:** Al hacer login, el backend debe informar si el usuario tiene API Key configurada.

#### **TAREA 4.1: Modificar endpoint de login**

**Archivo:** `backend/api/routes/auth.py`

**Modificar la función `login()` para agregar info de API Key:**

```python
# backend/api/routes/auth.py

# Agregar import
from backend.api.core.encryption import decrypt_api_key
from backend.api.services.gemini_validator import validate_gemini_api_key

# Modificar el return del endpoint login (línea ~120 aproximadamente)
@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_auth_db)
):
    # ... código de autenticación existente ...
    
    # Actualizar last_login
    usuario.last_login = datetime.utcnow()
    usuario.failed_login_attempts = 0
    db.commit()
    
    # NUEVO: Verificar estado de API Key de Gemini
    has_gemini_key = bool(usuario.gemini_api_key_encrypted)
    gemini_key_status = None
    
    if has_gemini_key:
        try:
            # Desencriptar y validar
            decrypted_key = decrypt_api_key(usuario.gemini_api_key_encrypted)
            is_valid, _ = await validate_gemini_api_key(decrypted_key)
            
            gemini_key_status = "valid" if is_valid else "invalid"
            
            if is_valid:
                # Actualizar timestamp de validación
                usuario.gemini_api_key_last_validated = datetime.utcnow()
                db.commit()
            else:
                logger.warning(f"API Key de Gemini inválida para usuario {usuario.id_usuario}")
        except Exception as e:
            logger.error(f"Error validando API Key en login: {e}")
            gemini_key_status = "error"
    
    # Crear token
    access_token = create_access_token(data={"sub": usuario.nombre_usuario})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id_usuario": usuario.id_usuario,
            "nombre_usuario": usuario.nombre_usuario,
            "email": usuario.email,
            "rol": usuario.rol,
            "clinica_id": usuario.clinica_id,
            # NUEVO: Info de API Key de Gemini
            "has_gemini_key": has_gemini_key,
            "gemini_key_status": gemini_key_status
        }
    }
```

#### **CRITERIOS DE ACEPTACIÓN FASE 4:**
- ✅ Login retorna `has_gemini_key` (bool)
- ✅ Login retorna `gemini_key_status` ("valid", "invalid", "error", o null)
- ✅ Se actualiza `gemini_api_key_last_validated` si la key es válida
- ✅ No se rompe el flujo de login existente

---

### **FASE 5: CREAR CATÁLOGO DE COMANDOS DINÁMICO**

**Objetivo:** Exponer un endpoint que liste todos los comandos disponibles para el chatbot.

#### **TAREA 5.1: Crear catálogo de comandos**

**Archivo:** `backend/api/routes/chat.py`

**Agregar después de la línea 188 (después de `get_capabilities()`):**

```python
# backend/api/routes/chat.py

# ============================================================================
# CATÁLOGO DE COMANDOS DISPONIBLES
# ============================================================================

COMMAND_CATALOG = [
    {
        "id": "list_appointments_today",
        "name": "Listar citas de hoy",
        "description": "Obtiene todas las citas programadas para el día actual",
        "category": "Citas",
        "examples": [
            "Citas de hoy",
            "¿Qué citas tengo hoy?",
            "Muéstrame la agenda de hoy",
            "¿Cuántas citas hay hoy?"
        ],
        "backend_function": "get_todays_appointments",
        "endpoint": "/citas",
        "method": "GET",
        "params": {"fecha_inicio": "{today}", "fecha_fin": "{today}"},
        "required_role": ["Admin", "Podologo", "Recepcion"],
        "response_format": "list"
    },
    {
        "id": "search_patient",
        "name": "Buscar paciente",
        "description": "Busca pacientes por nombre, apellido o teléfono",
        "category": "Pacientes",
        "examples": [
            "Busca al paciente Juan",
            "Encuentra a María García",
            "¿Quién es el paciente con teléfono 555-1234?"
        ],
        "backend_function": "search_patient",
        "endpoint": "/pacientes",
        "method": "GET",
        "params": {"busqueda": "{query}"},
        "required_role": ["Admin", "Podologo"],
        "response_format": "list"
    },
    {
        "id": "get_active_treatments",
        "name": "Listar tratamientos activos",
        "description": "Obtiene la lista de todos los tratamientos en estado activo",
        "category": "Tratamientos",
        "examples": [
            "Tratamientos activos",
            "¿Qué tratamientos están en curso?",
            "Muéstrame los tratamientos abiertos"
        ],
        "backend_function": "get_active_treatments",
        "endpoint": "/tratamientos",
        "method": "GET",
        "params": {"estado": "activo"},
        "required_role": ["Admin", "Podologo"],
        "response_format": "list"
    },
    {
        "id": "create_patient",
        "name": "Crear nuevo paciente",
        "description": "Registra un nuevo paciente en el sistema",
        "category": "Pacientes",
        "examples": [
            "Crea un paciente llamado Juan Pérez",
            "Registra un nuevo paciente",
            "Quiero dar de alta un paciente"
        ],
        "backend_function": "create_patient",
        "endpoint": "/pacientes",
        "method": "POST",
        "body_schema": {
            "nombres": {"type": "string", "required": True},
            "apellidos": {"type": "string", "required": True},
            "telefono": {"type": "string", "required": True},
            "email": {"type": "string", "required": False},
            "fecha_nacimiento": {"type": "date", "required": False}
        },
        "required_role": ["Admin", "Podologo"],
        "response_format": "object"
    },
    {
        "id": "schedule_appointment",
        "name": "Agendar cita",
        "description": "Programa una nueva cita para un paciente",
        "category": "Citas",
        "examples": [
            "Agenda una cita",
            "Quiero agendar una cita para mañana",
            "Programa una consulta"
        ],
        "backend_function": "schedule_appointment",
        "endpoint": "/citas",
        "method": "POST",
        "body_schema": {
            "paciente_id": {"type": "number", "required": True},
            "podologo_id": {"type": "number", "required": True},
            "fecha_hora": {"type": "datetime", "required": True},
            "motivo": {"type": "string", "required": False}
        },
        "required_role": ["Admin", "Podologo", "Recepcion"],
        "response_format": "object"
    },
    {
        "id": "list_services",
        "name": "Listar servicios",
        "description": "Obtiene el catálogo de servicios disponibles",
        "category": "Servicios",
        "examples": [
            "¿Qué servicios ofrecen?",
            "Lista de servicios",
            "Muéstrame los servicios disponibles"
        ],
        "backend_function": "get_services",
        "endpoint": "/servicios",
        "method": "GET",
        "params": {},
        "required_role": ["Admin", "Podologo", "Recepcion"],
        "response_format": "list"
    },
    {
        "id": "get_patient_history",
        "name": "Ver historial de paciente",
        "description": "Obtiene el historial clínico completo de un paciente",
        "category": "Pacientes",
        "examples": [
            "Historial del paciente 123",
            "Muéstrame el expediente de Juan",
            "¿Qué tratamientos ha tenido el paciente?"
        ],
        "backend_function": "get_patient_history",
        "endpoint": "/pacientes/{id}/historial",
        "method": "GET",
        "params": {"paciente_id": "{id}"},
        "required_role": ["Admin", "Podologo"],
        "response_format": "object"
    }
]


@router.get("/commands", summary="Catálogo de comandos disponibles")
async def get_command_catalog(
    current_user: SysUsuario = Depends(get_current_active_user)
):
    """
    Devuelve el catálogo completo de comandos disponibles para el chatbot.
    
    Filtra los comandos según el rol del usuario actual.
    
    **Uso:**
    - Frontend carga este catálogo al iniciar el chat
    - Mapea function calls de Gemini a endpoints del backend
    - Muestra ejemplos al usuario
    
    **Respuesta:**
    - Lista de comandos con toda la metadata necesaria
    - Filtrado por permisos del usuario
    """
    # Filtrar comandos por rol del usuario
    available_commands = [
        cmd for cmd in COMMAND_CATALOG
        if current_user.rol in cmd["required_role"]
    ]
    
    return {
        "total": len(available_commands),
        "commands": available_commands,
        "user_role": current_user.rol,
        "user_id": current_user.id_usuario
    }


@router.get("/commands/{command_id}", summary="Detalle de un comando específico")
async def get_command_detail(
    command_id: str,
    current_user: SysUsuario = Depends(get_current_active_user)
):
    """
    Obtiene el detalle de un comando específico.
    """
    command = next(
        (cmd for cmd in COMMAND_CATALOG if cmd["id"] == command_id),
        None
    )
    
    if not command:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comando {command_id} no encontrado"
        )
    
    # Verificar permisos
    if current_user.rol not in command["required_role"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para usar este comando"
        )
    
    return command
```

#### **CRITERIOS DE ACEPTACIÓN FASE 5:**
- ✅ Endpoint `GET /chat/commands` retorna lista de comandos
- ✅ Comandos filtrados por rol del usuario
- ✅ Cada comando tiene metadata completa (examples, endpoint, params)
- ✅ Endpoint `GET /chat/commands/{id}` retorna detalle

---

## 🧪 CÓMO PROBAR TU TRABAJO

### **Verificación con cURL/HTTPie:**

```bash
# 1. Login (obtener token)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"

# Guardar el token
export TOKEN="eyJ0eXAi..."

# 2. Actualizar API Key de Gemini
curl -X PUT http://localhost:8000/api/v1/usuarios/1/gemini-key \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api_key":"AIzaSyC1234567890abcdefghijklmnopqrstuv"}'

# 3. Ver estado de API Key
curl -X GET http://localhost:8000/api/v1/usuarios/1/gemini-key/status \
  -H "Authorization: Bearer $TOKEN"

# 4. Obtener catálogo de comandos
curl -X GET http://localhost:8000/api/v1/chat/commands \
  -H "Authorization: Bearer $TOKEN"

# 5. Eliminar API Key
curl -X DELETE http://localhost:8000/api/v1/usuarios/1/gemini-key \
  -H "Authorization: Bearer $TOKEN"
```

### **Verificación en Base de Datos:**

```sql
-- Conectar a la BD
docker exec -it podoskin-db psql -U podoskin -d clinica_auth_db

-- Verificar columnas agregadas
\d auth.sys_usuarios

-- Ver usuarios con API Key configurada
SELECT 
    id_usuario,
    nombre_usuario,
    CASE 
        WHEN gemini_api_key_encrypted IS NOT NULL THEN 'Sí' 
        ELSE 'No' 
    END as tiene_api_key,
    gemini_api_key_updated_at,
    gemini_api_key_last_validated
FROM auth.sys_usuarios;

-- Verificar que la API Key esté encriptada (no legible)
SELECT 
    nombre_usuario,
    LEFT(gemini_api_key_encrypted, 50) as encrypted_preview
FROM auth.sys_usuarios
WHERE gemini_api_key_encrypted IS NOT NULL;
```

### **Prueba de Encriptación:**

```python
# En Python shell o script de prueba
from backend.api.core.encryption import encrypt_api_key, decrypt_api_key, validate_encryption_key

# Validar que la encriptación funcione
assert validate_encryption_key() == True

# Probar encriptar/desencriptar
test_key = "AIzaSyC1234567890abcdefghijklmnopqrstuv"
encrypted = encrypt_api_key(test_key)
print(f"Encriptada: {encrypted}")

decrypted = decrypt_api_key(encrypted)
assert decrypted == test_key
print("✅ Encriptación funciona correctamente")
```

---

## ⚠️ LIMITACIONES Y REGLAS

### **NO HAGAS:**
- ❌ NO modifiques archivos del frontend
- ❌ NO elimines columnas existentes de la BD
- ❌ NO cambies la lógica de autenticación (auth.py)
- ❌ NO expongas API Keys en logs
- ❌ NO almacenes API Keys sin encriptar
- ❌ NO rompas endpoints existentes
- ❌ NO cambies el esquema de respuesta de endpoints existentes

### **SÍ PUEDES:**
- ✅ Agregar columnas a tablas existentes
- ✅ Crear nuevos endpoints
- ✅ Agregar schemas Pydantic
- ✅ Mejorar mensajes de error
- ✅ Agregar logging (con `logger.info()`, `.warning()`, `.error()`)
- ✅ Crear archivos de migración SQL

### **SEGURIDAD - IMPORTANTE:**
- 🔒 NUNCA loguees API Keys completas (solo los primeros 10 caracteres)
- 🔒 SIEMPRE valida la API Key antes de guardarla
- 🔒 SIEMPRE encripta antes de almacenar en BD
- 🔒 Usa `sql_func.now()` para timestamps (no `datetime.utcnow()` manual)
- 🔒 Audita operaciones sensibles (crear/modificar/eliminar API Keys)

---

## 📤 ENTREGA

### **Cuando termines:**

1. **Verifica que funcione:**
   - ✅ Migración SQL ejecutada
   - ✅ Endpoints de API Key funcionan
   - ✅ Encriptación/desencriptación funcional
   - ✅ Catálogo de comandos accesible
   - ✅ Login retorna info de API Key
   - ✅ Validación contra Gemini funciona

2. **Ejecuta los tests:**
```bash
cd backend
pytest tests/unit/test_usuarios_endpoints.py -v
pytest tests/unit/test_auth_endpoints.py::test_login -v
```

3. **Haz commit de tus cambios:**
```bash
git add backend/schemas/auth/models.py
git add backend/schemas/auth/schemas.py
git add backend/schemas/migrations/002_add_gemini_api_key.sql
git add backend/api/core/encryption.py
git add backend/api/core/config.py
git add backend/api/services/gemini_validator.py
git add backend/api/routes/usuarios.py
git add backend/api/routes/auth.py
git add backend/api/routes/chat.py
git add backend/requirements.txt
git commit -m "feat(backend): Agregar gestión de API Keys de Gemini y catálogo de comandos"
```

4. **NO hagas push aún** - esperamos revisión del otro agente

5. **Documenta:**
   - Archivos modificados
   - Archivos creados
   - Migraciones SQL ejecutadas
   - Tests que pasaron
   - Problemas encontrados (si los hay)

---

## 📚 RECURSOS ÚTILES

**Documentación del proyecto:**
- `/ANALISIS_REQUISITOS_CHAT_VOZ.md` - Análisis completo
- `/backend/README.md` - Documentación del backend
- `/Docs/` - Especificaciones técnicas

**Endpoints existentes que debes conocer:**
- `POST /api/v1/auth/login` - Login (LO VAS A MODIFICAR)
- `GET /api/v1/usuarios` - Listar usuarios
- `POST /api/v1/chat` - Enviar mensaje al agente
- `GET /api/v1/pacientes` - Listar pacientes
- `GET /api/v1/citas` - Listar citas

**Variables de entorno importantes:**
- `AUTH_DB_URL` - Conexión a clinica_auth_db
- `ENCRYPTION_KEY` - Clave Fernet (DEBES GENERAR Y CONFIGURAR)
- `ANTHROPIC_API_KEY` - Claude API (ya existe)

**Comandos útiles:**
```bash
# Ver logs del backend
docker logs -f podoskin-backend

# Reiniciar backend
docker restart podoskin-backend

# Conectar a BD
docker exec -it podoskin-db psql -U podoskin -d clinica_auth_db

# Ejecutar tests
cd backend && pytest -v

# Ver coverage
pytest --cov=backend/api --cov-report=html
```

---

## 🆘 SI TIENES PROBLEMAS

1. **Error de importación (ModuleNotFoundError):**
   - Instala las dependencias: `pip install -r requirements.txt`
   - Verifica que estés en el entorno virtual

2. **Error de encriptación (InvalidToken):**
   - Genera una nueva clave Fernet
   - Asegúrate de que `ENCRYPTION_KEY` esté en `.env`

3. **Error al validar Gemini API:**
   - Verifica conexión a internet
   - Usa una API Key de prueba válida
   - Revisa logs para ver el error HTTP exacto

4. **Error en migración SQL:**
   - Verifica que la sintaxis SQL sea correcta
   - Usa `IF NOT EXISTS` para evitar errores si ya existe
   - Ejecuta línea por línea para identificar el problema

5. **Timeout en httpx:**
   - Aumenta el timeout: `httpx.AsyncClient(timeout=30.0)`
   - Considera hacer la validación asíncrona en background

---

## ✅ CHECKLIST FINAL

Antes de marcar como completo, verifica:

- [ ] Modelo `SysUsuario` tiene 3 nuevas columnas
- [ ] Script SQL de migración ejecutado exitosamente
- [ ] Servicio de encriptación funciona (encrypt/decrypt)
- [ ] Validador de Gemini implementado
- [ ] Endpoint `GET /usuarios/{id}/gemini-key/status` funciona
- [ ] Endpoint `PUT /usuarios/{id}/gemini-key` valida y guarda
- [ ] Endpoint `DELETE /usuarios/{id}/gemini-key` elimina
- [ ] Login retorna `has_gemini_key` y `gemini_key_status`
- [ ] Endpoint `GET /chat/commands` retorna catálogo
- [ ] Comandos filtrados por rol correctamente
- [ ] No hay API Keys en logs
- [ ] Tests relevantes pasan
- [ ] No se rompió funcionalidad existente
- [ ] Código comentado en partes complejas

---

**¡Éxito en tu misión! 🚀**

Si tienes dudas, revisa `/ANALISIS_REQUISITOS_CHAT_VOZ.md` para más contexto.
