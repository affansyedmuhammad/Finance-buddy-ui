import React, { useState, useRef, useEffect } from 'react';
import { Send, TrendingUp, Loader } from "lucide-react";

function StockAssistant() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi! I'm your Stock Analysis Assistant. Tell me which stock you're interested in!", 
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchStockAnalysis = async (input) => {
    try {
      const encodedInput = encodeURIComponent(input);
      const apiUrl = `http://52.55.238.38:80/stock_recommendation?user_input=${encodedInput}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`There was an error in processing the data. Please try again later`);
      }
      
      const data = await response.json();
      
      // Validate the response data
      if (!Array.isArray(data)) {
        throw new Error('There was an error in processing the data. Please try again later');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching stock analysis:', error);
      return [{ 
        error: error.message || 'Failed to fetch stock analysis. Please try again.' 
      }];
    }
  };

  const sendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage = {
      id: Date.now(),
      text: trimmedInput,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Add a small delay before making the API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const analysisData = await fetchStockAnalysis(trimmedInput);
      
      // Add another small delay after getting the response
      await new Promise(resolve => setTimeout(resolve, 500));

      const botMessage = {
        id: Date.now() + 1,
        text: analysisData && analysisData[0]?.error 
          ? "Sorry, I encountered an error while analyzing the stock."
          : "Here's my analysis for your request:",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stockData: analysisData
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, something went wrong. Please try again later.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stockData: [{ error: 'Failed to process request' }]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const StockAnalysis = ({ stocks }) => {
    // Check if stocks is undefined or null
    if (!stocks) {
      return (
        <div className="bg-red-50 p-6 rounded-xl">
          <p className="text-red-600">No data available.</p>
        </div>
      );
    }

    // Check if it's an array and has items
    if (!Array.isArray(stocks) || stocks.length === 0) {
      return (
        <div className="bg-red-50 p-6 rounded-xl">
          <p className="text-red-600">No stock analysis available.</p>
        </div>
      );
    }

    // Check if the first item has an error
    if (stocks[0]?.error) {
      return (
        <div className="bg-red-50 p-6 rounded-xl">
          <p className="text-red-600">
            {stocks[0].error}
          </p>
        </div>
      );
    }

    const mainStock = stocks[0];
    const correlatedStocks = stocks.slice(1);

    return (
      <div className="backdrop-blur-xl bg-grey/320 rounded-2xl shadow-xl p-8 space-y-6 border border-white/20">
        {/* Main Stock Analysis */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Analysis for {mainStock.stock_name}
              </h3>
            </div>
            <div className={`px-6 py-2 rounded-xl text-sm font-medium transform transition-all duration-200 hover:scale-105 ${
              mainStock.action === 'buy' 
                ? 'bg-green-100/80 text-green-700 ring-1 ring-green-700/20'
                : mainStock.action === 'sell'
                ? 'bg-red-100/80 text-red-700 ring-1 ring-red-700/20'
                : 'bg-yellow-100/80 text-yellow-700 ring-1 ring-yellow-700/20'
            }`}>
              {mainStock.action.toUpperCase()}
            </div>
          </div>
          <div class="relative bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-gray-600 leading-relaxed text-lg">{mainStock.description}</p>
          </div>
        </div>

        {/* Correlated Stocks */}
        {correlatedStocks.length > 0 && (
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="font-bold text-gray-800 text-lg">Correlated Stocks</h3>
                <p className="text-gray-500 mt-1">Related market analysis</p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {correlatedStocks.map((stock) => (
                <div key={stock.stock_name} 
                     className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] transform">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {stock.stock_name}
                      </span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-lg text-sm font-medium transform transition-all duration-200 hover:scale-105 ${
                      stock.action === 'buy' ? 'bg-green-100/80 text-green-700 ring-1 ring-green-700/20' : 
                      stock.action === 'sell' ? 'bg-red-100/80 text-red-700 ring-1 ring-red-700/20' : 
                      'bg-yellow-100/80 text-yellow-700 ring-1 ring-yellow-700/20'
                    }`}>
                      {stock.action.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">{stock.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-purple-100">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
          <div className="relative py-8 px-6">
            <div className="max-w-7xl mx-auto flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <TrendingUp size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Stock Analysis Assistant</h2>
                <p className="text-blue-100">AI-Powered Market Insights & Recommendations</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {messages.map((message) => (
                <div key={message.id} className="transform transition-all duration-500 ease-out animate-fade-in">
                  <div className={`flex items-start space-x-4 ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    {message.isBot ? (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200">
                        <TrendingUp size={24} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200 order-2">
                        <Send size={24} className="text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-2xl ${message.isBot ? '' : 'order-1'}`}>
                      <div className={`p-6 rounded-2xl shadow-lg backdrop-blur-sm ${
                        message.isBot
                          ? 'bg-white/80 text-gray-800 rounded-bl-none'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                      }`}>
                        {message.text}
                      </div>
                      <div className={`text-sm text-gray-400 mt-2 ${message.isBot ? 'text-left' : 'text-right'}`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                  
                  {message.stockData && (
                    <div className="mt-8 ml-16 max-w-4xl transform transition-all duration-500 ease-out animate-fade-in">
                      <StockAnalysis stocks={message.stockData} />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg inline-flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 backdrop-blur-xl"></div>
              <div className="relative border-t border-white/20 bg-white/60 p-8">
                <div className="max-w-7xl mx-auto">
                  <form onSubmit={handleSubmit} className="flex space-x-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about any stock..."
                      className="flex-1 p-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 shadow-sm hover:border-gray-300 transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : <Send size={24} />}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockAssistant;