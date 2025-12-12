import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ChatCircleDots, X, PaperPlaneRight, CalendarCheck, UserPlus, Notebook, Camera, Question, Lightbulb } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
    }
  }
}

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface QuickCommand {
  id: string
  label: string
  prompt: string
  icon: React.ReactNode
  category: 'action' | 'help' | 'info'
}

const quickCommands: QuickCommand[] = [
  {
    id: 'agendar-cita',
    label: '¿Cómo agendo una cita?',
    prompt: '¿Cómo puedo agendar una cita para un paciente en el sistema?',
    icon: <CalendarCheck size={20} weight="duotone" />,
    category: 'help'
  },
  {
    id: 'nuevo-paciente',
    label: 'Registrar nuevo paciente',
    prompt: '¿Cómo registro un nuevo paciente en el sistema? ¿Qué datos necesito?',
    icon: <UserPlus size={20} weight="duotone" />,
    category: 'help'
  },
  {
    id: 'evoluciones',
    label: 'Sobre evoluciones',
    prompt: '¿Cómo funcionan las evoluciones en los tratamientos? ¿Cómo agrego notas?',
    icon: <Notebook size={20} weight="duotone" />,
    category: 'help'
  },
  {
    id: 'evidencias',
    label: 'Subir evidencias',
    prompt: '¿Cómo subo fotos o evidencias a un tratamiento?',
    icon: <Camera size={20} weight="duotone" />,
    category: 'help'
  },
  {
    id: 'modulos',
    label: 'Módulos del sistema',
    prompt: '¿Qué módulos tiene PodoSkin y para qué sirve cada uno?',
    icon: <Question size={20} weight="duotone" />,
    category: 'info'
  },
  {
    id: 'mejores-practicas',
    label: 'Mejores prácticas',
    prompt: 'Dame algunos consejos de mejores prácticas para usar el sistema eficientemente',
    icon: <Lightbulb size={20} weight="duotone" />,
    category: 'info'
  }
]

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useKV<Message[]>('chatbot-messages', [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickCommands, setShowQuickCommands] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    setShowQuickCommands(!messages || messages.length === 0)
  }, [messages])

  const handleSendMessage = async (messageContent?: string) => {
    const contentToSend = messageContent || input.trim()
    if (!contentToSend || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: contentToSend,
      timestamp: new Date().toISOString()
    }

    setMessages(current => [...(current || []), userMessage])
    setInput('')
    setIsLoading(true)
    setShowQuickCommands(false)

    try {
      const prompt = window.spark.llmPrompt`Eres un asistente virtual para PodoSkin, un sistema de gestión de clínicas podológicas. 
      Ayuda al usuario con consultas sobre el sistema, cómo usar las diferentes funciones, 
      y proporciona información general sobre gestión clínica.
      
      El sistema tiene los siguientes módulos:
      - Dashboard: Resumen de estadísticas y citas del día
      - Pacientes: Registro y gestión de pacientes (nombres, apellidos, fecha nacimiento, contacto, historial)
      - Citas: Agenda de citas con pacientes, podólogos y servicios
      - Tratamientos: Gestión de tratamientos activos y completados por paciente
      - Evoluciones: Notas de seguimiento en formato SOAP para cada tratamiento
      - Evidencias: Galería de fotos y documentos por tratamiento
      - Servicios: Catálogo de servicios ofrecidos
      - Prospectos: Pipeline de leads y conversiones
      - Podólogos: Gestión del staff y disponibilidad
      - Usuarios: Administración de usuarios y roles (Admin/Podólogo/Recepción)
      - Auditoría: Log de acciones realizadas en el sistema
      
      Pregunta del usuario: ${contentToSend}
      
      Responde de manera concisa, amigable y profesional en español. Si la pregunta es sobre cómo hacer algo, 
      proporciona pasos claros y específicos.`
      
      const response = await window.spark.llm(prompt, 'gpt-4o-mini')

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      setMessages(current => [...(current || []), assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date().toISOString()
      }
      setMessages(current => [...(current || []), errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickCommand = (command: QuickCommand) => {
    handleSendMessage(command.prompt)
  }

  const handleClearChat = () => {
    setMessages([])
    setShowQuickCommands(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 rounded-full shadow-lg transition-all duration-300 z-50",
          "hover:shadow-xl hover:scale-105",
          isOpen ? "w-14 p-0" : "w-auto px-5 gap-3"
        )}
      >
        {isOpen ? (
          <X size={24} weight="bold" />
        ) : (
          <>
            <ChatCircleDots size={24} weight="duotone" />
            <span className="font-medium">Asistente Virtual</span>
          </>
        )}
      </Button>

      <div
        className={cn(
          "fixed bottom-0 right-0 h-screen w-[400px] bg-card border-l border-border shadow-2xl transition-transform duration-300 z-40",
          "flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-foreground">Asistente Virtual</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X size={20} />
            </Button>
          </div>
          <div className="space-y-1">
            <p 
              className="text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
              style={{
                backgroundSize: '200% auto',
                animation: 'gradient 3s linear infinite'
              }}
            >
              ¡Hola! Soy tu asistente de PodoSkin
            </p>
            <p 
              className="text-sm font-medium bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent"
              style={{
                backgroundSize: '200% auto',
                animation: 'gradient 3s linear infinite',
                animationDelay: '0.5s'
              }}
            >
              Puedo ayudarte con el sistema
            </p>
            <p 
              className="text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
              style={{
                backgroundSize: '200% auto',
                animation: 'gradient 3s linear infinite',
                animationDelay: '1s'
              }}
            >
              ¿En qué te puedo asistir hoy?
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-4">
            {showQuickCommands && (!messages || messages.length === 0) && (
              <div className="space-y-4">
                <div className="text-center text-muted-foreground text-sm py-4">
                  <ChatCircleDots size={48} className="mx-auto mb-3 opacity-30" weight="duotone" />
                  <p className="font-medium mb-1">Selecciona una opción rápida</p>
                  <p className="text-xs">o escribe tu propia pregunta</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">Ayuda</Badge>
                  </div>
                  <div className="grid gap-2">
                    {quickCommands.filter(cmd => cmd.category === 'help').map((command) => (
                      <Button
                        key={command.id}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 text-left hover:bg-accent/50 transition-colors"
                        onClick={() => handleQuickCommand(command)}
                      >
                        <span className="mr-3 shrink-0">{command.icon}</span>
                        <span className="text-sm">{command.label}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-2 mt-4">
                    <Badge variant="secondary" className="text-xs">Información</Badge>
                  </div>
                  <div className="grid gap-2">
                    {quickCommands.filter(cmd => cmd.category === 'info').map((command) => (
                      <Button
                        key={command.id}
                        variant="outline"
                        className="justify-start h-auto py-3 px-4 text-left hover:bg-accent/50 transition-colors"
                        onClick={() => handleQuickCommand(command)}
                      >
                        <span className="mr-3 shrink-0">{command.icon}</span>
                        <span className="text-sm">{command.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages && messages.length > 0 && (
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar chat
                </Button>
              </div>
            )}
            
            {messages?.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1 opacity-70",
                    message.role === 'user' ? "text-right" : "text-left"
                  )}>
                    {new Date(message.timestamp).toLocaleTimeString('es', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-muted-foreground">Escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <PaperPlaneRight size={20} weight="fill" />
            </Button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes gradient {
            0% {
              background-position: 0% center;
            }
            100% {
              background-position: 200% center;
            }
          }
        `}
      </style>
    </>
  )
}
