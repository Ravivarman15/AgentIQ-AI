"use client";

import { motion } from "framer-motion";
import { BarChart3, ScatterChart, LineChart, PieChart, Layers } from "lucide-react";
import React from "react";

export default function VisualizationPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 font-sans text-gray-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                        <BarChart3 className="w-6 h-6 text-amber-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Visualization</h1>
                </div>
                <p className="text-xl text-gray-400 leading-relaxed">
                    Dynamically generate charts using Recharts. Discover trends, correlations, and outliers without writing complex plotting scripts.
                </p>
            </motion.div>

             <section className="mb-16">
                 <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Chart Types Available</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-amber-500/10 transition-colors">
                         <BarChart3 className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
                         <span className="text-sm font-bold text-white">Bar Charts</span>
                     </div>
                     <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-indigo-500/10 transition-colors">
                         <ScatterChart className="w-8 h-8 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                         <span className="text-sm font-bold text-white">Scatter Plots</span>
                     </div>
                     <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-emerald-500/10 transition-colors">
                         <LineChart className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                         <span className="text-sm font-bold text-white">Line Series</span>
                     </div>
                     <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-rose-500/10 transition-colors">
                         <PieChart className="w-8 h-8 text-rose-400 mb-3 group-hover:scale-110 transition-transform" />
                         <span className="text-sm font-bold text-white">Distributions</span>
                     </div>
                 </div>
            </section>

             <section>
                 <div className="p-8 rounded-2xl bg-gradient-to-r from-gray-900 to-black border border-white/10 shadow-2xl overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
                      <Layers className="w-10 h-10 text-white/20 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Automated Plot Selection</h3>
                      <p className="text-sm text-gray-400 max-w-xl leading-relaxed mb-6">
                          The Visualization Agent examines the cardinality and Data Types of your selected Features to automatically pick the most appropriate rendering mechanism. E.g it uses Box Plots to show numeric distribution against categorical variables.
                      </p>
                      <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-transparent"></div>
                 </div>
            </section>
        </div>
    );
}
