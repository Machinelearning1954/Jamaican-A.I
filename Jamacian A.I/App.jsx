import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Music, 
  User, 
  Bot,
  Loader2,
  Heart,
  Star
} from 'lucide-react'
import './App.css'

const API_BASE_URL = 'http://localhost:5001/api'

// AI Model configurations with Jamaican artist personas
const AI_MODELS = {
  claude: {
    name: 'Damien Marley',
    description: 'Conscious reggae wisdom and cultural insights',
    color: 'bg-green-600',
    textColor: 'text-green-100',
    icon: '🎭',
    genre: 'Conscious Reggae'
  },
  gpt4: {
    name: 'Shensea',
    description: 'Contemporary dancehall creativity',
    color: 'bg-pink-600',
    textColor: 'text-pink-100',
    icon: '✨',
    genre: 'Dancehall'
  },
  gemini: {
    name: 'Barrington Levy',
    description: 'Classic reggae knowledge and experience',
    color: 'bg-yellow-600',
    textColor: 'text-yellow-100',
    icon: '🎵',
    genre: 'Classic Reggae'
  },
  grok: {
    name: 'Jaz Elise',
    description: 'Modern artistic expression',
    color: 'bg-purple-600',
    textColor: 'text-purple-100',
    icon: '🎨',
    genre: 'Contemporary'
  },
  qwen: {
    name: 'Jada Kingdom',
    description: 'Bold dancehall perspectives',
    color: 'bg-red-600',
    textColor: 'text-red-100',
    icon: '👑',
    genre: 'Dancehall'
  },
  meta: {
    name: 'Buju Banton',
    description: 'Spiritual wisdom and cultural depth',
    color: 'bg-orange-600',
    textColor: 'text-orange-100',
    icon: '🙏',
    genre: 'Spiritual Reggae'
  }
}

