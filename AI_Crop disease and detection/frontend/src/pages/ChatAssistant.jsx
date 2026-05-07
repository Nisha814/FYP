import { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { chatService } from '../services/api'

const ChatAssistant = () => {
  const [plantType, setPlantType] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! Ask me about plant health, diseases, and treatment planning.'
    }
  ])

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Chat Assistant</h1>
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
            key={`${item.role}-${index}`}
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
