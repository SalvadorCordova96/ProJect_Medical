import { Podologo, Servicio, Usuario, Paciente } from './types'

export const initialPodologos: Podologo[] = [
  {
    id_podologo: 1,
    nombres: 'María',
    apellidos: 'García López',
    especialidad: 'Podología General',
    disponibilidad: {
      lunes: { inicio: '09:00', fin: '17:00' },
      martes: { inicio: '09:00', fin: '17:00' },
      miercoles: { inicio: '09:00', fin: '17:00' },
      jueves: { inicio: '09:00', fin: '17:00' },
      viernes: { inicio: '09:00', fin: '14:00' }
    },
    contacto: '+52 555 123 4567',
    activo: true
  },
  {
    id_podologo: 2,
    nombres: 'Carlos',
    apellidos: 'Hernández Ruiz',
    especialidad: 'Podología Deportiva',
    disponibilidad: {
      lunes: { inicio: '10:00', fin: '18:00' },
      martes: { inicio: '10:00', fin: '18:00' },
      miercoles: { inicio: '10:00', fin: '18:00' },
      jueves: { inicio: '10:00', fin: '18:00' },
      viernes: { inicio: '10:00', fin: '15:00' }
    },
    contacto: '+52 555 234 5678',
    activo: true
  },
  {
    id_podologo: 3,
    nombres: 'Ana',
    apellidos: 'Martínez Sánchez',
    especialidad: 'Podología Geriátrica',
    disponibilidad: {
      lunes: { inicio: '08:00', fin: '16:00' },
      martes: { inicio: '08:00', fin: '16:00' },
      miercoles: { inicio: '08:00', fin: '16:00' },
      jueves: { inicio: '08:00', fin: '16:00' },
      viernes: { inicio: '08:00', fin: '13:00' }
    },
    contacto: '+52 555 345 6789',
    activo: true
  }
]

export const initialServicios: Servicio[] = [
  {
    id_servicio: 1,
    nombre: 'Consulta General',
    descripcion: 'Consulta podológica general, revisión de pie y uñas',
    duracion_minutos: 30,
    precio: 350,
    activo: true
  },
  {
    id_servicio: 2,
    nombre: 'Tratamiento de Uñas Encarnadas',
    descripcion: 'Tratamiento completo para uñas encarnadas',
    duracion_minutos: 45,
    precio: 500,
    activo: true
  },
  {
    id_servicio: 3,
    nombre: 'Eliminación de Callos y Durezas',
    descripcion: 'Remoción de callos y durezas en pies',
    duracion_minutos: 30,
    precio: 400,
    activo: true
  },
  {
    id_servicio: 4,
    nombre: 'Tratamiento de Pie Diabético',
    descripcion: 'Cuidado especializado para pacientes diabéticos',
    duracion_minutos: 60,
    precio: 700,
    activo: true
  },
  {
    id_servicio: 5,
    nombre: 'Ortesis Plantares',
    descripcion: 'Fabricación de plantillas ortopédicas personalizadas',
    duracion_minutos: 90,
    precio: 1500,
    activo: true
  },
  {
    id_servicio: 6,
    nombre: 'Tratamiento de Hongos',
    descripcion: 'Tratamiento para onicomicosis y micosis plantar',
    duracion_minutos: 45,
    precio: 600,
    activo: true
  },
  {
    id_servicio: 7,
    nombre: 'Rehabilitación Podológica',
    descripcion: 'Sesión de rehabilitación y ejercicios terapéuticos',
    duracion_minutos: 60,
    precio: 550,
    activo: true
  },
  {
    id_servicio: 8,
    nombre: 'Evaluación Biomecánica',
    descripcion: 'Estudio completo de la marcha y pisada',
    duracion_minutos: 75,
    precio: 1200,
    activo: true
  },
  {
    id_servicio: 9,
    nombre: 'Quiropodia',
    descripcion: 'Cuidado integral de pies y uñas',
    duracion_minutos: 40,
    precio: 450,
    activo: true
  },
  {
    id_servicio: 10,
    nombre: 'Papilomas (Verrugas Plantares)',
    descripcion: 'Tratamiento de verrugas plantares',
    duracion_minutos: 30,
    precio: 500,
    activo: true
  }
]

