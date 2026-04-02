"use client";

import { motion } from "framer-motion";
import { Bot, MessageSquareText, Search, Zap, Code2 } from "lucide-react";
import React, { useState } from "react";

export default function ChatAssistantPage() {
    const [demoState, setDemoState] = useState(0);

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 font-sans text-gray-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                        <Bot className="w-6 h-6 text-rose-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">AI Chat Assistant</h1>
                </div>
                <p className="text-xl text-gray-400 leading-relaxed">
                    A conversational interface powered by Retrieval-Augmented Generation (RAG). Talk to your data, run complex python queries safely, and build immediate insights.
                </p>
            </motion.div>

            <section className="mb-16">
                 <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Core Capabilities</h2>
                 <div className="grid gap-6 md:grid-cols-2">
                     <div className="p-6 rounded-2xl bg-[#111] border border-white/5 hover:border-rose-500/30 transition-colors">
                          <Search className="w-8 h-8 text-rose-400 mb-4" />
                          <h3 className="text-lg font-bold text-white mb-2">Contextual RAG</h3>
                          <p className="text-sm text-gray-400">The agent only answers based on the schema and contents of the datasets you uploaded in the active session.</p>
                     </div>
                     <div className="p-6 rounded-2xl bg-[#111] border border-white/5 hover:border-rose-500/30 transition-colors">
                          <Code2 className="w-8 h-8 text-rose-400 mb-4" />
                          <h3 className="text-lg font-bold text-white mb-2">Code Execution</h3>
                          <p className="text-sm text-gray-400">Under the hood, if the LLM determines a statistical calculation is needed, it generates and runs Python safely.</p>
                     </div>
                 </div>
            </section>

             <section>
                 <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" /> Interactive Demo
                 </h2>
                 <p className="mb-6 text-sm text-gray-400">Click the button below to see an example interaction.</p>
                 
                 <div className="bg-black/40 rounded-2xl border border-white/10 p-6 max-w-2xl">
                     <div className="space-y-4 mb-6">
                          {/* User Message */}
                          <div className="flex justify-end">
                               <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm">
                                   What is the average price of houses with more than 3 bedrooms?
                               </div>
                          </div>
                          
                          {/* Agent Thinking/Typing */}
                          {demoState === 1 && (
                               <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-sm max-w-[80%] flex items-center space-x-2">
                                        <Bot className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-mono text-gray-500 animate-pulse">Running query on DataFrame...</span>
                                    </div>
                               </div>
                          )}

                          {/* Agent Response */}
                          {demoState === 2 && (
                               <div className="flex justify-start">
                                    <div className="bg-white/10 text-white p-4 rounded-2xl rounded-tl-sm max-w-[80%] text-sm leading-relaxed border border-white/10 shadow-lg shadow-rose-500/5">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Bot className="w-4 h-4 text-rose-400" />
                                            <span className="font-bold text-rose-400">AGENTIQ</span>
                                        </div>
                                        Based on the current dataset, the average price for houses with strictly more than 3 bedrooms is <strong>$452,100</strong>. This calculation was aggregated across 1,204 rows matching your criteria.
                                    </div>
                               </div>
                          )}
                     </div>

                     <button 
                        onClick={() => {
                            if (demoState === 2) { setDemoState(0); return; }
                            setDemoState(1);
                            setTimeout(() => setDemoState(2), 1500);
                        }}
                        className="flex items-center justify-center w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium"
                     >
                         <MessageSquareText className="w-4 h-4 mr-2" /> 
                         {demoState === 2 ? "Reset Example" : "Show Example"}
                     </button>
                 </div>
            </section>
        </div>
    );
}
