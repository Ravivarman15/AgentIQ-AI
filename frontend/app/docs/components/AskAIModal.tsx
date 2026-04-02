"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, X, Send, User } from "lucide-react";

export function AskAIModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState([
        { role: "agent", content: "Hi! I'm the AGENTIQ Docs AI. What do you need help with?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsTyping(true);

        // Mock simple responses based on documentation concepts
        setTimeout(() => {
            let response = "I don't have that information right now, but you can check our left sidebar for all available guides.";
            
            const lowerMsg = userMsg.toLowerCase();
            if (lowerMsg.includes("train") || lowerMsg.includes("model")) {
                response = "To train a model automatically, navigate to the Machine Learning tab after uploading your dataset. You simply select your Target column, and PyCaret runs dozens of models in parallel!";
            } else if (lowerMsg.includes("upload") || lowerMsg.includes("dataset")) {
                response = "You can upload a CSV file up to 500MB. Make sure the headers are clear and there are no complex nested JSON structures in the cells. Go to the Dataset Upload guide for the cURL API example.";
            } else if (lowerMsg.includes("report") || lowerMsg.includes("pdf")) {
                response = "You can generate a PDF report anytime by clicking the 'Generate PDF' button in the Reports section. It compiles EDA, Model metrics, and AI summaries.";
            } else if (lowerMsg.includes("chat") || lowerMsg.includes("rag")) {
                response = "Our Chat Assistant uses RAG (Retrieval-Augmented Generation). It reads your specific CSV data and can even execute Python under the hood to calculate answers.";
            }

            setMessages(prev => [...prev, { role: "agent", content: response }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    {/* Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
                             <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center p-1.5">
                                      <Bot className="w-full h-full text-white" />
                                  </div>
                                  <div>
                                       <h3 className="font-bold text-white leading-tight">Docs AI</h3>
                                       <p className="text-xs text-indigo-400 flex items-center">
                                           <Sparkles className="w-3 h-3 mr-1" /> Ready to help
                                       </p>
                                  </div>
                             </div>
                             <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                 <X className="w-5 h-5" />
                             </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm flex items-start space-x-2 ${
                                        msg.role === "user" 
                                            ? "bg-indigo-600 text-white rounded-tr-sm" 
                                            : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm"
                                    }`}>
                                        {msg.role === "agent" && <Bot className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />}
                                        {msg.role === "user" && <User className="w-4 h-4 shrink-0 mt-0.5 text-indigo-200" />}
                                        <div className="leading-relaxed">{msg.content}</div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-sm flex items-center space-x-2">
                                        <Bot className="w-4 h-4 text-indigo-400" />
                                        <div className="flex space-x-1">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black/20">
                             <div className="relative">
                                  <input 
                                      type="text"
                                      value={input}
                                      onChange={(e) => setInput(e.target.value)}
                                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                      placeholder="Ask about training a model..."
                                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder:text-gray-500"
                                  />
                                  <button 
                                      onClick={handleSend}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white transition-colors"
                                  >
                                      <Send className="w-4 h-4" />
                                  </button>
                             </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
