import { useState } from "react";
import anime from './assets/anime1.jpg';
import { motion, AnimatePresence } from "framer-motion";
import { Send, Check } from "lucide-react";

export default function App() {
  const [showChat, setShowChat] = useState(false);
  // Add this line with other useState hooks
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "I'm your Med Chatbot, Ready to explore health together?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message locally
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    const userInput = input;
    setInput(""); // clear input field

    setIsTyping(true);

    try {
      const response = await fetch("/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ msg: userInput }),
      });

      const data = await response.text(); // Flask returns plain text
      // Add bot response
      setMessages((prev) => [...prev, { role: "bot", content: data }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Something went wrong." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Landing / Premium Card */}
      <AnimatePresence>
        {!showChat && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="relative w-full max-w-sm mx-auto bg-gradient-to-b from-purple-900/20 via-blue-900/20 to-black border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Anime Character Background */}
            <div className="relative h-110 bg-gradient-to-b from-transparent via-purple-900/30 to-black">
              <img
                src="/anime1.jpg"
                alt="Anime Character"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>

              {/* Stars/Sparkles */}
              <div className="absolute inset-0">
                <div className="absolute top-20 left-12 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute top-32 right-16 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="absolute top-48 left-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-56 right-8 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-8 -mt-20 relative z-10">
              <h1 className="text-white text-2xl font-bold mb-6">
                MediSora
              </h1>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {[
                  "Diseases & Disorders",
                  "Medical Tests & Procedures",
                  "Treatments & Therapies",
                  "Gale Encyclopedia of Medicine corpus",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 text-base">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Chat Button */}
              <motion.button
                onClick={() => setShowChat(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-4 rounded-2xl mb-3 hover:from-purple-700 hover:to-purple-800 transition-all relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Chat
              </motion.button>

              {/* Footer Links */}
              <div className="flex justify-center items-center gap-2 text-gray-500 text-sm">
                <a href="#" className="hover:text-gray-300">For Project perspective</a>
                <span>|</span>
                <a href="#" className="hover:text-gray-300">Error Prone</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window (Slides Up) */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            key="chat"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-3xl bg-white/90 dark:bg-gray-900/90 rounded-t-2xl shadow-2xl p-6 flex flex-col h-[80vh] z-20"
          >
            <div className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-200">
              👋 Hi, I’m MediSora 🩺
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 px-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={msg.role === "user" ? "text-right" : "text-left"}
                >
                  <span
                    className={`inline-block px-4 py-2 rounded-2xl shadow-sm ${msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                      }`}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}
              {/* Typing indicator */}
              {isTyping && (
                <div className="text-left">
                  <span className="inline-block px-4 py-2 rounded-2xl shadow-sm bg-gray-200 dark:bg-gray-700">
                    MediSora is typing
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="mt-4 flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={sendMessage}
                className="relative group p-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-200"></div>
                {/* Icon */}
                <div className="relative">
                  <Send size={20} />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div> // closes main div
  );
} // closes App
