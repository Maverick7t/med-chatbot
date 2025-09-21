import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check, AlertCircle, Loader2, Bot, User } from "lucide-react";

export default function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [messages, setMessages] = useState([
    { role: "bot", content: "👋 Hello! I'm MediSora, your medical assistant. I can help you with questions about diseases, treatments, medical procedures, and general health information. How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Health check on component mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('/health');
      if (response.ok) {
        setConnectionStatus('connected');
        console.log('✅ Backend connection healthy');
      } else {
        setConnectionStatus('error');
        console.warn('⚠️ Backend health check failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Backend connection failed:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('msg', userMessage);

      const response = await fetch(`${API_URL}/get`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let botResponse;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        botResponse = data.response || data.error || "No response received";
      } else {
        botResponse = await response.text();
      }

      // Add bot response
      setMessages(prev => [...prev, {
        role: "bot",
        content: botResponse,
        timestamp: new Date().toISOString()
      }]);

      // Update connection status
      setConnectionStatus('connected');

    } catch (error) {
      console.error("Error fetching response:", error);

      let errorMessage = "⚠️ I'm having trouble connecting right now. ";

      if (error.message.includes('HTTP 500')) {
        errorMessage += "The server is experiencing issues. Please try again in a moment.";
      } else if (error.message.includes('HTTP 404')) {
        errorMessage += "The service endpoint is not available.";
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += "Please check your internet connection and try again.";
      } else {
        errorMessage += "Please try again later or refresh the page.";
      }

      setMessages(prev => [...prev, {
        role: "bot",
        content: errorMessage,
        isError: true,
        timestamp: new Date().toISOString()
      }]);

      setConnectionStatus('error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { role: "bot", content: "Chat cleared! How can I help you with your medical questions?" }
    ]);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Landing Card */}
      <AnimatePresence>
        {!showChat && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative w-full max-w-sm mx-auto bg-gradient-to-b from-purple-100/20 via-blue-100/20 to-black border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Status indicator */}
            <div className="absolute top-4 right-4 z-10">
              <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                } animate-pulse`}></div>
            </div>

            {/* Character Background */}
            <div className="relative h-130 bg-gradient-to-b from-transparent via-purple-900/30 to-black">
              <img
                src="./anime1.jpg"
                alt="MediSora AI Assistant"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23667eea'/%3E%3Ctext x='50%25' y='50%25' font-size='60' fill='white' text-anchor='middle' dominant-baseline='middle'%3E🤖%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
            </div>

            {/* Content */}
            <div className="px-6 pb-8 -mt-30 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-white text-2xl font-bold">MediSora</h1>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                  connectionStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                  {connectionStatus === 'connected' ? 'Online' :
                    connectionStatus === 'error' ? 'Offline' : 'Connecting...'}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {[
                  "🏥 Diseases & Disorders Information",
                  "🔬 Medical Tests & Procedures",
                  "💊 Treatments & Therapies",
                  "📚 Gale Encyclopedia of Medicine",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Medical Disclaimer */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-200 text-xs leading-relaxed">
                    <strong>Medical Disclaimer:</strong> This AI provides general information only.
                    Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment.
                  </p>
                </div>
              </div>

              {/* Chat Button */}
              <motion.button
                onClick={() => setShowChat(true)}
                disabled={connectionStatus === 'error'}
                className={`w-full font-semibold py-4 rounded-2xl mb-3 transition-all relative overflow-hidden ${connectionStatus === 'error'
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                  }`}
                whileHover={connectionStatus !== 'error' ? { scale: 1.02 } : {}}
                whileTap={connectionStatus !== 'error' ? { scale: 0.98 } : {}}
              >
                {connectionStatus === 'connecting' && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                {connectionStatus === 'error' ? 'Service Unavailable' : 'Start Medical Chat'}
              </motion.button>

              {/* Footer */}
              <div className="flex justify-center items-center gap-2 text-gray-500 text-xs">
                <span>Educational Purpose</span>
                <span>•</span>
                <span>Not Medical Advice</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            key="chat"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-t-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col h-[85vh] z-20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    MediSora Medical Assistant
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                      connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                    <span className="text-xs text-gray-500">
                      {connectionStatus === 'connected' ? 'Online' :
                        connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearChat}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowChat(false)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : msg.isError
                      ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-bl-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md"
                    }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && (
                      <p className="text-xs opacity-60 mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  className="flex gap-3 justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">MediSora is thinking</span>
                      <div className="flex gap-1 ml-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me about medical conditions, treatments, or health information..."
                  disabled={isTyping || connectionStatus === 'error'}
                  className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 resize-none min-h-[50px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  rows="1"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping || connectionStatus === 'error'}
                  className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 group"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </div>

              {/* Connection status warning */}
              {connectionStatus === 'error' && (
                <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Connection lost. Please check your internet connection and refresh.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}