function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('claude')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [availableModels, setAvailableModels] = useState({})
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }
      
      recognition.onerror = () => {
        setIsListening(false)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current = recognition
    }
  }, [])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check backend connection and load models
  useEffect(() => {
    checkConnection()
    loadAvailableModels()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      if (response.ok) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('error')
      }
    } catch (error) {
      setConnectionStatus('error')
      console.error('Connection error:', error)
    }
  }

  const loadAvailableModels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/models`)
      if (response.ok) {
        const data = await response.json()
        setAvailableModels(data.models)
      }
    } catch (error) {
      console.error('Error loading models:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          user_id: 'user_123',
          context: {
            selected_model: selectedModel,
            conversation_history: messages.slice(-5) // Last 5 messages for context
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage = {
          id: Date.now() + 1,
          text: data.response.text,
          sender: 'ai',
          model: data.response.selected_model,
          modelInfo: data.response.model_info,
          voiceModel: data.response.voice_model,
          timestamp: new Date().toLocaleTimeString(),
          processingTime: data.response.processing_time
        }
        
        setMessages(prev => [...prev, aiMessage])
        
        // Auto-play voice synthesis if available
        if (data.response.voice_model && !isSpeaking) {
          synthesizeVoice(data.response.text, data.response.voice_model)
        }
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        sender: 'ai',
        model: 'error',
        timestamp: new Date().toLocaleTimeString(),
        error: true
      }
      setMessages(prev => [...prev, errorMessage])
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const synthesizeVoice = async (text, voiceModel) => {
    try {
      setIsSpeaking(true)
      
      // Use Web Speech API for now (in production, would call backend voice synthesis)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = voiceModel.tempo === 'fast' ? 1.2 : voiceModel.tempo === 'slow_moderate' ? 0.8 : 1.0
        utterance.pitch = 1.0
        utterance.volume = 0.8
        
        utterance.onend = () => {
          setIsSpeaking(false)
        }
        
        utterance.onerror = () => {
          setIsSpeaking(false)
        }
        
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error('Voice synthesis error:', error)
      setIsSpeaking(false)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-yellow-900 to-red-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6 bg-black/20 backdrop-blur-sm border-yellow-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-3">
              <Music className="h-8 w-8" />
              Reggae AI Collective
              <Music className="h-8 w-8" />
            </CardTitle>
            <p className="text-yellow-200 text-lg">
              Conversational AI powered by Jamaican musical wisdom
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm text-yellow-300">
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
              </span>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* AI Model Selection */}
          <Card className="lg:col-span-1 bg-black/20 backdrop-blur-sm border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Select Artist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(AI_MODELS).map(([key, model]) => (
                <Button
                  key={key}
                  variant={selectedModel === key ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto p-3 ${
                    selectedModel === key 
                      ? `${model.color} ${model.textColor}` 
                      : 'bg-black/30 text-yellow-200 border-yellow-500/30 hover:bg-yellow-500/20'
                  }`}
                  onClick={() => setSelectedModel(key)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{model.icon}</span>
                      <span className="font-semibold">{model.name}</span>
                    </div>
                    <span className="text-xs opacity-90">{model.genre}</span>
                    <span className="text-xs opacity-75">{model.description}</span>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-3 bg-black/20 backdrop-blur-sm border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Conversation with {AI_MODELS[selectedModel]?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <ScrollArea className="h-96 mb-4 p-4 bg-black/30 rounded-lg border border-yellow-500/30">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-yellow-300 py-8">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Welcome to the Reggae AI Collective!</p>
                      <p className="text-sm opacity-75">
                        Start a conversation with {AI_MODELS[selectedModel]?.name}
                      </p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-yellow-600 text-yellow-100'
                            : message.error
                            ? 'bg-red-600/80 text-red-100'
                            : AI_MODELS[message.model]
                            ? `${AI_MODELS[message.model].color}/80 ${AI_MODELS[message.model].textColor}`
                            : 'bg-gray-600/80 text-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {message.sender === 'user' ? (
                            <User className="h-4 w-4 mt-1" />
                          ) : (
                            <Bot className="h-4 w-4 mt-1" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {message.sender === 'user' 
                                  ? 'You' 
                                  : AI_MODELS[message.model]?.name || 'AI'
                                }
                              </span>
                              <span className="text-xs opacity-75">
                                {message.timestamp}
                              </span>
                            </div>
                            {message.model && AI_MODELS[message.model] && (
                              <Badge variant="secondary" className="mb-2 text-xs">
                                {AI_MODELS[message.model].genre}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        {message.processingTime && (
                          <div className="text-xs opacity-50 mt-2">
                            Processed in {message.processingTime}s
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-600/80 text-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">
                            {AI_MODELS[selectedModel]?.name} is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Chat with ${AI_MODELS[selectedModel]?.name}...`}
                    className="bg-black/30 border-yellow-500/30 text-yellow-100 placeholder:text-yellow-400/60"
                    disabled={isLoading}
                  />
                </div>
                
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant="outline"
                  size="icon"
                  className={`border-yellow-500/30 ${
                    isListening 
                      ? 'bg-red-600 text-red-100 hover:bg-red-700' 
                      : 'bg-black/30 text-yellow-400 hover:bg-yellow-500/20'
                  }`}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <Button
                  onClick={isSpeaking ? stopSpeaking : sendMessage}
                  variant="outline"
                  size="icon"
                  className={`border-yellow-500/30 ${
                    isSpeaking
                      ? 'bg-red-600 text-red-100 hover:bg-red-700'
                      : 'bg-yellow-600 text-yellow-100 hover:bg-yellow-700'
                  }`}
                  disabled={isLoading || (!inputMessage.trim() && !isSpeaking)}
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center justify-between mt-3 text-xs text-yellow-400/75">
                <div className="flex items-center gap-4">
                  {isListening && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span>Listening...</span>
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      <span>Speaking...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>Made with love for Jamaican culture</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
