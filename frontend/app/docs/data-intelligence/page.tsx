"use client";

import { motion } from "framer-motion";
import { Sparkles, PieChart, Info, Activity } from "lucide-react";
import React from "react";

export default function DataIntelligencePage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 font-sans text-gray-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Data Intelligence</h1>
                </div>
                <p className="text-xl text-gray-400 leading-relaxed">
                    Automated Exploratory Data Analysis (EDA). AGENTIQ automatically infers statistical summaries, feature distributions, and calculates correlations.
                </p>
            </motion.div>

            <section className="mb-16">
                 <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Key Features</h2>
                 <div className="space-y-6">
                     <div className="p-6 rounded-xl bg-gradient-to-r from-purple-900/10 to-transparent border-l-4 border-purple-500">
                         <h3 className="text-lg font-bold text-purple-400 mb-2 flex items-center">
                             <Activity className="w-5 h-5 mr-2" /> Summary Statistics
                         </h3>
                         <p className="text-sm">Automatically view Row Counts, Feature Dimensions, Missing Value counts, and general Data Types across the entire uploaded corpus.</p>
                     </div>
                     <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-900/10 to-transparent border-l-4 border-indigo-500">
                         <h3 className="text-lg font-bold text-indigo-400 mb-2 flex items-center">
                             <PieChart className="w-5 h-5 mr-2" /> Automatic Target Inference
                         </h3>
                         <p className="text-sm">The agent attempts to understand what you might want to predict by scanning for common keywords like `price`, `churn`, or `status`. You can always override this.</p>
                     </div>
                 </div>
            </section>

             <section>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-4">
                     <div className="shrink-0 mt-1">
                          <Info className="w-6 h-6 text-gray-400" />
                     </div>
                     <div>
                         <h3 className="text-white font-bold mb-2">How to Use the Overview</h3>
                         <p className="text-sm mb-4">Once you upload a dataset, navigate to the <span className="text-blue-400 font-mono">Intelligence Profile</span> tab. The data will visually render inside interactive tables. You do not need to trigger this manually.</p>
                         <div className="bg-black/40 p-4 rounded-lg border border-white/5 inline-block">
                             <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Pro Tip</span>
                             <p className="text-sm mt-1">Check the warnings section immediately. High cardinalities or massive imbalances will be flagged here before training models.</p>
                         </div>
                     </div>
                </div>
            </section>
        </div>
    );
}
