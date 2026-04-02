"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    Book, 
    Database, 
    Brain, 
    Bot, 
    BarChart3, 
    FileText, 
    Workflow,
    Menu,
    X,
    Search,
    Sparkles,
    ChevronRight,
    LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AskAIModal } from "./components/AskAIModal";

const sidebarLinks = [
    { name: "Home", href: "/docs", icon: Book },
    { name: "System Overview", href: "/docs/system-overview", icon: Workflow },
    { name: "Dataset Upload", href: "/docs/dataset-upload", icon: Database },
    { name: "Data Intelligence", href: "/docs/data-intelligence", icon: Sparkles },
    { name: "Machine Learning", href: "/docs/machine-learning", icon: Brain },
    { name: "AI Chat Assistant", href: "/docs/chat-assistant", icon: Bot },
    { name: "Visualization", href: "/docs/visualization", icon: BarChart3 },
    { name: "Report Generation", href: "/docs/report-generation", icon: FileText },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans selection:bg-blue-500/30">
            <AskAIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
            
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl relative z-20">
                <div className="p-6 flex flex-col h-full">
                    <Link href="/" className="flex items-center space-x-3 mb-8 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            AGENTIQ AI
                        </span>
                    </Link>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search guides..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-500"
                        />
                    </div>

                    <nav className="space-y-1 flex-1 overflow-y-auto pr-2 scrollbar-premium">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-3">
                            App
                        </div>
                        <Link
                            href="/"
                            prefetch={true}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-6 group border border-white/5 hover:border-blue-500/30"
                        >
                            <LayoutGrid className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
                            <span className="text-sm font-medium">Back to Workspace</span>
                        </Link>

                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-3">
                            Documentation
                        </div>
                        {sidebarLinks.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            
                            if (searchQuery && !link.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                                return null;
                            }

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    prefetch={true}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                                        isActive 
                                            ? "bg-blue-500/10 text-blue-400 font-medium" 
                                            : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}`} />
                                    <span className="text-sm">{link.name}</span>
                                    {isActive && (
                                        <motion.div 
                                            layoutId="active-indicator"
                                            className="absolute left-0 w-1 h-2/3 bg-blue-500 rounded-r-full"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen">
                {/* Persistent Top Header (Highlighted Ask AI) */}
                <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 relative z-30">
                    <div className="hidden md:block">
                         {/* Breadcrumbs or section title could go here */}
                         <div className="flex items-center space-x-2 text-xs text-gray-400">
                             <span>Docs</span>
                             <ChevronRight className="w-3 h-3" />
                             <span className="text-gray-200 font-medium capitalize">
                                 {pathname.split('/').pop()?.replace(/-/g, ' ') || 'Home'}
                             </span>
                         </div>
                    </div>
                    
                    <div className="md:hidden flex items-center space-x-3">
                        <Link href="/docs" className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold">AGENTIQ</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* THE HIGHLIGHTED ASK AI BUTTON */}
                        <button 
                            onClick={() => setIsAIModalOpen(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span>Docs AI</span>
                        </button>

                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto relative scroll-smooth bg-[#080808]">
                    {/* Background noise and gradient */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-600/5 via-transparent to-transparent pointer-events-none"></div>
                    
                    {/* Client-side transitions wrapper */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="relative z-10 w-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 bottom-0 w-80 bg-gray-950 border-r border-white/10 p-6 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <Link href="/docs" className="flex items-center space-x-2">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xl font-bold">AGENTIQ</span>
                                </Link>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 active:bg-white/10 rounded-lg">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <nav className="space-y-2 flex-1 overflow-y-auto">
                                <Link
                                    href="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-4 rounded-xl text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-6"
                                >
                                    <LayoutGrid className="w-5 h-5" />
                                    <span className="font-bold">Back to Product</span>
                                </Link>
                                
                                {sidebarLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                                                isActive 
                                                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold" 
                                                    : "text-gray-300 hover:bg-white/5"
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium text-sm">{link.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
