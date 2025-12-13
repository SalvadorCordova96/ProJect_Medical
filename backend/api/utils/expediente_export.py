# backend/api/utils/expediente_export.py
"""
Generador de Expedientes Médicos en HTML y PDF

Este módulo permite:
1. Generar expedientes en HTML elegante y formal
2. Convertir HTML a PDF para impresión
3. Preparar la estructura para futura conversión a HL7 CDA

Uso:
    exporter = ExpedienteExporter()
    html = exporter.generate_html(paciente_id, opciones)
    pdf = exporter.generate_pdf(paciente_id, opciones)
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any
from jinja2 import Template
import base64
from io import BytesIO


class ExpedienteExporter:
    """Generador de expedientes médicos en múltiples formatos."""
    
    # =========================================================================
    # PLANTILLA HTML ELEGANTE Y FORMAL
    # =========================================================================
    
    HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expediente Clínico - {{ paciente.nombres }} {{ paciente.apellidos }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #2c3e50;
            background: #ffffff;
            padding: 20mm;
        }
        
        /* Encabezado del documento */
        .header {
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 15px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            max-height: 80px;
        }
        
        .clinic-info {
            text-align: right;
        }
        
        .clinic-name {
            font-size: 20pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .clinic-details {
            font-size: 10pt;
            color: #7f8c8d;
        }
        
        /* Título principal */
        .document-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            color: #2c3e50;
            margin: 20px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .document-subtitle {
            text-align: center;
            font-size: 12pt;
            color: #7f8c8d;
            margin-bottom: 30px;
        }
        
        /* Secciones */
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #ffffff;
            background: #34495e;
            padding: 10px 15px;
            margin-bottom: 15px;
            border-left: 5px solid #3498db;
        }
        
        .subsection-title {
            font-size: 12pt;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 5px;
            margin: 15px 0 10px 0;
        }
        
        /* Tabla de datos */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        
        .data-table tr {
            border-bottom: 1px solid #ecf0f1;
        }
        
        .data-table td {
            padding: 8px 10px;
        }
        
        .data-label {
            font-weight: 600;
            color: #34495e;
            width: 180px;
            vertical-align: top;
        }
        
        .data-value {
            color: #2c3e50;
        }
        
        .data-value.highlight {
            background: #fff3cd;
            padding: 3px 6px;
            border-radius: 3px;
            font-weight: 600;
        }
        
        /* Tabla de evoluciones */
        .evolutions-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10pt;
        }
        
        .evolutions-table th {
            background: #34495e;
            color: #ffffff;
            padding: 10px;
            text-align: left;
            font-weight: 600;
        }
        
        .evolutions-table td {
            padding: 10px;
            border-bottom: 1px solid #ecf0f1;
            vertical-align: top;
        }
        
        .evolutions-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .evolutions-table tr:hover {
            background: #e8f4f8;
        }
        
        /* Nota SOAP */
        .soap-note {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
        }
        
        .soap-section {
            margin-bottom: 12px;
        }
        
        .soap-label {
            font-weight: bold;
            color: #2c3e50;
            display: inline-block;
            min-width: 100px;
        }
        
        .soap-content {
            margin-left: 100px;
            color: #555;
        }
        
        /* Alert boxes */
        .alert {
            padding: 12px 15px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid;
        }
        
        .alert-warning {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        
        .alert-danger {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        
        .alert-info {
            background: #d1ecf1;
            border-color: #17a2b8;
            color: #0c5460;
        }
        
        .alert-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        /* Badges */
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 9pt;
            font-weight: 600;
            margin-right: 5px;
        }
        
        .badge-primary { background: #3498db; color: white; }
        .badge-success { background: #27ae60; color: white; }
        .badge-warning { background: #f39c12; color: white; }
        .badge-danger { background: #e74c3c; color: white; }
        
        /* Footer */
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
            text-align: center;
            font-size: 9pt;
            color: #7f8c8d;
        }
        
        .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-around;
        }
        
        .signature-box {
            text-align: center;
            width: 200px;
        }
        
        .signature-line {
            border-top: 2px solid #2c3e50;
            margin-top: 50px;
            padding-top: 5px;
        }
        
        /* Metadata del documento */
        .document-metadata {
            font-size: 9pt;
            color: #95a5a6;
            margin-top: 20px;
        }
        
        /* Print styles */
        @media print {
            body {
                padding: 10mm;
            }
            
            .no-print {
                display: none !important;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .header {
                position: running(header);
            }
            
            @page {
                margin: 15mm;
                @top-center {
                    content: element(header);
                }
            }
        }
        
        /* Responsive (para vista web) */
        @media screen and (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .data-label {
                width: auto;
                display: block;
                margin-bottom: 3px;
            }
            
            .evolutions-table {
                font-size: 9pt;
            }
        }
    </style>
</head>
<body>
    <!-- Encabezado -->
    <div class="header">
        <div class="clinic-info-left">
            {% if clinica.logo_url %}
            <img src="{{ clinica.logo_url }}" alt="Logo" class="logo">
            {% endif %}
        </div>
        <div class="clinic-info">
            <div class="clinic-name">{{ clinica.nombre }}</div>
            <div class="clinic-details">
                {{ clinica.direccion }}<br>
                Tel: {{ clinica.telefono }} | {{ clinica.email }}<br>
                {% if clinica.clues %}CLUES: {{ clinica.clues }}{% endif %}
            </div>
        </div>
    </div>
    
    <!-- Título del documento -->
    <div class="document-title">Expediente Clínico Electrónico</div>
    <div class="document-subtitle">Generado el {{ fecha_generacion }}</div>
    
    <!-- Datos del Paciente -->
    <div class="section">
        <div class="section-title">📋 Datos del Paciente</div>
        <table class="data-table">
            <tr>
                <td class="data-label">Número de Expediente:</td>
                <td class="data-value highlight">{{ paciente.id_paciente }}</td>
            </tr>
            <tr>
                <td class="data-label">Nombre Completo:</td>
                <td class="data-value">
                    {{ paciente.nombres }} {{ paciente.apellido_paterno }} {{ paciente.apellido_materno }}
                </td>
            </tr>
            {% if paciente.curp %}
            <tr>
                <td class="data-label">CURP:</td>
                <td class="data-value">{{ paciente.curp }}</td>
            </tr>
            {% endif %}
            <tr>
                <td class="data-label">Fecha de Nacimiento:</td>
                <td class="data-value">{{ paciente.fecha_nacimiento }} ({{ paciente.edad }} años)</td>
            </tr>
            <tr>
                <td class="data-label">Sexo:</td>
                <td class="data-value">{{ paciente.sexo }}</td>
            </tr>
            <tr>
                <td class="data-label">Teléfono:</td>
                <td class="data-value">{{ paciente.telefono }}</td>
            </tr>
            {% if paciente.email %}
            <tr>
                <td class="data-label">Correo Electrónico:</td>
                <td class="data-value">{{ paciente.email }}</td>
            </tr>
            {% endif %}
            <tr>
                <td class="data-label">Domicilio:</td>
                <td class="data-value">
                    {% if paciente.calle %}
                        {{ paciente.calle }} #{{ paciente.numero_exterior }}
                        {% if paciente.numero_interior %} Int. {{ paciente.numero_interior }}{% endif %}<br>
                        Col. {{ paciente.colonia }}, CP {{ paciente.codigo_postal }}<br>
                        {{ paciente.municipio }}, {{ paciente.entidad_federativa }}
                    {% else %}
                        {{ paciente.domicilio }}
                    {% endif %}
                </td>
            </tr>
            {% if paciente.medico_asignado %}
            <tr>
                <td class="data-label">Médico Asignado:</td>
                <td class="data-value">
                    {{ paciente.medico_asignado.nombre_completo }}
                    {% if paciente.medico_asignado.cedula_profesional %}
                    (Cédula: {{ paciente.medico_asignado.cedula_profesional }})
                    {% endif %}
                </td>
            </tr>
            {% endif %}
        </table>
    </div>
    
    <!-- Historial Médico General -->
    {% if incluir_historial and historial %}
    <div class="section">
        <div class="section-title">🏥 Historial Médico General</div>
        
        <!-- Antropometría -->
        <div class="subsection-title">Antropometría</div>
        <table class="data-table">
            <tr>
                <td class="data-label">Peso:</td>
                <td class="data-value">{{ historial.peso_kg }} kg</td>
            </tr>
            <tr>
                <td class="data-label">Talla:</td>
                <td class="data-value">{{ historial.talla_cm }} cm</td>
            </tr>
            <tr>
                <td class="data-label">IMC:</td>
                <td class="data-value">{{ historial.imc }} kg/m² 
                    {% if historial.imc %}
                        {% if historial.imc < 18.5 %}
                            <span class="badge badge-warning">Bajo peso</span>
                        {% elif historial.imc < 25 %}
                            <span class="badge badge-success">Normal</span>
                        {% elif historial.imc < 30 %}
                            <span class="badge badge-warning">Sobrepeso</span>
                        {% else %}
                            <span class="badge badge-danger">Obesidad</span>
                        {% endif %}
                    {% endif %}
                </td>
            </tr>
            {% if historial.tipos_sangre %}
            <tr>
                <td class="data-label">Tipo de Sangre:</td>
                <td class="data-value">{{ historial.tipos_sangre }}</td>
            </tr>
            {% endif %}
        </table>
        
        <!-- Antecedentes Heredofamiliares -->
        {% if historial.tiene_ahf %}
        <div class="subsection-title">Antecedentes Heredofamiliares</div>
        <div class="alert alert-info">
            <div class="alert-title">⚠️ Antecedentes Familiares Reportados</div>
            <ul style="margin-left: 20px; margin-top: 5px;">
                {% if historial.ahf_diabetes %}<li>Diabetes Mellitus</li>{% endif %}
                {% if historial.ahf_hipertension %}<li>Hipertensión Arterial</li>{% endif %}
                {% if historial.ahf_cancer %}<li>Cáncer</li>{% endif %}
                {% if historial.ahf_cardiacas %}<li>Enfermedades Cardíacas</li>{% endif %}
            </ul>
            {% if historial.ahf_detalles %}
            <p style="margin-top: 10px;"><strong>Detalles:</strong> {{ historial.ahf_detalles }}</p>
            {% endif %}
        </div>
        {% endif %}
        
        <!-- Antecedentes Personales Patológicos -->
        {% if historial.tiene_app %}
        <div class="subsection-title">Antecedentes Personales Patológicos</div>
        <div class="alert alert-warning">
            <div class="alert-title">⚠️ Condiciones Médicas Previas</div>
            <ul style="margin-left: 20px; margin-top: 5px;">
                {% if historial.app_diabetes %}
                <li>Diabetes Mellitus
                    {% if historial.app_diabetes_inicio %}(desde {{ historial.app_diabetes_inicio }}){% endif %}
                </li>
                {% endif %}
                {% if historial.app_hipertension %}<li>Hipertensión Arterial</li>{% endif %}
                {% if historial.app_cardiacas %}<li>Enfermedades Cardíacas</li>{% endif %}
                {% if historial.app_renales %}<li>Enfermedades Renales</li>{% endif %}
                {% if historial.app_cancer %}<li>Cáncer</li>{% endif %}
            </ul>
        </div>
        {% endif %}
        
        <!-- Alergias -->
        {% if historial.alergias %}
        <div class="subsection-title">Alergias</div>
        <div class="alert alert-danger">
            <div class="alert-title">🚫 ALERGIAS REPORTADAS</div>
            <p style="margin-top: 5px;">{{ historial.alergias }}</p>
        </div>
        {% endif %}
    </div>
    {% endif %}
    
    <!-- Tratamientos y Evoluciones -->
    {% if incluir_evoluciones and tratamientos %}
    <div class="section">
        <div class="section-title">📝 Tratamientos y Evoluciones Clínicas</div>
        
        {% for tratamiento in tratamientos %}
        <div class="subsection-title">
            Tratamiento #{{ tratamiento.id_tratamiento }}: {{ tratamiento.problema }}
            <span class="badge {% if tratamiento.estado == 'activo' %}badge-success{% elif tratamiento.estado == 'completado' %}badge-primary{% else %}badge-warning{% endif %}">
                {{ tratamiento.estado }}
            </span>
        </div>
        
        <table class="data-table" style="margin-bottom: 15px;">
            <tr>
                <td class="data-label">Fecha de Inicio:</td>
                <td class="data-value">{{ tratamiento.fecha_inicio }}</td>
            </tr>
            {% if tratamiento.fecha_fin %}
            <tr>
                <td class="data-label">Fecha de Fin:</td>
                <td class="data-value">{{ tratamiento.fecha_fin }}</td>
            </tr>
            {% endif %}
        </table>
        
        {% if tratamiento.evoluciones %}
        <div style="margin-left: 20px;">
            <strong style="color: #34495e;">Evoluciones Clínicas ({{ tratamiento.evoluciones|length }}):</strong>
            
            {% for evolucion in tratamiento.evoluciones %}
            <div class="soap-note">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px;">
                    <div>
                        <strong>Fecha:</strong> {{ evolucion.fecha_consulta }}
                        {% if evolucion.medico %}
                        <br><strong>Médico:</strong> {{ evolucion.medico.nombre_completo }}
                        {% if evolucion.es_atencion_interina %}
                            <span class="badge badge-warning">Interino</span>
                            {% if evolucion.motivo_medico_interino %}
                            <span style="font-size: 9pt;">({{ evolucion.motivo_medico_interino }})</span>
                            {% endif %}
                        {% endif %}
                        {% endif %}
                    </div>
                    {% if evolucion.diagnostico_cie10 %}
                    <div style="text-align: right;">
                        <span class="badge badge-info">CIE-10: {{ evolucion.diagnostico_cie10 }}</span>
                    </div>
                    {% endif %}
                </div>
                
                <div class="soap-section">
                    <span class="soap-label">Subjetivo (S):</span>
                    <div class="soap-content">{{ evolucion.subjetivo }}</div>
                </div>
                
                <div class="soap-section">
                    <span class="soap-label">Objetivo (O):</span>
                    <div class="soap-content">{{ evolucion.objetivo }}</div>
                </div>
                
                <div class="soap-section">
                    <span class="soap-label">Análisis (A):</span>
                    <div class="soap-content">{{ evolucion.analisis }}</div>
                </div>
                
                <div class="soap-section">
                    <span class="soap-label">Plan (P):</span>
                    <div class="soap-content">{{ evolucion.plan }}</div>
                </div>
            </div>
            {% endfor %}
        </div>
        {% endif %}
        {% endfor %}
    </div>
    {% endif %}
    
    <!-- Evidencia Fotográfica -->
    {% if incluir_evidencias and evidencias %}
    <div class="section">
        <div class="section-title">📷 Evidencia Fotográfica</div>
        <p style="margin-bottom: 15px; color: #7f8c8d;">
            Total de registros fotográficos: {{ evidencias|length }}
        </p>
        {% for evidencia in evidencias %}
        <div style="border: 1px solid #dee2e6; border-radius: 5px; padding: 10px; margin-bottom: 10px;">
            <strong>Fecha:</strong> {{ evidencia.fecha_captura }}<br>
            {% if evidencia.tipo_estudio %}<strong>Tipo:</strong> {{ evidencia.tipo_estudio }}<br>{% endif %}
            {% if evidencia.lateralidad %}<strong>Lateralidad:</strong> {{ evidencia.lateralidad }}<br>{% endif %}
            {% if evidencia.descripcion %}<strong>Descripción:</strong> {{ evidencia.descripcion }}{% endif %}
        </div>
        {% endfor %}
    </div>
    {% endif %}
    
    <!-- Firmas -->
    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line">
                {% if paciente.medico_asignado %}
                {{ paciente.medico_asignado.nombre_completo }}<br>
                {% if paciente.medico_asignado.cedula_profesional %}
                Cédula: {{ paciente.medico_asignado.cedula_profesional }}
                {% endif %}
                {% else %}
                Médico Tratante
                {% endif %}
            </div>
        </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <div class="document-metadata">
            <strong>Documento generado:</strong> {{ fecha_generacion }}<br>
            <strong>Usuario:</strong> {{ usuario_generador }}<br>
            <strong>Folio:</strong> {{ folio_documento }}<br>
            <strong>Hash:</strong> {{ hash_documento[:16] }}...<br>
            <em>Este expediente fue generado de manera electrónica. Para validar su autenticidad, 
            verificar el hash del documento.</em>
        </div>
    </div>
</body>
</html>
    """
    
    def __init__(self, db_session):
        """
        Inicializa el exportador.
        
        Args:
            db_session: Sesión de SQLAlchemy
        """
        self.db = db_session
        self.template = Template(self.HTML_TEMPLATE)
    
    def generate_html(
        self,
        paciente_id: int,
        incluir_historial: bool = True,
        incluir_evoluciones: bool = True,
        incluir_evidencias: bool = False,
        fecha_inicio: Optional[date] = None,
        fecha_fin: Optional[date] = None
    ) -> str:
        """
        Genera el HTML del expediente médico.
        
        Args:
            paciente_id: ID del paciente
            incluir_historial: Si incluir historial médico general
            incluir_evoluciones: Si incluir evoluciones clínicas
            incluir_evidencias: Si incluir evidencia fotográfica
            fecha_inicio: Filtro de fecha inicio (opcional)
            fecha_fin: Filtro de fecha fin (opcional)
            
        Returns:
            HTML del expediente como string
        """
        # Importar modelos (aquí para evitar circular imports)
        from backend.schemas.core.models import Paciente, HistorialMedicoGeneral, Tratamiento, EvolucionClinica, EvidenciaFotografica
        from backend.schemas.ops.models import Podologo
        from backend.schemas.auth.models import Clinica
        from sqlalchemy.orm import joinedload
        
        # Obtener paciente con todas las relaciones
        paciente = self.db.query(Paciente).options(
            joinedload(Paciente.historial_medico),
            joinedload(Paciente.tratamientos).joinedload(Tratamiento.evoluciones),
        ).filter(Paciente.id_paciente == paciente_id).first()
        
        if not paciente:
            raise ValueError(f"Paciente {paciente_id} no encontrado")
        
        # Obtener médico asignado
        medico_asignado = None
        if paciente.medico_asignado_id:
            medico_asignado = self.db.query(Podologo).get(paciente.medico_asignado_id)
        
        # Obtener clínica
        clinica = self.db.query(Clinica).first()
        
        # Calcular edad
        hoy = date.today()
        edad = hoy.year - paciente.fecha_nacimiento.year - (
            (hoy.month, hoy.day) < (paciente.fecha_nacimiento.month, paciente.fecha_nacimiento.day)
        )
        
        # Preparar datos
        datos = {
            'clinica': {
                'nombre': clinica.nombre if clinica else 'PodoSkin',
                'direccion': 'Domicilio de la Clínica',
                'telefono': '555-1234',
                'email': 'contacto@podoskin.com',
                'clues': clinica.clues if clinica and clinica.clues else None,
                'logo_url': None  # Agregar logo si existe
            },
            'fecha_generacion': datetime.now().strftime('%d de %B de %Y a las %H:%M hrs'),
            'paciente': {
                'id_paciente': paciente.id_paciente,
                'nombres': paciente.nombres,
                'apellido_paterno': paciente.apellido_paterno or paciente.apellidos.split()[0] if paciente.apellidos else '',
                'apellido_materno': paciente.apellido_materno or (paciente.apellidos.split()[1] if len(paciente.apellidos.split()) > 1 else ''),
                'curp': getattr(paciente, 'curp', None),
                'fecha_nacimiento': paciente.fecha_nacimiento.strftime('%d/%m/%Y'),
                'edad': edad,
                'sexo': 'Masculino' if paciente.sexo == 'M' else 'Femenino' if paciente.sexo == 'F' else 'No especificado',
                'telefono': paciente.telefono,
                'email': paciente.email,
                'domicilio': paciente.domicilio,
                'calle': getattr(paciente, 'calle', None),
                'numero_exterior': getattr(paciente, 'numero_exterior', None),
                'numero_interior': getattr(paciente, 'numero_interior', None),
                'colonia': getattr(paciente, 'colonia', None),
                'codigo_postal': getattr(paciente, 'codigo_postal', None),
                'municipio': getattr(paciente, 'municipio', None),
                'entidad_federativa': getattr(paciente, 'entidad_federativa', None),
                'medico_asignado': {
                    'nombre_completo': medico_asignado.nombre_completo,
                    'cedula_profesional': medico_asignado.cedula_profesional
                } if medico_asignado else None
            },
            'incluir_historial': incluir_historial,
            'incluir_evoluciones': incluir_evoluciones,
            'incluir_evidencias': incluir_evidencias,
            'historial': None,
            'tratamientos': [],
            'evidencias': [],
            'usuario_generador': 'Sistema',  # Obtener de current_user
            'folio_documento': f'EXP-{paciente_id}-{datetime.now().strftime("%Y%m%d%H%M%S")}',
            'hash_documento': 'SHA256-PLACEHOLDER'  # Calcular hash real del contenido
        }
        
        # Agregar historial médico
        if incluir_historial and paciente.historial_medico:
            h = paciente.historial_medico
            datos['historial'] = {
                'peso_kg': h.peso_kg,
                'talla_cm': h.talla_cm,
                'imc': h.imc,
                'tipos_sangre': h.tipos_sangre,
                'tiene_ahf': any([h.ahf_diabetes, h.ahf_hipertension, h.ahf_cancer, h.ahf_cardiacas]),
                'ahf_diabetes': h.ahf_diabetes,
                'ahf_hipertension': h.ahf_hipertension,
                'ahf_cancer': h.ahf_cancer,
                'ahf_cardiacas': h.ahf_cardiacas,
                'ahf_detalles': h.ahf_detalles,
                'tiene_app': any([h.app_diabetes, h.app_hipertension, h.app_cardiacas, getattr(h, 'app_renales', False), getattr(h, 'app_cancer', False)]),
                'app_diabetes': h.app_diabetes,
                'app_diabetes_inicio': h.app_diabetes_inicio.strftime('%d/%m/%Y') if h.app_diabetes_inicio else None,
                'app_hipertension': h.app_hipertension,
                'app_cardiacas': h.app_cardiacas,
                'app_renales': getattr(h, 'app_renales', False),
                'app_cancer': getattr(h, 'app_cancer', False),
                'alergias': h.alergias
            }
        
        # Agregar tratamientos y evoluciones
        if incluir_evoluciones:
            for tratamiento in paciente.tratamientos:
                evoluciones = []
                for evol in tratamiento.evoluciones:
                    # Filtro por fechas si se especificó
                    if fecha_inicio and evol.fecha_consulta < fecha_inicio:
                        continue
                    if fecha_fin and evol.fecha_consulta > fecha_fin:
                        continue
                    
                    # Obtener médico que atendió
                    medico = None
                    if hasattr(evol, 'medico_atendio_id') and evol.medico_atendio_id:
                        medico = self.db.query(Podologo).get(evol.medico_atendio_id)
                    
                    evoluciones.append({
                        'fecha_consulta': evol.fecha_consulta.strftime('%d/%m/%Y'),
                        'subjetivo': evol.subjetivo,
                        'objetivo': evol.objetivo,
                        'analisis': evol.analisis,
                        'plan': evol.plan,
                        'diagnostico_cie10': getattr(evol, 'diagnostico_cie10', None),
                        'es_atencion_interina': getattr(evol, 'es_atencion_interina', False),
                        'motivo_medico_interino': getattr(evol, 'motivo_medico_interino', None),
                        'medico': {
                            'nombre_completo': medico.nombre_completo
                        } if medico else None
                    })
                
                datos['tratamientos'].append({
                    'id_tratamiento': tratamiento.id_tratamiento,
                    'problema': tratamiento.problema,
                    'fecha_inicio': tratamiento.fecha_inicio.strftime('%d/%m/%Y'),
                    'fecha_fin': tratamiento.fecha_fin.strftime('%d/%m/%Y') if tratamiento.fecha_fin else None,
                    'estado': tratamiento.estado,
                    'evoluciones': evoluciones
                })
        
        # Agregar evidencias
        if incluir_evidencias:
            evidencias_query = self.db.query(EvidenciaFotografica).join(
                Tratamiento
            ).filter(
                Tratamiento.paciente_id == paciente_id
            )
            
            if fecha_inicio:
                evidencias_query = evidencias_query.filter(EvidenciaFotografica.fecha_captura >= fecha_inicio)
            if fecha_fin:
                evidencias_query = evidencias_query.filter(EvidenciaFotografica.fecha_captura <= fecha_fin)
            
            for evidencia in evidencias_query.all():
                datos['evidencias'].append({
                    'fecha_captura': evidencia.fecha_captura.strftime('%d/%m/%Y'),
                    'tipo_estudio': getattr(evidencia, 'tipo_estudio', 'foto'),
                    'lateralidad': getattr(evidencia, 'lateralidad', None),
                    'descripcion': evidencia.descripcion
                })
        
        # Renderizar template
        html = self.template.render(**datos)
        return html
    
    def generate_pdf(
        self,
        paciente_id: int,
        **kwargs
    ) -> bytes:
        """
        Genera el PDF del expediente médico.
        
        Args:
            paciente_id: ID del paciente
            **kwargs: Mismos argumentos que generate_html()
            
        Returns:
            PDF como bytes
        """
        try:
            from weasyprint import HTML
        except ImportError:
            raise ImportError("WeasyPrint no está instalado. Instalar con: pip install weasyprint")
        
        # Generar HTML
        html_content = self.generate_html(paciente_id, **kwargs)
        
        # Convertir a PDF
        pdf_bytes = HTML(string=html_content).write_pdf()
        
        return pdf_bytes
    
    def export_to_hl7_cda_structure(self, paciente_id: int) -> Dict[str, Any]:
        """
        Prepara la estructura de datos para futura conversión a HL7 CDA.
        
        Este método NO genera HL7 CDA completo (eso requiere biblioteca especializada),
        pero estructura los datos de manera que sea fácil convertirlos.
        
        Returns:
            Dict con estructura preparada para HL7 CDA
        """
        # Obtener datos
        from backend.schemas.core.models import Paciente
        from sqlalchemy.orm import joinedload
        
        paciente = self.db.query(Paciente).options(
            joinedload(Paciente.historial_medico),
            joinedload(Paciente.tratamientos).joinedload(Tratamiento.evoluciones),
        ).filter(Paciente.id_paciente == paciente_id).first()
        
        if not paciente:
            raise ValueError(f"Paciente {paciente_id} no encontrado")
        
        # Estructura compatible con HL7 CDA
        cda_structure = {
            'document_id': f'EXP-{paciente_id}',
            'creation_time': datetime.now().isoformat(),
            'patient': {
                'id': paciente.id_paciente,
                'id_type': 'CURP' if hasattr(paciente, 'curp') and paciente.curp else 'INTERNAL',
                'id_value': paciente.curp if hasattr(paciente, 'curp') and paciente.curp else str(paciente.id_paciente),
                'name': {
                    'given': paciente.nombres,
                    'family': paciente.apellido_paterno if hasattr(paciente, 'apellido_paterno') else paciente.apellidos.split()[0],
                    'family2': paciente.apellido_materno if hasattr(paciente, 'apellido_materno') else ''
                },
                'birth_date': paciente.fecha_nacimiento.isoformat(),
                'gender': paciente.sexo,
                'address': {
                    'street': getattr(paciente, 'calle', paciente.domicilio),
                    'city': getattr(paciente, 'municipio', ''),
                    'state': getattr(paciente, 'entidad_federativa', ''),
                    'postal_code': getattr(paciente, 'codigo_postal', ''),
                    'country': 'MX'
                },
                'telecom': [
                    {'type': 'phone', 'value': paciente.telefono},
                    {'type': 'email', 'value': paciente.email} if paciente.email else None
                ]
            },
            'sections': []
        }
        
        # Agregar secciones (compatible con CDA)
        # ... (estructura para cada sección clínica)
        
        return cda_structure


# =============================================================================
# EJEMPLO DE USO
# =============================================================================

"""
from backend.api.utils.expediente_export import ExpedienteExporter

# En un endpoint
@router.get("/pacientes/{id}/expediente/html")
async def get_expediente_html(
    id: int,
    db: Session = Depends(get_core_db),
    current_user: SysUsuario = Depends(get_current_active_user)
):
    exporter = ExpedienteExporter(db)
    html = exporter.generate_html(
        paciente_id=id,
        incluir_historial=True,
        incluir_evoluciones=True,
        incluir_evidencias=False
    )
    
    return HTMLResponse(content=html)


@router.get("/pacientes/{id}/expediente/pdf")
async def get_expediente_pdf(
    id: int,
    db: Session = Depends(get_core_db),
    current_user: SysUsuario = Depends(get_current_active_user)
):
    exporter = ExpedienteExporter(db)
    pdf_bytes = exporter.generate_pdf(
        paciente_id=id,
        incluir_historial=True,
        incluir_evoluciones=True,
        incluir_evidencias=True
    )
    
    return Response(
        content=pdf_bytes,
        media_type='application/pdf',
        headers={
            'Content-Disposition': f'attachment; filename="expediente_{id}.pdf"'
        }
    )
"""
