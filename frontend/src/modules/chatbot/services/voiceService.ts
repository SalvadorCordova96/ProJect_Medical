// ============================================================================
// SERVICIO DE VOZ PARA GRABACIÓN Y REPRODUCCIÓN
// ============================================================================

export class VoiceService {
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private audioContext: AudioContext | null = null
  private currentAudio: HTMLAudioElement | null = null

  /**
   * Iniciar grabación de audio
   */
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      this.audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.start()
    } catch (error) {
      console.error('Error starting recording:', error)
      throw new Error('No se pudo iniciar la grabación. Verifica los permisos del micrófono.')
    }
  }

  /**
   * Detener grabación y obtener el blob de audio
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No hay grabación activa'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        
        // Detener todas las pistas del stream
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop())
        
        this.audioChunks = []
        this.mediaRecorder = null
        
        resolve(audioBlob)
      }

      this.mediaRecorder.stop()
    })
  }

  /**
   * Convertir audio blob a base64 para enviar al API
   */
  async audioToBase64(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onloadend = () => {
        const base64 = reader.result as string
        // Remover el prefijo data:audio/webm;base64,
        const base64Audio = base64.split(',')[1]
        resolve(base64Audio)
      }
      
      reader.onerror = reject
      reader.readAsDataURL(audioBlob)
    })
  }

  /**
   * Transcribir audio usando Web Speech API (fallback local)
   */
  async transcribeAudioLocal(audioBlob: Blob): Promise<string> {
    // Fallback usando Web Speech API si está disponible
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech Recognition no está disponible en este navegador')
    }

    return new Promise((resolve, reject) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.lang = 'es-ES'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        resolve(transcript)
      }

      recognition.onerror = (event: any) => {
        reject(new Error('Error en reconocimiento de voz: ' + event.error))
      }

      // Para navegadores que lo soportan, usar el blob directamente
      recognition.start()
    })
  }

  /**
   * Reproducir audio desde un URL o blob
   */
  async playAudio(audioSource: string | Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      // Detener audio actual si existe
      this.stopAudio()

      let audioUrl: string
      
      if (typeof audioSource === 'string') {
        audioUrl = audioSource
      } else {
        audioUrl = URL.createObjectURL(audioSource)
      }

      this.currentAudio = new Audio(audioUrl)
      
      this.currentAudio.onended = () => {
        if (typeof audioSource !== 'string') {
          URL.revokeObjectURL(audioUrl)
        }
        this.currentAudio = null
        resolve()
      }

      this.currentAudio.onerror = (error) => {
        if (typeof audioSource !== 'string') {
          URL.revokeObjectURL(audioUrl)
        }
        this.currentAudio = null
        reject(error)
      }

      this.currentAudio.play().catch(reject)
    })
  }

  /**
   * Detener reproducción de audio actual
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
  }

  /**
   * Sintetizar texto a voz usando Web Speech API
   */
  async textToSpeech(text: string, lang: string = 'es-ES'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Text-to-Speech no está disponible en este navegador'))
        return
      }

      // Detener cualquier síntesis previa
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(event)

      window.speechSynthesis.speak(utterance)
    })
  }

  /**
   * Verificar si el navegador soporta grabación de audio
   */
  isRecordingSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  /**
   * Verificar si el navegador soporta síntesis de voz
   */
  isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window
  }
}

export const voiceService = new VoiceService()
