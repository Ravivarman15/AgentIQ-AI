"use client";
import { motion } from "framer-motion";
import { 
    Database, 
    Brain, 
    Bot, 
    BarChart3, 
    FileText, 
    Workflow,
    ArrowRight,
    Sparkles,
    Lightbulb,
    Zap
} from "lucide-react";
import Link from "next/link";
import React from "react";

const cards = [
    {
        title: "System Architecture",
        description: "Understand how the autonomous agent swarm orchestrates data workflows.",
        icon: Workflow,
        href: "/docs/system-overview",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "group-hover:border-indigo-500/50"
    },
    {
        title: "Dataset Upload",
        description: "Learn how to securely upload, validate, and manage your CSV datasets.",
        icon: Database,
        href: "/docs/dataset-upload",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "group-hover:border-blue-500/50"
    },
    {
        title: "Data Intelligence",
        description: "Explore automated EDA, feature importance, and correlations.",
        icon: Sparkles,
        href: "/docs/data-intelligence",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "group-hover:border-purple-500/50"
    },
    {
        title: "Machine Learning",
        description: "Train, evaluate, and tune models automatically with PyCaret.",
        icon: Brain,
        href: "/docs/machine-learning",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "group-hover:border-emerald-500/50"
    },
    {
        title: "AI Chat Assistant",
        description: "Interact with your data using natural language and our RAG agent.",
        icon: Bot,
        href: "/docs/chat-assistant",
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "group-hover:border-rose-500/50"
    },
    {
        title: "Visualization & Reports",
        description: "Generate beautiful charts and comprehensive PDF analysis reports.",
        icon: BarChart3,
        href: "/docs/visualization",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "group-hover:border-amber-500/50"
    }
];

const steps = [
    { num: "01", title: "Upload Dataset", desc: "Start by dropping your CSV file.", icon: Database },
    { num: "02", title: "Review Intelligence", desc: "Let AI analyze your features.", icon: Sparkles },
    { num: "03", title: "Train Model", desc: "Automatically find the best ML model.", icon: Brain },
    { num: "04", title: "Ask Questions", desc: "Chat with your data seamlessly.", icon: Bot },
];

export default function DocsPage() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-12 md:px-12 md:py-20 font-sans">
            {/* Header Section */}
            <header className="mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                        <Zap className="w-4 h-4" />
                        <span>Interactive Guides</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                        Documentation Hub
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
                        Everything you need to build, understand, and scale intelligent data workflows with AGENTIQ AI.
                    </p>
                </motion.div>
            </header>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <Link href={card.href} key={i}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`group h-full p-6 rounded-2xl bg-[#111] border border-white/5 hover:bg-[#151515] transition-all duration-300 relative overflow-hidden ${card.border}`}
                            >
                                {/* Decorative background glow on hover */}
                                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-[60px] transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${card.bg}`} />
                                
                                <div className="relative z-10">
                                    <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center border border-white/5 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${card.bg}`}>
                                        <Icon className={`w-6 h-6 ${card.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                        {card.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed text-sm mb-6">
                                        {card.description}
                                    </p>
                                    <div className={`mt-auto inline-flex items-center text-sm font-medium ${card.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                        Explore Guide
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    )
                })}
            </div>

            {/* Step-by-Step Workflow Preview */}
            <motion.section 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="relative w-full rounded-3xl bg-gradient-to-b from-gray-900 to-black border border-white/10 p-8 md:p-12 overflow-hidden mb-24"
            >
                <div className="absolute top-0 left-1/2 -ml-[250px] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">
                        <Lightbulb className="w-8 h-8 mr-3 text-yellow-400" />
                        How AGENTIQ AI Works
                    </h2>
                    <p className="text-gray-400 max-w-xl">
                        A seamless, automated pipeline from raw data to actionable intelligence in 4 easy steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    {steps.map((step, i) => {
                        const StepIcon = step.icon;
                        return (
                             <div key={i} className="relative p-6 rounded-2xl bg-white/5 border border-white/10 group hover:border-blue-500/30 transition-colors">
                                <div className="text-[60px] font-black text-white/[0.03] absolute top-2 right-4 pointer-events-none select-none">
                                    {step.num}
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                                    <StepIcon className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                                <p className="text-sm text-gray-400">{step.desc}</p>
                             </div>
                        );
                    })}
                </div>
            </motion.section>
        </div>
    );
}