export const initialUsuarios: Usuario[] = [
  {
    id_usuario: 1,
    username: 'admin',
    email: 'admin@podoskin.com',
    rol: 'Admin',
    nombre: 'Administrador',
    apellido: 'Sistema',
    activo: true,
    created_at: new Date().toISOString()
  },
  {
    id_usuario: 2,
    username: 'podologo1',
    email: 'maria.garcia@podoskin.com',
    rol: 'Podologo',
    nombre: 'María',
    apellido: 'García López',
    activo: true,
    created_at: new Date().toISOString()
  },
  {
    id_usuario: 3,
    username: 'recepcion1',
    email: 'recepcion@podoskin.com',
    rol: 'Recepcion',
    nombre: 'Laura',
    apellido: 'Pérez Gómez',
    activo: true,
    created_at: new Date().toISOString()
  }
]

export const initialPacientes: Paciente[] = [
  {
    id_paciente: 1001,
    nombres: 'Juan Carlos',
    apellidos: 'Rodríguez Pérez',
    fecha_nacimiento: '1985-03-15',
    sexo: 'M',
    telefono: '+52 555 111 2222',
    email: 'juan.rodriguez@email.com',
    domicilio: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
    documento_id: 'ROPJ850315ABC',
    activo: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id_paciente: 1002,
    nombres: 'María Elena',
    apellidos: 'López Sánchez',
    fecha_nacimiento: '1978-07-22',
    sexo: 'F',
    telefono: '+52 555 222 3333',
    email: 'maria.lopez@email.com',
    domicilio: 'Calle Revolución 567, Col. Roma Norte, CDMX',
    documento_id: 'LOSM780722XYZ',
    activo: true,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id_paciente: 1003,
    nombres: 'Pedro',
    apellidos: 'Martínez Gómez',
    fecha_nacimiento: '1992-11-08',
    sexo: 'M',
    telefono: '+52 555 333 4444',
    email: 'pedro.martinez@email.com',
    domicilio: 'Av. Reforma 890, Col. Juárez, CDMX',
    documento_id: 'MAGP921108DEF',
    activo: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id_paciente: 1004,
    nombres: 'Ana Patricia',
    apellidos: 'Hernández Cruz',
    fecha_nacimiento: '1965-05-30',
    sexo: 'F',
    telefono: '+52 555 444 5555',
    email: 'ana.hernandez@email.com',
    domicilio: 'Calle Morelos 234, Col. Centro, CDMX',
    documento_id: 'HECA650530GHI',
    activo: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id_paciente: 1005,
    nombres: 'Roberto',
    apellidos: 'González Vargas',
    fecha_nacimiento: '1988-09-12',
    sexo: 'M',
    telefono: '+52 555 555 6666',
    email: 'roberto.gonzalez@email.com',
    domicilio: 'Av. Universidad 456, Col. Narvarte, CDMX',
    documento_id: 'GOVR880912JKL',
    activo: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id_paciente: 1006,
    nombres: 'Carmen',
    apellidos: 'Díaz Morales',
    fecha_nacimiento: '1995-02-18',
    sexo: 'F',
    telefono: '+52 555 666 7777',
    email: 'carmen.diaz@email.com',
    domicilio: 'Calle Chapultepec 789, Col. Condesa, CDMX',
    documento_id: 'DIMC950218MNO',
    activo: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id_paciente: 1007,
    nombres: 'Luis Fernando',
    apellidos: 'Ramírez Torres',
    fecha_nacimiento: '1972-12-25',
    sexo: 'M',
    telefono: '+52 555 777 8888',
    email: 'luis.ramirez@email.com',
    domicilio: 'Av. Patriotismo 123, Col. San Pedro de los Pinos, CDMX',
    documento_id: 'RATL721225PQR',
    activo: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id_paciente: 1008,
    nombres: 'Guadalupe',
    apellidos: 'Flores Medina',
    fecha_nacimiento: '2000-06-10',
    sexo: 'F',
    telefono: '+52 555 888 9999',
    email: 'guadalupe.flores@email.com',
    domicilio: 'Calle Ámsterdam 345, Col. Hipódromo, CDMX',
    documento_id: 'FOMG000610STU',
    activo: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]

