import React, { useState, useRef, useEffect } from 'react';
import { Send, TrendingUp, Loader } from "lucide-react";

function FinancialBot() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi! I'm your Financial AI Assistant. Tell me which stock you're interested in, and I'll analyze its recommendations!", 
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;
  
    // Add user message to UI
    const userMessage = {
      id: Date.now(),
      text: trimmedInput,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
  
    try {
        // Encode user input for safe API request
        const encodedInput = encodeURIComponent(trimmedInput);
        const apiUrl = `http://52.55.238.38:80/stock_recommendation?user_input=${encodedInput}`;
  
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        // ✅ Check if response is valid
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json(); // ✅ Parse JSON safely
  
        // ✅ Check if data is valid
        if (Array.isArray(data) && data.length > 0 && data[0].stock_name) {
            const stockData = data[0]; 
            const botMessage = {
                id: Date.now() + 1,
                text: `📈 **Stock:** ${stockData.stock_name}\n\n🔍 **Action:** ${stockData.action.toUpperCase()}\n\n📊 **Details:** ${stockData.description}`,
                isBot: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botMessage]);
        } else {
            throw new Error("Invalid API response");
        }
  
    } catch (error) {
        console.error("Error fetching stock recommendation:", error);
        setMessages(prev => [...prev, { 
            id: Date.now() + 3,
            text: "⚠️ Oops! Couldn't fetch stock recommendations. Please try again later.",
            isBot: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    }
  
    setIsTyping(false);
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-md">
          <div className="flex items-center space-x-4">
            <TrendingUp size={32} />
            <div>
              <h2 className="text-3xl font-bold">StoxyGenius: Stock Recommendation Assistant</h2>
              <p className="text-sm">AI-powered stock portfolio insights</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start space-x-4 ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-2xl p-4 rounded-2xl shadow-lg ${
                      message.isBot
                        ? 'bg-white text-gray-800 border border-gray-200'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                  <span className="text-sm text-gray-400">{message.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center space-x-4">
                  <Loader className="animate-spin text-blue-500" />
                  <span className="text-gray-500">Typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about a stock..."
                  className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                  {isTyping ? <Loader className="animate-spin" /> : <Send />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialBot;
