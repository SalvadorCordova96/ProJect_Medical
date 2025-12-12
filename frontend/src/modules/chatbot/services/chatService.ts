// ============================================================================
// SERVICIO DEL CHATBOT CON GEMINI LIVE Y FUNCTION CALLING
// ============================================================================

import { chatServiceMock } from './chatService.mock'
import { geminiLiveService } from './geminiLiveService'
import { voiceService } from './voiceService'

export const chatServiceReal = {
  /**
   * Enviar mensaje de texto
   */
  sendMessage: async (message: string): Promise<string> => {
    try {
      const response = await geminiLiveService.sendTextMessage(message)
      return response
    } catch (error) {
      console.error('Error calling Gemini Live:', error)
      throw error
    }
  },

  /**
   * Enviar mensaje de voz (audio)
   */
  sendVoiceMessage: async (audioBlob: Blob): Promise<string> => {
    try {
      // Convertir audio a base64
      const audioBase64 = await voiceService.audioToBase64(audioBlob)
      
      // Enviar a Gemini Live para procesamiento
      const response = await geminiLiveService.sendAudioMessage(audioBase64, audioBlob.type)
      
      return response
    } catch (error) {
      console.error('Error processing voice message:', error)
      throw error
    }
  },

  /**
   * Ejecutar una función llamada por Gemini
   */
  executeFunctionCall: async (functionName: string, args: Record<string, any>): Promise<any> => {
    // Aquí se integrarían las llamadas reales a los servicios del backend
    // Por ahora, retornamos mock data
    console.log(`Executing function: ${functionName}`, args)
    
    switch (functionName) {
      case 'get_todays_appointments':
        return { count: 5, appointments: [] }
      
      case 'search_patient':
        return { results: [], message: 'Búsqueda simulada' }
      
      case 'get_active_treatments':
        return { count: 3, treatments: [] }
      
      case 'create_patient':
        return { success: true, patient_id: 123, message: 'Paciente creado (simulación)' }
      
      case 'schedule_appointment':
        return { success: true, appointment_id: 456, message: 'Cita agendada (simulación)' }
      
      default:
        return { error: 'Función no implementada' }
    }
  },

  /**
   * Sintetizar texto a voz
   */
  textToSpeech: async (text: string, lang: string = 'es-ES'): Promise<void> => {
    try {
      await voiceService.textToSpeech(text, lang)
    } catch (error) {
      console.error('Error in text-to-speech:', error)
      throw error
    }
  },

  /**
   * Limpiar historial de conversación
   */
  clearHistory: (): void => {
    geminiLiveService.clearHistory()
  }
}

export const USE_MOCK = false

export const chatService = USE_MOCK ? chatServiceMock : chatServiceReal
