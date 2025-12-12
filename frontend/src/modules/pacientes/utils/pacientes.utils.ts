/**
 * Calculate age from birth date
 * @param fechaNacimiento - Birth date string in ISO format
 * @returns Age in years
 */
export function calculateAge(fechaNacimiento: string): number {
  const birthDate = new Date(fechaNacimiento)
  const today = new Date()
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Format patient full name
 * @param nombres - First name(s)
 * @param apellidos - Last name(s)
 * @returns Full formatted name
 */
export function formatPatientName(nombres: string, apellidos: string): string {
  return `${nombres} ${apellidos}`
}

/**
 * Format date to Spanish locale
 * @param dateString - Date string in ISO format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format datetime to Spanish locale
 * @param dateString - Date string in ISO format
 * @returns Formatted datetime string
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
