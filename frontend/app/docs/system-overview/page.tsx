"use client";

import { motion } from "framer-motion";
import { Workflow, Database, Sparkles, Brain, Bot, BarChart3, FileText, ArrowRight, Server, ShieldCheck } from "lucide-react";
import React from "react";

export default function SystemOverviewPage() {
    const pipelineSteps = [
        { id: 1, name: "Data Ingestion", icon: Database, desc: "Secure upload & validation of CSV datasets. Hands-off parsing and indexing.", color: "text-blue-400", bg: "bg-blue-500/10" },
        { id: 2, name: "Data Intelligence", icon: Sparkles, desc: "Autonomous EDA, feature correlation, and data quality assessment.", color: "text-purple-400", bg: "bg-purple-500/10" },
        { id: 3, name: "Model Training", icon: Brain, desc: "Automated ML pipeline via PyCaret to train and tune the best models.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { id: 4, name: "Interactive Analysis", icon: Bot, desc: "RAG-powered conversational interface to query data using natural language.", color: "text-rose-400", bg: "bg-rose-500/10" },
        { id: 5, name: "Insights Generation", icon: FileText, desc: "Automated comprehensive PDF reports summarizing findings and models.", color: "text-amber-400", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Workflow className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">System Overview</h1>
                </div>
                <p className="text-xl text-gray-400 leading-relaxed">
                    AGENTIQ AI is an autonomous, multi-agent system designed to democratize machine learning and data analysis. Understand the architecture powering your insights.
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-2xl bg-[#111] border border-white/5 mb-16 relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none"></div>
                
                <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                    <Server className="w-6 h-6 mr-3 text-indigo-400" />
                    The Agent Pipeline
                </h2>

                <div className="relative">
                    {/* Visual connecting line */}
                    <div className="hidden md:block absolute left-[28px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500/30 via-emerald-500/30 to-amber-500/30"></div>

                    <div className="space-y-8 relative z-10">
                        {pipelineSteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.id} className="flex flex-col md:flex-row gap-6 items-start md:items-center group">
                                    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg relative ${step.bg}`}>
                                        <Icon className={`w-6 h-6 ${step.color}`} />
                                    </div>
                                    <div className="flex-1 p-6 rounded-xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] group-hover:border-white/10 transition-all">
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between">
                                            {step.name}
                                            <span className="text-xs font-mono font-medium text-gray-500 bg-black/50 px-2 py-1 rounded">Agent 0{step.id}</span>
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 rounded-2xl bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/20"
                >
                    <ShieldCheck className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">Data Privacy First</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Your datasets are processed in isolated environments. We employ strict encryption in transit and at rest. The RAG system only contextualizes answers based on your specific uploaded context window.
                    </p>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-8 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/20"
                >
                    <BarChart3 className="w-8 h-8 text-emerald-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">Scalable Infrastructure</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Built on a robust microservices architecture. The ML training pipelines utilize distributed computing to ensure fast iteration regardless of dataset size.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
