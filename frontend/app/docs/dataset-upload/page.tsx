"use client";

import { motion } from "framer-motion";
import { Database, UploadCloud, CheckCircle2, ShieldAlert, FileType2, Terminal } from "lucide-react";
import React from "react";

export default function DatasetUploadPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 font-sans text-gray-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Database className="w-6 h-6 text-blue-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Dataset Upload</h1>
                </div>
                <p className="text-xl text-gray-400 leading-relaxed">
                    Learn how to securely upload your CSV files and understand how AGENTIQ handles parsing, validation, and storage.
                </p>
            </motion.div>

            <section className="mb-16">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">How it Works</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-4">
                         <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                            <FileType2 className="w-5 h-5 text-blue-400" />
                         </div>
                         <div>
                             <h3 className="text-white font-bold mb-2">1. Format Checking</h3>
                             <p className="text-sm">We strictly accept <code>.csv</code> files up to 500MB. The system validates headers and handles missing values automatically.</p>
                         </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-4">
                         <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <UploadCloud className="w-5 h-5 text-emerald-400" />
                         </div>
                         <div>
                             <h3 className="text-white font-bold mb-2">2. Secure Storage</h3>
                             <p className="text-sm">Files are stored temporarily in isolated memory instances for processing and are never used to train global models.</p>
                         </div>
                    </div>
                </div>
            </section>

            <section className="mb-16">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Developer Instructions</h2>
                <div className="p-1 border border-white/10 rounded-xl bg-[#0a0a0a] overflow-hidden mb-6">
                    <div className="flex items-center bg-white/5 px-4 py-2 border-b border-white/5">
                        <Terminal className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-xs text-gray-400 font-mono">Terminal</span>
                    </div>
                    <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                        <span className="text-purple-400">curl</span> -X POST <span className="text-green-400">"http://api.agentiq.ai/v1/datasets/upload"</span> \
                        <br/>
                        &nbsp;&nbsp;-H <span className="text-yellow-400">"Authorization: Bearer YOUR_API_KEY"</span> \
                        <br/>
                        &nbsp;&nbsp;-F <span className="text-blue-400">"file=@data.csv"</span>
                    </div>
                </div>
                
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                     <div className="flex items-center space-x-3 text-amber-500 mb-2">
                          <ShieldAlert className="w-5 h-5" />
                          <h3 className="font-bold">Best Practices for CSVs</h3>
                     </div>
                     <ul className="list-disc list-inside text-amber-200/70 text-sm space-y-2 mt-4 ml-2">
                         <li>Ensure the first row contains exact feature names.</li>
                         <li>Remove any complex nested JSON fields if you intend to use the classic ML models.</li>
                         <li>Encoding should be UTF-8 to prevent parsing crashes.</li>
                     </ul>
                </div>
            </section>
        </div>
    );
}
