// ============================================================================
// TIPOS DEL CHATBOT
// ============================================================================

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
  isVoice?: boolean
  functionCall?: FunctionCall
}

export interface FunctionCall {
  name: string
  arguments: Record<string, any>
  result?: any
}

export interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isTyping: boolean
  isRecording: boolean
  isSpeaking: boolean
}

export interface VoiceConfig {
  enabled: boolean
  autoPlay: boolean
  voiceLanguage: 'es-ES' | 'es-MX'
}
