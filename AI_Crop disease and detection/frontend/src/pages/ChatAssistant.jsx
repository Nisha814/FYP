import { useState, useEffect } from 'react'
import { FiSend, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { chatService } from '../services/api'

const ChatAssistant = () => {
  const [plantType, setPlantType] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    try {
      const response = await chatService.getHistory()
      if (response.data.messages.length > 0) {
        setMessages(response.data.messages.map(m => ({
          role: m.role,
          text: m.content,
          id: m._id
        })))
      } else {
        setMessages([
          {
            role: 'assistant',
            text: 'Hi! Ask me about plant health, diseases, and treatment planning.'
          }
        ])
      }
    } catch (error) {
      toast.error('Failed to load chat history')
      setMessages([
        {
          role: 'assistant',
          text: 'Hi! Ask me about plant health, diseases, and treatment planning.'
        }
      ])
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleClearHistory = async () => {
    try {
      await chatService.clearHistory()
      setMessages([
        {
          role: 'assistant',
          text: 'Hi! Ask me about plant health, diseases, and treatment planning.'
        }
      ])
      toast.success('Chat history cleared')
    } catch (error) {
      toast.error('Failed to clear chat history')
    }
  }

  const handleSend = async () => {
    if (!message.trim()) return
    const userMessage = message.trim()
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])
    setMessage('')
    setLoading(true)

    try {
      const response = await chatService.ask(userMessage, plantType.trim())
      setMessages((prev) => [...prev, { role: 'assistant', text: response.data.reply }])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chat assistant is unavailable')
    } finally {
      setLoading(false)
    }
  }

  if (loadingHistory) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-900">Plant Chat Assistant</h1>
        <button 
          className="btn-secondary text-sm inline-flex items-center"
          onClick={handleClearHistory}
        >
          <FiTrash2 className="mr-1" /> Clear History
        </button>
      </div>
      <p className="text-gray-600 mb-6">Get quick guidance for plant issues and care actions.</p>

      <div className="card mb-4">
        <input
          type="text"
          className="input-field"
          placeholder="Plant type (optional)"
          value={plantType}
          onChange={(e) => setPlantType(e.target.value)}
        />
      </div>

      <div className="card h-[420px] overflow-y-auto space-y-3 mb-4">
        {messages.map((item, index) => (
          <div
            key={item.id || `${item.role}-${index}`}
            className={`p-3 rounded-lg ${item.role === 'assistant' ? 'bg-primary-50 text-gray-800' : 'bg-gray-100 text-gray-900'}`}
          >
            <p className="text-xs font-semibold uppercase mb-1">{item.role}</p>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="card flex gap-2">
        <input
          type="text"
          className="input-field"
          placeholder="Type your plant question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) handleSend()
          }}
        />
        <button className="btn-primary inline-flex items-center" type="button" onClick={handleSend} disabled={loading}>
          <FiSend className="mr-1" /> {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default ChatAssistant
