import { useState, useRef, useEffect } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import { Send, Bot, User, Sparkles, MessageSquare, Zap, HelpCircle, CreditCard, Wrench, Clock } from "lucide-react"

const SUGGESTIONS = [
  { text: "I can't login to my account", icon: Wrench },
  { text: "I need help with my billing", icon: CreditCard },
  { text: "How do I change my password?", icon: HelpCircle },
  { text: "My app is crashing on startup", icon: Zap },
]

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async (text) => {
    const messageText = text || input.trim()
    if (!messageText) return

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageText,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await axios.post("http://127.0.0.1:8000/chat", {
        query: messageText,
      })

      const data = response.data

      const botMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        category: data.category,
        sentiment: data.sentiment,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error:", error)

      const isRateLimited = error.response && error.response.status === 429

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: isRateLimited
            ? "You've sent too many messages. Please wait a minute before trying again."
            : "I'm having trouble connecting to the server. Please make sure the backend is running and try again.",
          isError: !isRateLimited,
          isRateLimited: isRateLimited,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSendMessage()
  }

  const getSentimentBadgeClass = (sentiment) => {
    if (!sentiment) return ""
    const s = sentiment.toLowerCase()
    if (s.includes("positive")) return "badge-positive"
    if (s.includes("negative")) return "badge-negative"
    return "badge-neutral"
  }

  const getCategoryIcon = (category) => {
    if (!category) return null
    const c = category.toLowerCase()
    if (c.includes("technical")) return <Wrench size={11} />
    if (c.includes("billing")) return <CreditCard size={11} />
    return <HelpCircle size={11} />
  }

  return (
    <div className="relative h-screen w-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg" />

      {/* Main Chat Container */}
      <div className="chat-card relative z-10 w-full max-w-2xl h-[calc(100vh-3rem)] max-h-[800px] flex flex-col">

        {/* Header */}
        <div className="chat-header">
          <div className="flex items-center gap-3">
            <div className="avatar avatar-bot">
              <Bot size={18} color="white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  Support Agent
                </h1>
                <span className="status-dot" />
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Powered by AI  ·  Always here to help
              </p>
            </div>
          </div>
          <div className="ai-badge">
            <Sparkles size={13} />
            <span>AI</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages custom-scrollbar">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="welcome-screen animate-fade-in-up">
              <div className="welcome-avatar">
                <Bot size={28} color="white" />
              </div>
              <h2 className="welcome-title">How can I help you?</h2>
              <p className="welcome-subtitle">
                I can assist with technical issues, billing questions, and general inquiries. Choose a topic or type your question below.
              </p>
              <div className="suggestions-grid">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(s.text)}
                    className="suggestion-chip"
                  >
                    <s.icon size={15} className="suggestion-icon" />
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="messages-list">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`message-row animate-fade-in-up ${message.role === "user" ? "message-row-user" : "message-row-bot"}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Avatar */}
                  <div className={`avatar ${message.role === "user" ? "avatar-user" : "avatar-bot"}`}>
                    {message.role === "user" ? (
                      <User size={15} style={{ color: 'var(--color-muted-foreground)' }} />
                    ) : (
                      <Bot size={15} color="white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`message-content ${message.role === "user" ? "message-content-user" : "message-content-bot"}`}>
                    {message.isRateLimited ? (
                      /* Rate Limited Message */
                      <div className="msg-rate-limited">
                        <div className="rate-limit-icon">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="rate-limit-title">Slow down!</p>
                          <p className="rate-limit-text">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className={message.role === "user" ? "msg-user" : "msg-bot"}>
                        {message.role === "assistant" ? (
                          <div className="markdown-content">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="message-text">{message.content}</p>
                        )}
                      </div>
                    )}

                    {/* Metadata badges */}
                    {message.role === "assistant" && (message.category || message.sentiment) && (
                      <div className="message-badges">
                        {message.category && (
                          <span className="badge badge-category">
                            {getCategoryIcon(message.category)}
                            {message.category}
                          </span>
                        )}
                        {message.sentiment && (
                          <span className={`badge ${getSentimentBadgeClass(message.sentiment)}`}>
                            {message.sentiment}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="message-row message-row-bot animate-fade-in-up">
                  <div className="avatar avatar-bot">
                    <Bot size={15} color="white" />
                  </div>
                  <div className="msg-bot typing-bubble">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <form onSubmit={handleSubmit} className="chat-form">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="send-btn"
            >
              <Send size={17} />
            </button>
          </form>
          <p className="chat-disclaimer">
            <MessageSquare size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />
            AI responses are generated and may not always be accurate
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
